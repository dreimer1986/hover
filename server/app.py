"""Hover replacement multiplayer service. Protocol v4, no Microsoft services.

Movement remains client-simulated. Rooms, teams, flags and item ownership are
server-managed; this is intended for casual play, not authoritative anti-cheat.
"""
import asyncio
from contextlib import suppress
import json
import math
import os
from pathlib import Path
import secrets
import string
import time

from aiohttp import web, WSMsgType

MAPS = json.loads(Path(__file__).with_name('maps.json').read_text())
VERSION = '0.6.1'
try:
    from .crafts import validate as validate_craft, POLICY as CRAFT_POLICY
except ImportError:
    from crafts import validate as validate_craft, POLICY as CRAFT_POLICY


def number(value, limit=100000):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or abs(value) > limit:
        raise ValueError('Invalid number')
    return value


def vector(value, limit=100000):
    if not isinstance(value, dict):
        raise ValueError('Invalid vector')
    return {k: number(value[k], limit) for k in ('X', 'Y', 'Z')}


def distance(a, b):
    return math.sqrt(sum((a[k] - b[k]) ** 2 for k in ('X', 'Y', 'Z')))


def select_flags(locations, count):
    """Share elevated locations fairly; preserve unique positions and team counts."""
    unique = {(p['X'], p['Y'], p['Z']): p for p in locations}
    high = [p for p in unique.values() if p['Y'] > 32]
    low = [p for p in unique.values() if p['Y'] <= 32]
    rng = secrets.SystemRandom()
    rng.shuffle(high)
    rng.shuffle(low)
    result, counts = [], {'RED': 0, 'BLUE': 0}
    team = rng.choice(('RED', 'BLUE'))
    elevated, rest = high[:2 * (count - 1)], high[2 * (count - 1):]
    for point in elevated:
        result.append(dict(point, Team=team))
        counts[team] += 1
        team = 'BLUE' if team == 'RED' else 'RED'
    remaining = low + rest
    rng.shuffle(remaining)
    for point in remaining:
        if counts[team] >= count:
            team = 'BLUE' if team == 'RED' else 'RED'
        if counts[team] >= count:
            break
        result.append(dict(point, Team=team))
        counts[team] += 1
        team = 'BLUE' if team == 'RED' else 'RED'
    return result

class Client:
    def __init__(self, ws):
        self.bot = False
        self.ws = ws
        self.id = secrets.token_hex(8)
        self.room = None
        self.ready = False
        self.lobby_ready = False
        self.resume_token = secrets.token_urlsafe(32)
        self.disconnected_at = None
        self.chat_at = 0
        self.state = None
        self.tokens = 100.0
        self.last = time.monotonic()

    async def send(self, data):
        if not self.ws.closed:
            try:
                await asyncio.wait_for(self.ws.send_json(data), 2)
            except (TimeoutError, ConnectionError, RuntimeError):
                await self.ws.close()


class Bot(Client):
    """A lobby participant simulated by its host using the normal browser physics."""
    def __init__(self, room, team, index):
        super().__init__(None)
        self.bot = True
        self.id = 'bot_' + self.id
        self.room, self.team = room, team
        self.name = f'Bot {team[0]}{index}'
        self.profile = 0
        self.lobby_ready = True

    async def send(self, data):
        if self.room and data.get('event') in ('awardPod', 'onHit', 'hitByBullet', 'bulletDestroyed'):
            owner = next((p for p in self.room['players'] if p.id == self.room['host'] and not p.bot), None)
            if owner:
                await owner.send({'event': 'botEvent', 'args': [self.id, data['event'], data['args']]})


class Service:
    def __init__(self):
        self.rooms = {}
        self.clients = set()
        self.sessions = {}
        self.tasks = set()
        self.countdown_seconds = 3
        self.reconnect_seconds = 30
        self.max_rooms = int(os.getenv('MAX_ROOMS', '32'))
        self.max_clients = int(os.getenv('MAX_CLIENTS', '256'))

    async def broadcast(self, room, event, *args, exclude=None):
        await asyncio.gather(*(c.send({'event': event, 'args': args}) for c in list(room['players']) if c is not exclude))

    def info(self, room):
        return {'code': room['code'], 'maze': room['maze'], 'capacity': room['capacity'],
                'host': room['host'], 'phase': room['phase'], 'round': room['round'],
                'name': room['name'], 'public': room['public'], 'rotation': room.get('rotation', []), 'votes': room.get('votes', {}),
                'crafts': [{k: m[k] for k in ('hash', 'id', 'name')} for m in room['crafts'].values()],
                'flagCount': room['flagCount'], 'retro': room['retro'], 'lastResult': room['lastResult'],
                'aiDifficulty': room.get('aiDifficulty', 'normal'),
                'players': [{'bot': c.bot, 'id': c.id, 'name': c.name, 'team': c.team, 'ready': c.ready, 'lobbyReady': c.lobby_ready, 'connected': c.disconnected_at is None, 'profile': c.profile} for c in room['players']]}

    async def leave(self, client):
        self.sessions.pop(client.resume_token, None)
        room, client.room = client.room, None
        client.ready = False
        client.state = None
        if room is None:
            return
        room['players'].remove(client)
        room.get('votes', {}).pop(client.id, None)
        if not any(not p.bot for p in room['players']):
            self.rooms.pop(room['code'], None)
            return
        if room['host'] == client.id:
            room['host'] = next(p.id for p in room['players'] if not p.bot)
        if room['phase'] in ('countdown', 'loading', 'playing'):
            # Explicitly end interrupted rounds rather than leave a frozen lobby
            # or grant a win merely because a network connection disappeared.
            room['phase'] = 'waiting'
            room['lastResult'] = 'aborted'
            for player in room['players']: player.lobby_ready = player.bot
            await self.broadcast(room, 'roundAborted', self.info(room))
        await self.broadcast(room, 'lobby', self.info(room))

    def playing(self, client):
        if not client.room or client.room['phase'] != 'playing' or not client.ready:
            raise ValueError('Round is not running')
        return client.room

    async def call(self, c, method, args):
        if method == 'ping':
            return True
        if method == 'resume':
            old = self.sessions.get(args[0])
            if c.room or not old or old.disconnected_at is None or time.monotonic() - old.disconnected_at > self.reconnect_seconds or not old.room:
                raise ValueError('Session expired')
            room = old.room
            for key in ('id', 'name', 'profile', 'team', 'ready', 'lobby_ready', 'state', 'resume_token', 'room'):
                setattr(c, key, getattr(old, key))
            room['players'][room['players'].index(old)] = c
            old.room = None
            if room['phase'] == 'loading': c.ready = False
            self.sessions[c.resume_token] = c
            await self.broadcast(room, 'lobby', self.info(room))
            return {'id': c.id, 'room': self.info(room), 'token': c.resume_token, 'flags': room['flags'], 'pods': room['pods']}
        if method in ('setReady', 'voteMap', 'rotation', 'kick', 'quickMessage'):
            room = c.room
            if not room: raise ValueError('Join a lobby first')
            if method == 'quickMessage':
                if args[0] not in ('hello', 'ready', 'help', 'defend', 'attack', 'thanks', 'gg'): raise ValueError('Unknown message')
                if time.monotonic() - c.chat_at < 2: raise ValueError('Please wait before sending another message')
                c.chat_at = time.monotonic()
                await self.broadcast(room, 'quickMessage', c.name, args[0])
                return True
            if method == 'kick':
                if room['host'] != c.id: raise ValueError('Only the host may remove players')
                target = next((p for p in room['players'] if p.id == args[0] and p is not c), None)
                if not target: raise ValueError('Unknown player')
                await target.send({'event': 'kicked', 'args': []})
                await self.leave(target)
                if target.ws: await target.ws.close()
                return True
            if room['phase'] != 'waiting': raise ValueError('Wait until the round ends')
            if method == 'setReady':
                if type(args[0]) is not bool: raise ValueError('Invalid ready state')
                c.lobby_ready = args[0]
            elif method == 'voteMap':
                if str(args[0]) not in MAPS: raise ValueError('Unknown map')
                room['votes'][c.id] = args[0]
            else:
                if room['host'] != c.id: raise ValueError('Only the host may set the rotation')
                rotation = args[0]
                if not isinstance(rotation, list) or len(rotation) > len(MAPS) or any(type(m) is not int or str(m) not in MAPS for m in rotation) or len(set(rotation)) != len(rotation): raise ValueError('Invalid rotation')
                room['rotation'] = rotation
            await self.broadcast(room, 'lobby', self.info(room))
            return True
        if method == 'listRooms':
            return [{'code': r['code'], 'name': r['name'], 'players': len(r['players']), 'capacity': r['capacity'], 'maze': r['maze'], 'retro': r['retro'], 'flagCount': r['flagCount']} for r in self.rooms.values() if r['public'] and r['players'] and r['phase'] == 'waiting' and len(r['players']) < r['capacity']]
        if method == 'createGame':
            maze, flags, team_size = args[:3]
            settings = args[3] if len(args) > 3 else {}
            if not isinstance(settings, dict) or not set(settings) <= {'name', 'public'}:
                raise ValueError('Invalid lobby settings')
            name = settings.get('name', 'Hover Lobby')
            public = settings.get('public', False)
            if not isinstance(name, str) or not 1 <= len(name.strip()) <= 40 or not name.isprintable() or type(public) is not bool:
                raise ValueError('Invalid lobby name or visibility')
            if str(maze) not in MAPS or type(team_size) is not int or not 1 <= team_size <= 4 or type(flags) is not int or not 3 <= flags <= 6:
                raise ValueError('Invalid room settings')
            if c.room:
                raise ValueError('Leave the current room first')
            if any(r['owner'] == c.id and not r['players'] for r in self.rooms.values()):
                raise ValueError('Join your existing room first')
            if len(self.rooms) >= self.max_rooms:
                raise ValueError('Server is full')
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            while code in self.rooms:
                code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            room = {'code': code, 'maze': maze, 'capacity': team_size * 2, 'host': c.id,
                    'players': [], 'phase': 'waiting', 'created': time.monotonic(), 'flags': [], 'pods': [], 'bullets': {},
                    'name': name.strip(), 'public': public, 'crafts': {},
                    'round': 0, 'flagCount': flags, 'retro': False, 'lastResult': None,
                    'aiDifficulty': 'normal', 'rotation': [], 'votes': {}, 'scores': {}, 'teamWins': {'RED': 0, 'BLUE': 0}}
            # An unjoined reservation is bound to this socket and expires too.
            room['owner'] = c.id
            self.rooms[code] = room
            return code
        if method == 'join':
            code, profile, name = args
            if c.room or not isinstance(code, str) or not isinstance(name, str) or type(profile) is not int or profile not in (0, 1, 2):
                raise ValueError('Invalid player')
            name = ''.join(ch for ch in name.strip() if ch.isprintable())[:24]
            if not name:
                raise ValueError('Enter a player name')
            room = self.rooms.get(code.upper())
            if not room or room['phase'] != 'waiting':
                raise ValueError('Room not found or already started')
            if len(self.sessions) >= self.max_clients:
                raise ValueError('Server is full')
            if len(room['players']) >= room['capacity']:
                raise ValueError('Room is full')
            c.name, c.profile = name, profile
            c.team = 'RED' if sum(p.team == 'RED' for p in room['players']) <= sum(p.team == 'BLUE' for p in room['players']) else 'BLUE'
            c.room = room
            room['players'].append(c)
            room['scores'][c.id] = {'id': c.id, 'name': c.name, 'flags': 0, 'wins': 0}
            if len(room['players']) == 1:
                room['host'] = c.id
            await self.broadcast(room, 'lobby', self.info(room))
            self.sessions[c.resume_token] = c
            return {'id': c.id, 'room': self.info(room), 'token': c.resume_token}
        if method in ('shareCraft', 'getCraft', 'selectCraft', 'renameLobby'):
            room = c.room
            if not room:
                raise ValueError('Join a lobby first')
            if method == 'getCraft':
                if args[0] not in room['crafts']: raise ValueError('Unknown craft')
                return room['crafts'][args[0]]['json']
            if room['phase'] != 'waiting': raise ValueError('Wait until the round ends')
            if method == 'selectCraft':
                ident = args[0]
                if type(ident) is not int or ident not in [0,1,2]+[m['id'] for m in room['crafts'].values()]: raise ValueError('Unknown craft')
                c.profile = ident
                c.lobby_ready = False
            else:
                if room['host'] != c.id: raise ValueError('Only the host may share crafts or rename the lobby')
                if method == 'renameLobby':
                    name, public = args
                    if not isinstance(name,str) or not 1<=len(name.strip())<=40 or not name.isprintable() or type(public) is not bool: raise ValueError('Invalid lobby settings')
                    room.update(name=name.strip(), public=public)
                else:
                    model = validate_craft(args[0])
                    if model['hash'] in room['crafts']: return model['hash']
                    if len(room['crafts']) >= CRAFT_POLICY['maxShared'] or sum(m['bytes'] for m in room['crafts'].values())+model['bytes']>CRAFT_POLICY['maxRoomBytes']: raise ValueError('Lobby craft storage limit reached')
                    if any(m['id']==model['id'] for m in room['crafts'].values()): raise ValueError('Craft identifier collision')
                    room['crafts'][model['hash']] = model
            await self.broadcast(room, 'lobby', self.info(room))
            return True
        if method == 'leave':
            await self.leave(c)
            return True
        if method in ('chooseTeam', 'configureRoom', 'configureBots', 'closeLobby'):
            room = c.room
            if not room or room['phase'] != 'waiting':
                raise ValueError('Wait until the round has ended')
            if method == 'chooseTeam':
                team = args[0]
                if team not in ('RED', 'BLUE'):
                    raise ValueError('Invalid team')
                if sum(p.team == team and p is not c for p in room['players']) >= 4:
                    raise ValueError('A team can contain at most four players')
                c.team = team
                c.lobby_ready = False
            else:
                if room['host'] != c.id:
                    raise ValueError('Only the host can change the lobby')
                if method == 'configureRoom':
                    maze, count, retro = args
                    if str(maze) not in MAPS or type(count) is not int or not 3 <= count <= 6 or type(retro) is not bool:
                        raise ValueError('Invalid round settings')
                    room.update(maze=maze, flagCount=count, retro=retro)
                    for player in room['players']: player.lobby_ready = player.bot
                elif method == 'configureBots':
                    red, blue, difficulty = args
                    if type(red) is not int or type(blue) is not int or not 0 <= red <= 4 or not 0 <= blue <= 4 or difficulty not in ('easy', 'normal', 'hard'):
                        raise ValueError('Invalid bot settings')
                    humans = [p for p in room['players'] if not p.bot]
                    if len(humans) + red + blue > room['capacity'] or any(sum(p.team == team for p in humans) + count > 4 for team, count in [('RED', red), ('BLUE', blue)]):
                        raise ValueError('Bots need free lobby/team slots (maximum four per team)')
                    for team, count in [('RED', red), ('BLUE', blue)]:
                        bots = [p for p in room['players'] if p.bot and p.team == team]
                        for bot in bots[count:]:
                            room['players'].remove(bot)
                            bot.room = None
                        for i in range(len(bots), count):
                            bot = Bot(room, team, i + 1)
                            room['players'].append(bot)
                            room['scores'][bot.id] = {'id': bot.id, 'name': bot.name, 'flags': 0, 'wins': 0}
                    room['aiDifficulty'] = difficulty
                    for player in room['players']: player.lobby_ready = player.bot
                else:
                    result = {'rounds': room['round'], 'teamWins': room['teamWins'], 'players': list(room['scores'].values())}
                    room['phase'] = 'closed'
                    members = list(room['players'])
                    for member in members:
                        member.room = None
                        self.sessions.pop(member.resume_token, None)
                    self.rooms.pop(room['code'], None)
                    await self.broadcast(room, 'lobbyClosed', result)
                    room['players'].clear()
                    return True
            await self.broadcast(room, 'lobby', self.info(room))
            return True
        if method == 'beginRoom':
            room = c.room
            if not room or room['host'] != c.id or room['phase'] != 'waiting':
                raise ValueError('Only the host can start a waiting room')
            if len({p.team for p in room['players']}) != 2:
                raise ValueError('Both teams need at least one player')
            if not all(p.lobby_ready and p.disconnected_at is None for p in room['players']):
                raise ValueError('All players must be ready and connected')
            if room['votes']:
                counts = {m: sum(v == m for v in room['votes'].values()) for m in map(int, MAPS)}
                best = max(counts.values())
                if counts.get(room['maze'], 0) != best:
                    room['maze'] = next(m for m in counts if counts[m] == best)
            room['votes'] = {}
            room['phase'] = 'countdown'
            await self.broadcast(room, 'lobby', self.info(room))
            async def countdown():
                for seconds in range(self.countdown_seconds, 0, -1):
                    if room['phase'] != 'countdown': return
                    await self.broadcast(room, 'countdown', seconds)
                    await asyncio.sleep(1)
                if room['phase'] == 'countdown': await self.launch(room)
            task = asyncio.create_task(countdown())
            self.tasks.add(task)
            task.add_done_callback(self.tasks.discard)
            return True
        if method == 'spawnMe':
            room = c.room
            if not room or room['phase'] != 'loading' or c.ready:
                raise ValueError('Unexpected spawn request')
            spawn = self.spawn_state(room, c)
            await c.send({'event': 'spawnAt', 'args': [spawn]})
            for flag in room['flags']:
                await c.send({'event': 'placeFlagAt', 'args': [flag]})
            for pod in room['pods']:
                await c.send({'event': 'spawnPod', 'args': [pod]})
            c.ready = True
            if all(p.ready for p in room['players']):
                room['phase'] = 'playing'
                await self.broadcast(room, 'startGame', None)
            return True
        # Network updates already in flight when the last flag was captured
        # must not turn a completed round into a disconnection error.
        if c.room and c.room['phase'] == 'waiting':
            return [] if method == 'setCraftState' else False
        room = self.playing(c)
        if method in ('setBotStates', 'botAction'):
            if c.id != room['host'] or c.bot:
                raise ValueError('Only the host may simulate bots')
            def get_bot(ident):
                bot = next((p for p in room['players'] if p.id == ident and p.bot), None)
                if not bot: raise ValueError('Unknown bot')
                return bot
            if method == 'setBotStates':
                batch = args[0]
                if not isinstance(batch, list) or len(batch) > 7 or len({entry['id'] for entry in batch}) != len(batch):
                    raise ValueError('Invalid bot state batch')
                for entry in batch:
                    await self.call(get_bot(entry['id']), 'setCraftState', [entry['state']])
                return True
            ident, action, payload, state = args
            if action not in ('capturedFlag', 'uncapturedFlag', 'hitPod') or not isinstance(payload, list) or len(payload) != 1:
                raise ValueError('Invalid bot action')
            bot = get_bot(ident)
            await self.call(bot, 'setCraftState', [state])
            return await self.call(bot, action, payload)
        if method == 'setCraftState':
            state = args[0]
            result = {'Position': vector(state['Position']), 'Velocity': vector(state['Velocity'], 10000)}
            for key in ('AngleY', 'EngineState', 'TurnState', 'ProtectionTime', 'MaxSpeedModifier', 'MaxSpeedModifierTime', 'CloakTime', 'DisabledTime', 'Health'):
                result[key] = number(state[key])
            result['CapturedFlags'] = c.state.get('CapturedFlags', 0)
            c.state = result
            return [p.state | {'ConnectionId': p.id, 'Name': p.name, 'Team': p.team, 'Profile': p.profile} for p in room['players'] if p is not c and p.state]
        if method in ('capturedFlag', 'uncapturedFlag'):
            pos = vector(args[0]); capture = method == 'capturedFlag'
            flag = next((f for f in room['flags'] if distance(f, pos) < 10), None)
            if not flag or flag['Team'] == c.team or flag['captured'] == capture:
                return False
            if capture and distance(c.state['Position'], flag) > 384:
                return False
            flag['captured'] = capture
            if capture:
                flag['captor'] = c.id
                c.state['CapturedFlags'] += 1
            else:
                captor = next((p for p in room['players'] if p.id == flag['captor']), None)
                if captor and captor.state:
                    captor.state['CapturedFlags'] = max(0, captor.state['CapturedFlags'] - 1)
                flag['captor'] = None
            won = all(f['captured'] for f in room['flags'] if f['Team'] != c.team)
            if won:
                room['phase'] = 'waiting'
                room['lastResult'] = c.team
                room['teamWins'][c.team] += 1
                for flag_state in room['flags']:
                    if flag_state['captured'] and flag_state['captor'] in room['scores']:
                        room['scores'][flag_state['captor']]['flags'] += 1
                for participant in room['players']:
                    if participant.team == c.team:
                        room['scores'][participant.id]['wins'] += 1
            await self.broadcast(room, 'onFlagCaptured' if capture else 'onFlagUncaptured', vector(flag))
            if won:
                for player in room['players']: player.lobby_ready = player.bot
                rotation = room.get('rotation', [])
                if rotation: room['maze'] = rotation[(rotation.index(room['maze']) + 1) % len(rotation)] if room['maze'] in rotation else rotation[0]
                await self.broadcast(room, 'roundEnded', self.info(room))
            return True
        if method == 'hitPod':
            pos = vector(args[0])
            pod = next((p for p in room['pods'] if p['active'] and distance(p, pos) < 10), None)
            if not pod or distance(c.state['Position'], pod) > 320:
                return False
            pod['active'] = False
            await c.send({'event': 'awardPod', 'args': [vector(pod)]})
            await self.broadcast(room, 'removePod', vector(pod), exclude=c)
            return True
        if method == 'createTempWall':
            wall = {'Position': vector(args[0]['Position']), 'Angle': number(args[0]['Angle'])}
            if distance(c.state['Position'], wall['Position']) > 1000:
                return False
            await self.broadcast(room, 'onTempWallCreated', wall, exclude=c)
            return True
        if method == 'sendCollision':
            hit = args[0]
            target = next((p for p in room['players'] if p.id == hit['Target'] and p is not c), None)
            if target and distance(c.state['Position'], target.state['Position']) < 600:
                await target.send({'event': 'onHit', 'args': [{'Target': c.id, 'Position': vector(hit['Position']), 'Velocity': vector(hit['Velocity'], 10000)}]})
            return True
        if method == 'fireBullet':
            spawn = args[0]
            if spawn['Bullet'] not in ('StandardBullet', 'ShockwaveBullet', 'ShockwaveChargingBullet'):
                raise ValueError('Invalid bullet')
            bullet_id = int(number(spawn['Id'], 10000000))
            now = time.monotonic()
            room['bullets'] = {k: v for k, v in room['bullets'].items() if now - v[1] < 20}
            if len(room['bullets']) >= 256 or bullet_id in room['bullets']:
                return False
            bullet = {'Id': bullet_id, 'Bullet': spawn['Bullet'], 'Team': c.team.lower(), 'Position': vector(spawn['Position']), 'Velocity': vector(spawn['Velocity'], 10000)}
            room['bullets'][bullet_id] = (c.id, now)
            await self.broadcast(room, 'onBulletFired', bullet, exclude=c)
            return True
        if method == 'sendMyBulletHitCraft':
            bullet_id, target_id = args
            if room['bullets'].get(bullet_id, (None,))[0] != c.id:
                return False
            target = next((p for p in room['players'] if p.id == target_id and p is not c), None)
            if target:
                await target.send({'event': 'hitByBullet', 'args': [bullet_id]})
            return True
        if method == 'sendBulletDestroyed':
            bullet_id = args[0]
            if bullet_id in room['bullets']:
                room['bullets'].pop(bullet_id)
                await self.broadcast(room, 'bulletDestroyed', bullet_id, exclude=c)
            return True
        raise ValueError('Unknown method')

    def spawn_state(self, room, c):
        spawns = [s for s in MAPS[str(room['maze'])]['Spawns'] if s['Team'] == c.team]
        index = [p for p in room['players'] if p.team == c.team].index(c)
        # Maps have fewer red spawns than some team sizes; use another
        # existing traversable spawn instead of inventing coordinates.
        spawn = (spawns[index] if index < len(spawns) else MAPS[str(room['maze'])]['Spawns'][-1]) | {'Team': c.team}
        c.state = {'Position': vector(spawn), 'Velocity': {'X': 0, 'Y': 0, 'Z': 0}, 'AngleY': 0,
                   'EngineState': 0, 'TurnState': 0, 'ProtectionTime': 0, 'MaxSpeedModifier': 1,
                   'MaxSpeedModifierTime': 0, 'CloakTime': 0, 'DisabledTime': 0, 'Health': 100, 'CapturedFlags': 0}
        return spawn

    async def launch(self, room):
        room['phase'] = 'loading'
        room['round'] += 1
        room['created'] = time.monotonic()
        room['lastResult'] = None
        room['bullets'] = {}
        for player in room['players']:
            player.ready = False
            player.state = None
            if player.bot:
                self.spawn_state(room, player)
                player.ready = True
        data = MAPS[str(room['maze'])]
        room['flags'] = [dict(f, captured=False, captor=None) for f in select_flags(data['Flags'], room['flagCount'])]
        room['pods'] = [dict(p, PodType=secrets.randbelow(8) + 1, active=True) for p in data['Pods']]
        await self.broadcast(room, 'launch', self.info(room))

    async def websocket(self, request):
        origin = request.headers.get('Origin', '')
        allowed = {s.strip() for s in os.getenv('ALLOWED_ORIGINS', 'https://dreimer1986.github.io,https://hover.dreimer.de').split(',') if s.strip()}
        allowed.update({f'http://{request.host}', f'https://{request.host}'})
        if origin and origin not in allowed:
            raise web.HTTPForbidden(text='Origin not allowed')
        if len(self.clients) >= self.max_clients:
            raise web.HTTPServiceUnavailable(text='Server is full')
        ws = web.WebSocketResponse(heartbeat=20, max_msg_size=2000000, compress=False)
        await ws.prepare(request)
        c = Client(ws); self.clients.add(c)
        try:
            async for msg in ws:
                if msg.type != WSMsgType.TEXT:
                    break
                now = time.monotonic(); c.tokens = min(100, c.tokens + (now - c.last) * 40); c.last = now
                c.tokens -= 1
                if c.tokens < 0:
                    await ws.close(code=1008, message=b'Rate limit'); break
                ident = None
                try:
                    data = json.loads(msg.data)
                    ident = data['id']
                    if type(ident) is not int or not isinstance(data['method'], str) or not isinstance(data.get('args'), list):
                        raise ValueError('Invalid message')
                    if len(msg.data.encode()) > 16384 and data['method'] != 'shareCraft':
                        raise ValueError('Message too large')
                    if data['method'] not in ('ping', 'resume', 'setReady', 'voteMap', 'rotation', 'kick', 'quickMessage', 'listRooms', 'shareCraft', 'getCraft', 'selectCraft', 'renameLobby', 'createGame', 'join', 'leave', 'chooseTeam', 'configureRoom', 'configureBots', 'closeLobby', 'beginRoom') and c.room and data.get('round') != c.room['round']:
                        raise ValueError('Stale round')
                    result = await self.call(c, data['method'], data['args'])
                    await c.send({'id': ident, 'result': result})
                except (ValueError, KeyError, TypeError, IndexError, OverflowError, RecursionError) as error:
                    await c.send({'id': ident, 'error': str(error)[:120]})
        finally:
            if c.room:
                c.disconnected_at = time.monotonic()
                if c.room['phase'] == 'countdown':
                    c.room['phase'] = 'waiting'
                    for player in c.room['players']: player.lobby_ready = player.bot
                await self.broadcast(c.room, 'lobby', self.info(c.room))
            self.clients.discard(c)
            for code, room in list(self.rooms.items()):
                if not room['players'] and room['owner'] == c.id:
                    self.rooms.pop(code, None)
        return ws

    async def lifecycle(self, app):
        async def reap():
            while True:
                await asyncio.sleep(1)
                now = time.monotonic()
                for client in list(self.sessions.values()):
                    if client.disconnected_at is not None and now - client.disconnected_at > self.reconnect_seconds:
                        await self.leave(client)
                for code, room in list(self.rooms.items()):
                    if (not room['players'] or room['phase'] == 'loading') and now - room['created'] > 600:
                        for client in list(room['players']):
                            if client.ws: await client.ws.close(code=1000, message=b'Room expired')
                        self.rooms.pop(code, None)
        task = asyncio.create_task(reap())
        yield
        task.cancel()
        for pending in self.tasks: pending.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)
        with suppress(asyncio.CancelledError):
            await task
        await asyncio.gather(*(c.ws.close(code=1001, message=b'Server shutdown') for c in list(self.clients)))


def create_app(site_dir=None):
    service = Service()
    app = web.Application(client_max_size=16384)
    app['service'] = service
    app.cleanup_ctx.append(service.lifecycle)
    app.router.add_get('/ws', service.websocket)
    async def health(request):
        return web.json_response({'status': 'ok', 'version': VERSION, 'protocol': 4, 'rooms': len(service.rooms), 'players': len(service.clients)})
    app.router.add_get('/healthz', health)
    root = Path(site_dir or os.getenv('SITE_DIR', Path(__file__).resolve().parents[1] / '_site')).resolve()
    async def static(request):
        path = (root / request.match_info['path']).resolve()
        if not path.is_relative_to(root):
            raise web.HTTPNotFound()
        if path.is_dir():
            path /= 'index.html'
        if not path.is_file() or path.name.startswith('.'):
            raise web.HTTPNotFound()
        response = web.FileResponse(path)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        if path.suffix == '.html':
            response.headers['Cache-Control'] = 'no-cache'
        return response
    app.router.add_get('/{path:.*}', static)
    return app


if __name__ == '__main__':
    web.run_app(create_app(), host='0.0.0.0', port=int(os.getenv('PORT', '8080')), access_log=None)
