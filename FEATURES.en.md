# Extended edition controls

[Deutsch](FEATURES.md) · **English**

These features apply to Modern and Retro. Preserved original editions remain unchanged.

## Pause, settings and input

**☰** at the top right opens the vertical menu. **Esc**, **Settings** or controller **Start** opens settings. Single-player simulation and the record clock pause; multiplayer continues. **Leave match** explicitly ends your participation.

Separate music, engine and effects sliders accompany HUD size, chase distance, touch size/opacity, stick dead zone and sensitivity. Preferences persist locally and can be reset.

In **Bindings & controller**, select an action and press its new key/button. Duplicate assignments are swapped. Controller menus always use D-pad/left stick to navigate, A to confirm and B to return. Left/right changes selects and sliders. A opens an on-screen keyboard for text fields. Gameplay bindings are configurable separately. **Back/Select** opens the large map by default.

## Training and workshop

**☰ → Training → Start training** opens a separate small arena; select Retro first if desired. Drive, jump, cloak, place a wall, collect a pickup and finally collect the blue flags. Prompts explain inventory, duration gauges and radar. There are no opponents.

Under **☰ → Custom crafts**, **Test drive preview** applies the current workshop model and handling points. The orange preview arrow marks forward (−Z). **Settings → Return to workshop** brings you back to the editor, retaining your draft. Saving the craft permanently is not required. Practice runs do not count as records.

## Records

Personal records measure active simulation time, excluding pauses. Keys distinguish map, stock model or complete custom-craft hash, Modern/Retro, flag count, game level and rules version. Random flag and pickup positions still affect runs; these are not identical-condition competitive rankings.

The storage schema reserves separate race-total and race-lap categories. Racing itself belongs to TODO 9. A ghost is feasible by recording timestamped positions/angles and interpolating a collision-free model. Matching map/rules versions and craft hashes would be necessary. Input-only replays are unreliable with random world state and variable time steps. Recording, storage limits and rendering remain a separate future extension.

## Multiplayer

Everyone selects **Ready**, then the host starts a three-second countdown. Changing round settings clears readiness. Votes determine the next starting map; a tied current map wins the tie. Without votes, the selected map or rotation applies. Rotation advances after a victory; the host still starts each round explicitly.

Ping measures WebSocket round-trip time. Quick messages use predefined text with a two-second rate limit. Hosts can remove players, aborting an active round. Host ownership transfers to the next player when the host leaves.

The same open tab retries brief network interruptions for up to 28 seconds; the server retains the slot for 30 seconds. Other players continue. On expiry, the interrupted round ends and host ownership transfers if necessary. Browser restarts are not session resumes. Lobby state is in memory; restarting the container ends all lobbies.

## Backup and offline play

**☰ → Backup & restore** exports all persistent crafts, settings sliders and bindings. Restore validates every model and point budget before storage and merges with existing crafts, up to 24 persistent crafts total. Explicitly keep session crafts first.

The offline ZIP includes both restored web editions, the extended edition and both original Store downloads. Extract everything, install Python 3 and run **start.cmd** (Windows) or **sh start.sh** (Linux/macOS). The launcher binds only to `127.0.0.1:8088`; this fixed address preserves browser storage. Single player needs no internet; multiplayer still requires a reachable server. Python is required, but no extra packages. Store packages are not installed automatically.

Build with `python3 scripts/build_offline.py --output /path/to/package`. A checksum accompanies the ZIP. Provenance, dates and known gaps are shown in the archive and [restoration report](RESTORATION.en.md).

Workshop, records, backups, training and multiplayer have separate views. The original home retains game start, selection and a centered craft preview. The five handling attributes are all individual stock parameters; the physics has no mass parameter. Shared rules such as jump impulse or hover height are not hidden craft statistics.

## New crafts and maps

[ReactOS Silver](NEW-ASSETS.en.md) is a balanced fourth craft. **☰ → Custom maps** supports importing, previewing, storing, exporting and playing maps in Modern/Retro. [Guide and cyberpunk example](MAPS.en.md).

The new height-aware AI applies to every arena in the extended edition. It uses stairs and collects jump pickups when needed for elevated targets. Elevated flag locations are shared between red and blue, including multiplayer. Archived original editions remain unchanged.

Neon Causeway is map 4 in the normal single-player sequence and starts automatically after map 3. Multiplayer offers it directly in selection, voting and rotation. Update the NAS server to 0.5.1 for this arena.

Neon Causeway has brighter lighting from 0.5.2, with clearer roads and stairs, targeted emissive neon strips and reduced distance darkening. Retro and the simplified mobile renderer are covered too.

## AI difficulty and multiplayer bots

The home screen offers **Easy, Normal or Hard AI difficulty**, independently of the selected craft. This setting persists and also applies to imported maps and Retro. Difficulty changes opponent driving speed and turning pace; normal collision physics, flag rules and collecting jump pickups still apply. Narrow approaches and jumps constrain speed further. Personal records distinguish difficulty.

In a multiplayer lobby, the host selects red/blue bot counts and difficulty, then chooses **Apply bots / AI**. Bots occupy normal slots: at most eight participants overall and four per team. Recreate a small lobby with a larger player limit if necessary. Bots are ready automatically. This permits solo play against bots or several humans cooperating against a bot team. Hosts can remove bots or reduce their count to free slots.

Bots collect flags and pickups, use stairs and perform required jumps. Their flag points and round wins appear in the shared score table. The host browser runs their normal craft physics and must remain open and active. The server checks bot-control permissions, pickup distances, flags and scores. As with human movement, this is not fully server-authoritative anti-cheat. When the host leaves, the current round aborts, a remaining human becomes host and can start another round with bots. No bot-only lobby is left behind.

Guests see dimmed, disabled host settings with an explanatory note. Map voting remains available.
