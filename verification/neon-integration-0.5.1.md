# Bundled arena 4 — 0.5.1

Verified locally on 2026-11-24 with Chromium/SwiftShader and the Python server.

- `neon_progression_smoke.cjs`: trigger arena 3 victory, wait for automatic advancement to arena 4 in Modern and Retro; correct map index, 12 flags, height-aware navigation and city sky; no imported map or IndexedDB entry needed. Victory on arena 4 ends the sequence instead of starting another map.
- `HOVER_NEON_TEST=1 scripts/multiplayer_smoke.cjs`: two clients on Neon Causeway, Modern/3 flags and Retro/6 flags; replicated movement, team swap, all captures, return to the same lobby and cumulative final scores. Captures use controlled test teleports, not a claim of complete manual playthroughs.
- 21 server tests: includes matching client/server map object locations, at least four spawns per team, elevated red/blue flag selection, four-map rotation and a vote for arena 4.
- Original archive and web source files remain unchanged. User-imported maps are still single-player only; the bundled map is available to every client without sharing/importing it.
