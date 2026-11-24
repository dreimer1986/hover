# ReactOS Silver and map import — 0.5.0

Verified on 2026-11-24 against the generated local site with Chromium/SwiftShader and the Python multiplayer server. Physical devices and the user's NAS remain user acceptance tests.

- `map_format_test.cjs`: canonical round trip; eleven malformed/unsupported packages rejected.
- `maps_smoke.cjs`: example import, IndexedDB reload with identical hash, export, Modern and Retro with six flags per team, all four 24-step flights climbed using full craft physics, ground/upper floor separation, collision at the outer boundary beyond the original collision rectangle, bundled craft physics, stock arena/sky texture restoration afterwards.
- `reactos_craft_smoke.cjs`: exact 6/5/4/5/4 points; host shares the bundled craft, guest selects it; two-player Modern and Retro render the matching remote profile, actual custom geometry and alpha-tested texture; persistent lobby between rounds.
- `map_ai_smoke.cjs`: complete AI drives from ground spawn to upper flags, with actual capture behavior, in both graphics modes. All four upper flags captured in 375.4 simulated seconds (Modern) and 341.2 seconds (Retro).
- `arena_ai_smoke.cjs`: all elevated red flags captured by real AI craft movement in all three stock arenas, in both Modern and Retro. Arena 3 first collects a real jump pickup, then consumes exactly one charge to reach the platform. No free charges; hold-pad updates remain active.
- `multiplayer_smoke.cjs`: two-player Modern (3 flags) and Retro (6 flags), team choice, movement, items, walls, captures, persistent lobby and final scores; no browser errors or missing assets.
- `craft_extended_formats_smoke.cjs`: DDS/TGA decoding, malformed texture rejection and OBJ without MTL retain their previous behavior after alpha-atlas support.
- Server unit suite: 20 tests passed, including elevated flag selection. JavaScript flag selection passed for all stock arenas, counts 3–6 and both choices for a lone elevated flag. Archive integrity: 3,649 checks passed.
- Visual inspection: both wing logos, forward direction, rounded intake/engine geometry, city backdrop orientation, Modern/Retro screenshots. PBR metallic response exists in the GLB; Hover retains its original diffuse renderer.

Known scope: imported maps are single-player; all arenas in the extended edition use height-aware AI; the archived original editions retain their original AI. Disconnected graphs use bounded traversal. Four stairs and connected upper platforms are geometry, not a new race mode or graphical map editor. The fourth craft uses one existing shared-craft slot. Original archived content is unchanged.
