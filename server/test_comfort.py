"""Lobby convenience tests use real sockets, including interrupted sessions."""
import asyncio
from server.test_server import MultiplayerTests


class ComfortTests(MultiplayerTests):
    async def test_readiness_reconnect_vote_rotation_kick(self):
        service = self.server.app['service']
        service.reconnect_seconds = 30
        a, b = await self.connect(), await self.connect()
        code = (await self.rpc(a, 'createGame', 44, 3, 1))['result']
        owner = (await self.rpc(a, 'join', code, 0, 'Host'))['result']
        guest = (await self.rpc(b, 'join', code, 1, 'Guest'))['result']
        room = service.rooms[code]
        # Direct service call bypasses the legacy test helper's automatic ready state.
        with self.assertRaisesRegex(ValueError, 'ready'):
            await service.call(room['players'][0], 'beginRoom', [])
        self.assertIn('error', await self.rpc(b, 'rotation', [44, 47]))
        await self.rpc(a, 'rotation', [44, 47])
        await self.rpc(b, 'voteMap', 47)
        await self.rpc(a, 'setReady', True)
        await self.rpc(b, 'setReady', True)
        await self.rpc(a, 'beginRoom')
        await asyncio.sleep(.01)
        self.assertEqual(room['maze'], 47)
        await self.rpc(a, 'spawnMe'); await self.rpc(b, 'spawnMe')
        await b.close(); await asyncio.sleep(.05)
        self.assertEqual(room['phase'], 'playing')
        replacement = await self.connect()
        self.assertIn('error', await self.rpc(replacement, 'resume', 'invalid'))
        restored = (await self.rpc(replacement, 'resume', guest['token']))['result']
        self.assertEqual(restored['id'], guest['id'])
        self.assertEqual(room['players'][1].id, guest['id'])
        self.assertIn('error', await self.rpc(a, 'resume', guest['token']))
        self.assertIn('result', await self.rpc(replacement, 'quickMessage', 'help'))
        self.assertIn('error', await self.rpc(replacement, 'quickMessage', 'help'))
        self.assertIn('error', await self.rpc(replacement, 'kick', owner['id']))
        self.assertIn('result', await self.rpc(a, 'kick', guest['id']))
        self.assertNotIn(guest['token'], service.sessions)
        self.assertEqual(room['phase'], 'waiting')

    async def test_host_transfer_and_countdown_cancellation(self):
        service = self.server.app['service']
        service.countdown_seconds = 1
        a, b = await self.connect(), await self.connect()
        code = (await self.rpc(a, 'createGame', 44, 3, 1))['result']
        await self.rpc(a, 'join', code, 0, 'Host')
        guest = (await self.rpc(b, 'join', code, 1, 'Guest'))['result']
        await self.rpc(a, 'beginRoom')
        room = service.rooms[code]
        self.assertEqual(room['phase'], 'countdown')
        await self.rpc(a, 'leave')
        self.assertEqual(room['host'], guest['id'])
        await asyncio.sleep(1.1)
        self.assertEqual(room['phase'], 'waiting')
