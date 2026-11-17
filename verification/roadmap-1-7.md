# Roadmap 1–7 verification / Prüfung

2026-11-17. New code is confined to the extended edition, service, build tooling and archive landing page. / Neuer Spielcode betrifft ausschließlich die erweiterte Fassung; zusätzlich Server, Build-Werkzeuge und Archivübersicht.

Passed / Erfolgreich:

- `python3 scripts/verify_archive.py`: 3,649 original integrity checks.
- `python -m unittest server.test_server server.test_crafts server.test_comfort -q`: 19 tests, including validation, readiness, countdown cancellation, token-protected reconnection, host transfer, voting/rotation and kick.
- `scripts/roadmap_smoke.cjs`: German/English, Modern/Retro practice, unchanged position/velocity during pause, resume, persistent preferences, rebound movement and personal records.
- `scripts/multiplayer_comfort_smoke.cjs`: two actual browser clients, ready/countdown, multiplayer continues with menu open, same-identity reconnection and quick message delivery.
- `scripts/multiplayer_smoke.cjs`: complete Modern and Retro rounds, 3/6 flags, movement synchronization, items/walls, team switch, persistent lobby and cumulative scores.
- `scripts/modified_smoke.cjs`: mobile viewport, multitouch, extras, releases/orientation, fullscreen fallback, all arenas/crafts, Modern/Retro transitions; no missing resources or JavaScript exceptions.
- `scripts/controller_menu_smoke.cjs`: controller confirm/back, settings dialog and on-screen text entry.
- Offline ZIP: full CRC validation, both original Store SHA-256 hashes, all three web entry points, launch scripts and actual local HTTP response.
- `scripts/input_smoke.cjs`: synthetic standard gamepad, axes, Back map toggle, off mode, disconnect.
- `scripts/craft_stats_smoke.cjs`: editor/preview/game physics agreement, persistence and stock comparisons.
- `scripts/workshop_backup_smoke.cjs`: imported preview test drive, return to editor, durable storage, invalid backup rejection before writes, valid restore/reload.
- `scripts/audio_smoke.cjs`: Chromium Web Audio engine/effect output, continuous loop sources, mute/resume and menu shutdown in Modern/Retro.

The browser tests use Chromium with software WebGL; mobile settings emulate viewports and touch. Real Android/iPhone, physical controllers and the refreshed NAS container still need user acceptance testing. / Browserprüfungen verwenden Chromium mit Software-WebGL; Mobilprüfungen simulieren Bildschirm und Touch. Echte Android-/iPhone-Geräte, physische Controller und der aktualisierte NAS-Container bleiben vom Nutzer zu prüfen.

Ghost replay feasibility is documented, not a shipped replay renderer. Race/lap record categories are reserved; race gameplay remains roadmap 9. / Geisterschiffe sind bewertet, aber noch nicht implementiert. Renn-/Rundenkategorien sind reserviert; Rennspielregeln bleiben Punkt 9.
