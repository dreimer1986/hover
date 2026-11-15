"""Hover replacement multiplayer service. Protocol v1, no Microsoft services.

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
VERSION = '0.1.0'


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


class Client:
    def __init__(self, ws):
        self.ws = ws
        self.id = secrets.token_hex(8)
        self.room = None
        self.ready = False
        self.state = None
        self.tokens = 100.0
        self.last = time.monotonic()

    async def send(self, data):
        if not self.ws.closed:
            try:
                await asyncio.wait_for(self.ws.send_json(data), 2)
            except (TimeoutError, ConnectionError, RuntimeError):
                await self.ws.close()


class Service:
    def __init__(self):
        self.rooms = {}
        self.clients = set()
        self.max_rooms = int(os.getenv('MAX_ROOMS', '32'))
        self.max_clients = int(os.getenv('MAX_CLIENTS', '256'))

    async def broadcast(self, room, event, *args, exclude=None):
        await asyncio.gather(*(c.send({'event': event, 'args': args}) for c in list(room['players']) if c is not exclude))

    def info(self, room):
        return {'code': room['code'], 'maze': room['maze'], 'capacity': room['capacity'],
                'host': room['host'], 'phase': room['phase'],
                'players': [{'id': c.id, 'name': c.name, 'team': c.team, 'ready': c.ready} for c in room['players']]}

    async def leave(self, client):
        room, client.room = client.room, None
        client.ready = False
        client.state = None
        if room is None:
            return
        room['players'].remove(client)
        if not room['players']:
            self.rooms.pop(room['code'], None)
            return
        if room['host'] == client.id:
            room['host'] = room['players'][0].id
        if room['phase'] in ('loading', 'playing'):
            # Explicitly end interrupted rounds rather than leave a frozen lobby
            # or grant a win merely because a network connection disappeared.
            room['phase'] = 'finished'
            await self.broadcast(room, 'roundAborted', 'A player disconnected. Create a new room to play again.')
        await self.broadcast(room, 'lobby', self.info(room))

    def playing(self, client):
        if not client.room or client.room['phase'] != 'playing' or not client.ready:
            raise ValueError('Round is not running')
        return client.room

    async def call(self, c, method, args):
        if method == 'createGame':
            maze, flags, team_size = args
            if str(maze) not in MAPS or type(team_size) is not int or not 1 <= team_size <= 4 or flags != 4:
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
                    'players': [], 'phase': 'waiting', 'created': time.monotonic(), 'flags': [], 'pods': [], 'bullets': {}}
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
            if len(room['players']) >= room['capacity']:
                raise ValueError('Room is full')
            c.name, c.profile = name, profile
            c.team = 'RED' if sum(p.team == 'RED' for p in room['players']) <= sum(p.team == 'BLUE' for p in room['players']) else 'BLUE'
            c.room = room
            room['players'].append(c)
            if len(room['players']) == 1:
                room['host'] = c.id
            await self.broadcast(room, 'lobby', self.info(room))
            return {'id': c.id, 'room': self.info(room)}
        if method == 'leave':
            await self.leave(c)
            return True
        if method == 'beginRoom':
            room = c.room
            if not room or room['host'] != c.id or room['phase'] != 'waiting':
                raise ValueError('Only the host can start a waiting room')
            if len(room['players']) < 2 or len(room['players']) % 2:
                raise ValueError('An even number of players is required (2, 4, 6 or 8)')
            room['phase'] = 'loading'
            data = MAPS[str(room['maze'])]
            room['flags'] = [dict(f, captured=False) for team in ('RED', 'BLUE') for f in [f for f in data['Flags'] if f['Team'] == team][:4]]
            room['pods'] = [dict(p, PodType=secrets.randbelow(8) + 1, active=True) for p in data['Pods']]
            await self.broadcast(room, 'launch', room['maze'])
            return True
        if method == 'spawnMe':
            room = c.room
            if not room or room['phase'] != 'loading' or c.ready:
                raise ValueError('Unexpected spawn request')
            spawns = [s for s in MAPS[str(room['maze'])]['Spawns'] if s['Team'] == c.team]
            index = [p for p in room['players'] if p.team == c.team].index(c)
            # Maps have fewer red spawns than some team sizes; use another
            # existing traversable spawn instead of inventing coordinates.
            spawn = (spawns[index] if index < len(spawns) else MAPS[str(room['maze'])]['Spawns'][-1]) | {'Team': c.team}
            c.state = {'Position': vector(spawn), 'Velocity': {'X': 0, 'Y': 0, 'Z': 0}, 'AngleY': 0,
                       'EngineState': 0, 'TurnState': 0, 'ProtectionTime': 0, 'MaxSpeedModifier': 1,
                       'MaxSpeedModifierTime': 0, 'CloakTime': 0, 'DisabledTime': 0, 'Health': 100, 'CapturedFlags': 0}
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
        if c.room and c.room['phase'] == 'finished':
            return [] if method == 'setCraftState' else False
        room = self.playing(c)
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
            c.state['CapturedFlags'] += 1 if capture else -1
            won = all(f['captured'] for f in room['flags'] if f['Team'] != c.team)
            if won:
                room['phase'] = 'finished'
            await self.broadcast(room, 'onFlagCaptured' if capture else 'onFlagUncaptured', vector(flag))
            if won:
                await self.broadcast(room, 'roundEnded', c.team)
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

    async def websocket(self, request):
        origin = request.headers.get('Origin', '')
        allowed = {s.strip() for s in os.getenv('ALLOWED_ORIGINS', 'https://dreimer1986.github.io,https://hover.dreimer.de').split(',') if s.strip()}
        allowed.update({f'http://{request.host}', f'https://{request.host}'})
        if origin and origin not in allowed:
            raise web.HTTPForbidden(text='Origin not allowed')
        if len(self.clients) >= self.max_clients:
            raise web.HTTPServiceUnavailable(text='Server is full')
        ws = web.WebSocketResponse(heartbeat=20, max_msg_size=16384, compress=False)
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
                    result = await self.call(c, data['method'], data['args'])
                    await c.send({'id': ident, 'result': result})
                except (ValueError, KeyError, TypeError, IndexError, OverflowError) as error:
                    await c.send({'id': ident, 'error': str(error)[:120]})
        finally:
            await self.leave(c)
            self.clients.discard(c)
            for code, room in list(self.rooms.items()):
                if not room['players'] and room['owner'] == c.id:
                    self.rooms.pop(code, None)
        return ws

    async def lifecycle(self, app):
        async def reap():
            while True:
                await asyncio.sleep(30)
                now = time.monotonic()
                for code, room in list(self.rooms.items()):
                    timeout = 3600 if room['phase'] == 'playing' else 600
                    if now - room['created'] > timeout:
                        for client in list(room['players']):
                            await client.ws.close(code=1000, message=b'Room expired')
                        self.rooms.pop(code, None)
        task = asyncio.create_task(reap())
        yield
        task.cancel()
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
        return web.json_response({'status': 'ok', 'version': VERSION, 'protocol': 1, 'rooms': len(service.rooms), 'players': len(service.clients)})
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
