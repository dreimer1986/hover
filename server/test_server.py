import asyncio
import unittest
from aiohttp import ClientSession, WSServerHandshakeError
from aiohttp.test_utils import TestServer
from server.app import create_app


class MultiplayerTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.server = TestServer(create_app())
        await self.server.start_server()
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
        await ws.send_json({'id': ident, 'method': method, 'args': args})
        while True:
            message = await ws.receive_json(timeout=5)
            if message.get('id') == ident:
                return message

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
        await asyncio.sleep(.05)
        self.assertEqual(room['phase'], 'finished')

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
        self.assertEqual(room['phase'], 'finished')

    async def test_origin_invalid_messages_cleanup_and_health(self):
        with self.assertRaises(WSServerHandshakeError):
            await self.session.ws_connect(self.server.make_url('/ws'), origin='https://untrusted.example')
        ws = await self.connect()
        await ws.send_str('[]')
        self.assertIn('error', await ws.receive_json())
        self.assertIn('error', await self.rpc(ws, 'createGame', 99, 4, 1))
        code = (await self.rpc(ws, 'createGame', 47, 4, 1))['result']
        await ws.close(); await asyncio.sleep(.05)
        self.assertNotIn(code, self.server.app['service'].rooms)
        async with self.session.get(self.server.make_url('/healthz')) as response:
            self.assertEqual((await response.json())['status'], 'ok')


if __name__ == '__main__':
    unittest.main()
