# Lobby, bots and Neon Causeway districts — 0.6.0

Finalized 2026-11-27. Local browser checks use Chromium/SwiftShader; server tests use real aiohttp WebSocket connections. Preserved web/archive sources are unchanged.

- Lobby guests see dimmed host controls and an explicit explanation. Ready/Vote button top edges differ by less than two pixels. Player rows use centered content despite host-only Remove buttons. [Host](lobby-host-0.6.0.png) / [Guest](lobby-guest-0.6.0.png).
- 33 server tests passed, including bot capacity/team limits, host-only control, invalid IDs/actions, remote capture rejection, bot scores, solo play against bots, human host transfer and removal of bot-only lobbies. Additional pickup checks verify one-time bot awards and deactivation.
- `bots_smoke.cjs`: two humans and two bots, Modern/City and Retro/Neon Causeway; real bot movement and remote replication, synchronized pickup award/removal, controlled capture fixtures, round victory, persistent lobby and human host transfer. Captures use test positioning; this is not a claim that bots autonomously completed a full multiplayer round in these tests.
- `arena_ai_smoke.cjs`, Easy and Hard: all elevated red flags captured in all three stock arenas, Modern and Retro. The isolated platform requires collecting and spending a real jump pickup.
- `map_ai_smoke.cjs`: new Neon Causeway layout, all four upper red flags reached and captured with normal craft physics; 305.7 simulated seconds Modern, 317.0 Retro.
- `maps_smoke.cjs`: all four main stair flights traversable, lower/upper floor separation, outer-boundary collision, Modern/Retro, import/export and persistence.
- `district_map_smoke.cjs`: route reachability from both team starts to every flag and pickup; three courtyard floors at −192; actual descent and ascent through all three recesses; selected long sightlines blocked on both levels.
- Map package validation and 3,649 archive integrity checks passed. Old open arena is byte-identical to the file from commit cf5439f and retained under models/maps for a future battle mode.

Bot physics runs in the active host browser, with server-managed flags, pickups and scores. AI uses the same height-aware routing, ordinary craft physics and real jump pickups; difficulty changes driving pace, not health or free inventories. No autonomous server-side bot simulation or battle mode is claimed. Mobile/NAS play remains subject to the user's real-device acceptance.
