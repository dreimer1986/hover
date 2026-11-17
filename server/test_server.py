import asyncio
import unittest
from aiohttp import ClientSession, WSServerHandshakeError
from aiohttp.test_utils import TestServer
from server.app import create_app


class MultiplayerTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.server = TestServer(create_app())
        await self.server.start_server()
        self.server.app['service'].countdown_seconds = 0
        self.server.app['service'].reconnect_seconds = .01
        self.session = ClientSession()
        self.sockets = []
        self.ident = 0

    async def asyncTearDown(self):
        for ws in self.sockets:
            await ws.close()
        await self.session.close()
        await self.server.close()

    async def connect(self):
        ws = await self.session.ws_connect(self.server.make_url('/ws'))
        self.sockets.append(ws)
        return ws

    async def rpc(self, ws, method, *args):
        self.ident += 1
        ident = self.ident
        room = next(iter(self.server.app['service'].rooms.values()), None)
        if method == 'beginRoom' and room:
            for player in room['players']: player.lobby_ready = True
        await ws.send_json({'id': ident, 'method': method, 'args': args, 'round': room['round'] if room else None})
        while True:
            message = await ws.receive_json(timeout=5)
            if message.get('id') == ident:
                return message

    async def test_public_directory_and_shared_craft_validation(self):
        import json
        from server.test_crafts import fixture
        from server.crafts import validate
        host, guest = await self.connect(), await self.connect()
        code=(await self.rpc(host, 'createGame', 44, 3, 2, {'name':'Public pilots','public':True}))['result']
        await self.rpc(host,'join',code,0,'Host')
        rooms=(await self.rpc(guest,'listRooms'))['result']
        self.assertEqual(rooms[0]['name'],'Public pilots')
        await self.rpc(guest,'join',code,1,'Guest')
        raw=json.dumps(fixture());entry=validate(raw)
        self.assertIn('error',await self.rpc(guest,'shareCraft',raw))
        self.assertIn('result',await self.rpc(host,'shareCraft',raw))
        self.assertEqual((await self.rpc(guest,'getCraft',entry['hash']))['result'],raw)
        await self.rpc(host,'shareCraft',raw)
        self.assertEqual(len(self.server.app['service'].rooms[code]['crafts']),1)
        self.assertIn('result',await self.rpc(guest,'selectCraft',entry['id']))
        self.assertIn('error',await self.rpc(guest,'selectCraft',99999))
        bad=fixture();bad['points']={k:10 for k in bad['points']}
        self.assertIn('error',await self.rpc(host,'shareCraft',json.dumps(bad)))
        self.assertIn('error',await self.rpc(guest,'renameLobby','Changed',False))
        await self.rpc(host,'renameLobby','Private pilots',False)
        self.assertEqual((await self.rpc(guest,'listRooms'))['result'],[])
        await self.rpc(host,'beginRoom')
        self.assertIn('error',await self.rpc(host,'shareCraft',raw))

    async def test_eight_players_limits_start_states_and_disconnect(self):
        sockets = [await self.connect() for _ in range(9)]
        code = (await self.rpc(sockets[0], 'createGame', 44, 4, 4))['result']
        for i, ws in enumerate(sockets[:8]):
            self.assertIn('result', await self.rpc(ws, 'join', code, i % 3, f'Pilot {i}'))
        self.assertIn('error', await self.rpc(sockets[8], 'join', code, 0, 'Overflow'))
        self.assertIn('error', await self.rpc(sockets[1], 'beginRoom'))
        self.assertTrue((await self.rpc(sockets[0], 'beginRoom'))['result'])
        for ws in sockets[:8]:
            self.assertTrue((await self.rpc(ws, 'spawnMe'))['result'])
        room = self.server.app['service'].rooms[code]
        self.assertEqual(room['phase'], 'playing')
        self.assertEqual(sum(p.team == 'RED' for p in room['players']), 4)
        self.assertEqual(len({tuple(p.state['Position'].values()) for p in room['players']}), 8)
        result = await self.rpc(sockets[0], 'setCraftState', room['players'][0].state)
        self.assertEqual(len(result['result']), 7)
        self.assertIn('error', await self.rpc(sockets[0], 'setCraftState', {'Position': {'X': float('nan'), 'Y': 0, 'Z': 0}}))
        await sockets[1].close()
        await asyncio.sleep(1.1)
        self.assertEqual(room['phase'], 'waiting')

    async def test_flags_items_and_duplicate_events(self):
        a, b = await self.connect(), await self.connect()
        code = (await self.rpc(a, 'createGame', 46, 4, 1))['result']
        await self.rpc(a, 'join', code, 0, 'A'); await self.rpc(b, 'join', code, 1, 'B')
        await self.rpc(a, 'beginRoom'); await self.rpc(a, 'spawnMe'); await self.rpc(b, 'spawnMe')
        room = self.server.app['service'].rooms[code]; player = room['players'][0]
        flag = next(f for f in room['flags'] if f['Team'] != player.team)
        self.assertFalse((await self.rpc(a, 'capturedFlag', flag))['result'])
        player.state['Position'] = {k: flag[k] for k in ('X','Y','Z')}
        self.assertTrue((await self.rpc(a, 'capturedFlag', flag))['result'])
        self.assertFalse((await self.rpc(a, 'capturedFlag', flag))['result'])
        self.assertEqual(player.state['CapturedFlags'], 1)
        self.assertTrue((await self.rpc(a, 'uncapturedFlag', flag))['result'])
        self.assertEqual(player.state['CapturedFlags'], 0)
        pod = room['pods'][0]; player.state['Position'] = {k: pod[k] for k in ('X','Y','Z')}
        self.assertTrue((await self.rpc(a, 'hitPod', pod))['result'])
        self.assertFalse((await self.rpc(a, 'hitPod', pod))['result'])
        for f in [f for f in room['flags'] if f['Team'] != player.team]:
            player.state['Position'] = {k: f[k] for k in ('X','Y','Z')}
            self.assertTrue((await self.rpc(a, 'capturedFlag', f))['result'])
        self.assertEqual(room['phase'], 'waiting')

    async def test_persistent_lobby_teams_six_flags_retro_and_final_scores(self):
        a, b = await self.connect(), await self.connect()
        code = (await self.rpc(a, 'createGame', 44, 3, 2))['result']
        await self.rpc(a, 'join', code, 0, 'A'); await self.rpc(b, 'join', code, 1, 'B')
        self.assertIn('error', await self.rpc(b, 'configureRoom', 47, 6, True))
        await self.rpc(b, 'chooseTeam', 'RED')
        self.assertIn('error', await self.rpc(a, 'beginRoom'))
        await self.rpc(a, 'chooseTeam', 'BLUE')
        for maze, flags, retro in [(44, 3, False), (47, 6, True)]:
            self.assertTrue((await self.rpc(a, 'configureRoom', maze, flags, retro))['result'])
            await self.rpc(a, 'beginRoom'); await self.rpc(a, 'spawnMe'); await self.rpc(b, 'spawnMe')
            room = self.server.app['service'].rooms[code]
            self.assertEqual(len(room['flags']), flags * 2)
            self.assertEqual(room['retro'], retro)
            self.assertIn('error', await self.rpc(a, 'chooseTeam', 'RED'))
            player = room['players'][0]
            for f in [f for f in room['flags'] if f['Team'] != player.team]:
                player.state['Position'] = {k: f[k] for k in ('X','Y','Z')}
                await self.rpc(a, 'capturedFlag', f)
            self.assertEqual(room['phase'], 'waiting')
            self.assertEqual(len(room['players']), 2)
        self.assertEqual(room['teamWins']['BLUE'], 2)
        self.assertEqual(room['scores'][player.id]['flags'], 9)
        self.assertIn('error', await self.rpc(b, 'closeLobby'))
        await self.rpc(a, 'closeLobby')
        self.assertNotIn(code, self.server.app['service'].rooms)

    async def test_origin_invalid_messages_cleanup_and_health(self):
        with self.assertRaises(WSServerHandshakeError):
            await self.session.ws_connect(self.server.make_url('/ws'), origin='https://untrusted.example')
        ws = await self.connect()
        await ws.send_str('[]')
        self.assertIn('error', await ws.receive_json())
        self.assertIn('error', await self.rpc(ws, 'createGame', 99, 4, 1))
        code = (await self.rpc(ws, 'createGame', 47, 4, 1))['result']
        await ws.close(); await asyncio.sleep(1.1)
        self.assertNotIn(code, self.server.app['service'].rooms)
        async with self.session.get(self.server.make_url('/healthz')) as response:
            self.assertEqual((await response.json())['status'], 'ok')


if __name__ == '__main__':
    unittest.main()
