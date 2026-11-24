import unittest
from unittest.mock import patch
from server.app import MAPS, select_flags


class FlagPlacementTests(unittest.TestCase):
    def test_elevated_positions_are_available_to_both_teams(self):
        for maze in MAPS.values():
            for count in range(3, 7):
                for first_team in ('RED', 'BLUE'):
                    with self.subTest(count=count, first_team=first_team), patch('server.app.secrets.SystemRandom') as random:
                        random.return_value.choice.return_value = first_team
                        flags = select_flags(maze['Flags'], count)
                        self.assertEqual(len(flags), 2 * count)
                        self.assertEqual(sum(f['Team'] == 'RED' for f in flags), count)
                        self.assertEqual(len({(f['X'], f['Y'], f['Z']) for f in flags}), len(flags))
                        high = [f for f in flags if f['Y'] > 32]
                        self.assertTrue(high)
                        if len(high) > 1:
                            self.assertEqual({f['Team'] for f in high}, {'RED', 'BLUE'})
                        else:
                            self.assertEqual(high[0]['Team'], first_team)

    def test_bundled_neon_positions_match_client_package(self):
        import json
        from pathlib import Path
        maze = json.loads((Path(__file__).resolve().parents[1] / 'modifications/maps/Neon-Causeway.hovermap.json').read_text())['maze']
        self.assertEqual(MAPS['48'], {key: maze[key] for key in ('Spawns', 'Flags', 'Pods')})
        for team in ('RED', 'BLUE'):
            self.assertGreaterEqual(sum(p['Team'] == team for p in maze['Spawns']), 4)
