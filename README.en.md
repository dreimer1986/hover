# Hover! — Extended edition and archive

[Deutsch](README.md) · **English**

The Hover! browser remake, with an extended edition and preserved original releases.

**Play with multiplayer: [hover.dreimer.de](https://hover.dreimer.de/)**

[GitHub Pages alternative](https://dreimer1986.github.io/hover/) · [Original releases and Store downloads](https://dreimer1986.github.io/hover/?view=archive)

The extended edition is the default on desktop and mobile. It includes:

- The original home screen with single player, multiplayer and Retro mode.
- Optional touch controls, action buttons, expanded view and fullscreen; touch and expanded view are enabled by default on mobile.
- Three arenas in Modern and Retro, three to six flags per team and automatic single-player map progression.
- A hidden single-player level selector: press the centre of the **O** in the Hover logo to unlock it. Without unlocking, games start on map 1.
- Multiplayer lobbies for up to eight players with team selection, changing arenas, Modern/Retro and cumulative final scores across rounds.
- German or English controls based on browser language, and shared audio output for music, engine and effects.

Desktop controls: arrow keys, Space and A/S/D. Fullscreen requires a button press and browser support; expanded view also works without the fullscreen API. Landscape orientation is recommended on phones.


Pause, training, personal records, controller menus, workshop test drives, backups and offline package: [User guide](FEATURES.en.md). Multiplayer 0.5.0 adds readiness, countdown, ping, map votes/rotation, quick messages and reconnection.

## Multiplayer and NAS

Open [hover.dreimer.de](https://hover.dreimer.de/), choose **Multiplayer**, enter a name and create a lobby or join using a room code. Choose your team; the host selects the arena, graphics and flag count. The lobby stays open after each round. **End lobby · Scores** displays the final totals.

The Python/WebSocket server runs without Microsoft services in a Docker container on **8080/TCP**, exposed through an HTTPS reverse proxy. [Synology installation and updates](SERVER.en.md) · [Download container v0.5.0](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.5.0).

## Run locally

Python 3.10 or newer; the static website has no additional build dependencies:

```sh
python3 scripts/build_site.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Then open http://127.0.0.1:8000/. For local multiplayer, see [SERVER.en.md](SERVER.en.md).

## Preserved releases

| Archive | Contents |
| --- | --- |
| Early web release | Snapshot dated 2013-10-02 |
| Late web release | Snapshot dated 2019-03-11, game code dated 2017-07-28 |
| Windows AppxBundle | Complete original HoverWinRT package, version 1.1.0.3 |
| Windows Appx package | Complete original hover_202508 package, version 1.1.0.3 |

The Store packages are different distributions of the same game version. Original archives and Store packages remain unchanged; extensions are separate in `modifications/`. Complete ZIPs are available in the [archive release](https://github.com/dreimer1986/hover/releases/tag/archive-2013); `python3 scripts/restore_windows.py` reconstructs them locally with checksum verification.

[Restoration and documented changes](RESTORATION.en.md) · [Server operation](SERVER.en.md) · [Original multiplayer](MULTIPLAYER.en.md) · [Sources and rights](THIRD_PARTY.en.md)

GitHub Actions builds and publishes the website on pushes to `master`. `python3 scripts/verify_archive.py` checks preserved originals. Browser and server tests are in `scripts/` and `server/`.

The craft selector shows original models and statistics. **M** or the map button opens the large radar; **M/Esc** closes it. Driving and actions are disabled while it is open; the match continues. Pressing the centre of the O again locks level selection.

Standard controllers: left stick/D-pad to drive, A/Cross to jump, X/Square for walls, B/Circle for cloak, right trigger to fire, Start/Back for the map. Once detected, **Off / Touch / Controller** replaces the Touch button. Press a button or tap the start screen to begin. Menus remain accessible with mouse/touch. The user confirmed working iPhone audio and NAS operation.

Import custom OBJ/FBX/GLTF/GLB crafts, preview textures and size, allocate handling points and save them in the browser. Export packages back up the library; hosts can share crafts with their lobby. Named public lobbies are discoverable through the server list. [Craft workshop, limits and public lobbies](CRAFTS.en.md).

[New crafts and asset provenance](NEW-ASSETS.en.md) · [Custom maps and Neon Causeway](MAPS.en.md)
