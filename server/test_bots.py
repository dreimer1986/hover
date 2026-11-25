"""Bot permissions, slots, authoritative pickups/captures and host lifecycle."""
from server.test_server import MultiplayerTests


class BotTests(MultiplayerTests):
    async def test_solo_bot_round_and_score(self):
        host = await self.connect()
        code = (await self.rpc(host, 'createGame', 48, 3, 2))['result']
        owner = (await self.rpc(host, 'join', code, 0, 'Host'))['result']
        self.assertIn('error', await self.rpc(host, 'configureBots', 4, 4, 'hard'))
        self.assertIn('error', await self.rpc(host, 'configureBots', 0, 1, 'impossible'))
        self.assertIn('result', await self.rpc(host, 'configureBots', 0, 1, 'easy'))
        room = self.server.app['service'].rooms[code]
        bot = next(p for p in room['players'] if p.bot)
        self.assertTrue(bot.lobby_ready)
        await self.rpc(host, 'beginRoom')
        await self.rpc(host, 'spawnMe')
        self.assertEqual(room['phase'], 'playing')
        self.assertIn('error', await self.rpc(host, 'configureBots', 0, 0, 'normal'))
        state = dict(bot.state)
        flag = next(f for f in room['flags'] if f['Team'] == 'RED')
        self.assertFalse((await self.rpc(host, 'botAction', bot.id, 'capturedFlag', [flag], state))['result'])
        for flag in room['flags']:
            if flag['Team'] != 'RED': continue
            state['Position'] = {k: flag[k] for k in ('X', 'Y', 'Z')}
            self.assertTrue((await self.rpc(host, 'botAction', bot.id, 'capturedFlag', [flag], state))['result'])
        self.assertEqual(room['phase'], 'waiting')
        self.assertEqual(room['scores'][bot.id]['flags'], 3)
        self.assertEqual(room['scores'][bot.id]['wins'], 1)
        self.assertTrue(bot.lobby_ready)
        self.assertFalse(room['players'][0].lobby_ready)
        await self.rpc(host, 'leave')
        self.assertNotIn(code, self.server.app['service'].rooms)

    async def test_guests_cannot_control_bots_and_host_stays_human(self):
        host, guest = await self.connect(), await self.connect()
        code = (await self.rpc(host, 'createGame', 44, 3, 4))['result']
        owner = (await self.rpc(host, 'join', code, 0, 'Host'))['result']
        await self.rpc(host, 'configureBots', 1, 1, 'hard')
        joined = (await self.rpc(guest, 'join', code, 0, 'Guest'))['result']
        room = self.server.app['service'].rooms[code]
        self.assertIn('error', await self.rpc(guest, 'configureBots', 0, 0, 'normal'))
        await self.rpc(host, 'beginRoom')
        await self.rpc(host, 'spawnMe')
        await self.rpc(guest, 'spawnMe')
        bot = next(p for p in room['players'] if p.bot)
        self.assertIn('error', await self.rpc(guest, 'setBotStates', [{'id': bot.id, 'state': bot.state}]))
        self.assertIn('error', await self.rpc(host, 'setBotStates', [{'id': joined['id'], 'state': bot.state}]))
        self.assertIn('error', await self.rpc(host, 'botAction', bot.id, 'closeLobby', [], bot.state))
        await self.rpc(host, 'leave')
        self.assertEqual(room['phase'], 'waiting')
        self.assertEqual(room['host'], joined['id'])
        self.assertTrue(all(p.lobby_ready for p in room['players'] if p.bot))
        await self.rpc(guest, 'leave')
        self.assertNotIn(code, self.server.app['service'].rooms)
