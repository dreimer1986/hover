# Multiplayer: findings and restoration feasibility

[Deutsch](MULTIPLAYER.md) · **English**

**Update November 15, 2026:** A replacement implementation and Docker packaging now exist; see [installation and current limitations](SERVER.en.md). The following is the historical pre-implementation analysis.

Updated: November 14, 2026. This is a code analysis, not an implemented or tested multiplayer service.

## Conclusion

**A new, functionally comparable multiplayer implementation is technically plausible and well supported by the available evidence.** Much of the network client, vehicle physics, remote vehicle rendering and game assets survives. The available archives lack the running server and its implementation. A replacement server must therefore be developed and hosted separately. The clients alone cannot guarantee an exact reconstruction of every former server rule.

The website can stay on GitHub Pages. The active multiplayer service requires a separate host: [GitHub Pages is static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). New client adaptations should be confined to an optional modified edition; both archived and already restored releases remain preserved.

## Verified structure

| Component | Finding in the preserved code |
| --- | --- |
| Early client | jQuery SignalR **1.1.3**, endpoint `http://mshover-mp.cloudapp.net/signalr` |
| Later client | jQuery SignalR **2.0.3**, base address `http://hovermp.azurewebsites.net/`, hub under `signalr` |
| Connection | Dynamic hub proxy through `/signalr/hubs`, shared hub `hoverHub` |
| Lobby | Create a game, invitation link with game ID, choose name and craft, wait for other players |
| Team selection | UI for 2, 4, 6 or 8 total players: two teams of 1–4 |
| Creation defaults | `createGame(44, 4, teamSize)`: maze ID 44 and flag parameter 4 |
| State exchange | At most about 15 requests per second; the next request waits for the previous response |
| Vehicle state | Position, velocity, rotation, throttle/steering, protection/effect timers, cloak, disabled time, health; later also captured flags |
| Remote vehicles | Client-side movement prediction and position correction (`NetworkPlayerController`) |
| Later additions | Optional end time in `startGame`, local evaluation when time expires, additional scoreboard endpoint |

The old HTTP addresses are listed as source evidence only. A new public service for the HTTPS website should use HTTPS/WSS. Operation at those former addresses is not assumed.

## Sequence and messages

The creator calls `createGame` and receives a game ID. Participants join using `join(gameId, craftProfile, playerName)`. `waitingUpdate` provides waiting lists and player counts. The server assigns an arena (`useMazeId`); the client reports loading completion through `spawnMe`, and `spawnAt` provides position and team. `startGame` begins the exchange; the client buffers messages received before loading finishes.

`setCraftState` submits the local state and returns other players' states. Movement is simulated locally and extrapolated between network updates. A basic relay prototype is therefore a reasonable starting point; the client does not fully reveal how strictly the original server validated incoming claims.

The preserved interface also includes:

| Client → server | Server → client / effect |
| --- | --- |
| `capturedFlag`, `uncapturedFlag` | `onFlagCaptured`, `onFlagUncaptured` |
| `hitPod` | `spawnPod`, `removePod` for power-ups |
| `createTempWall` | `onTempWallCreated` |
| `sendCollision` | `onHit` |
| `fireBullet` | `onBulletFired` |
| `sendMyBulletHitCraft`, `sendBulletDestroyed` | `hitByBullet`, `bulletDestroyed` |

The firing interfaces demonstrate client support, not necessarily a weapon available in every game mode. Complete extracted method names, state fields and file checksums are recorded in [multiplayer-client-analysis.json](verification/multiplayer-client-analysis.json).

## Responsibilities of a replacement server

- Manage rooms and game IDs, teams, participants, waiting state, orderly departure and disconnections.
- Generate initial states, flags and power-ups using the existing map data and distribute them to participants.
- Associate, relay and validate state updates and events.
- Implement shared rules for flags, power-ups, temporary walls, collisions, round victory/end and optional time limits.
- Add a scoreboard for the later special feature if it belongs to the intended scope.

Exact server-side validation, randomization, room lifetime and persistence are not fully documented. Preserved single-player logic and map data provide a foundation, but do not replace multiplayer synchronization.

## Suggested implementation path

1. Build a separate prototype with two browsers, one arena, a room code and visible movement of both players.
2. Synchronize flags and round victory through shared server state.
3. Add power-ups, walls, collisions, disconnect handling and more players; then test latency, concurrency and manipulation.

A classic SignalR-compatible server is an option for close protocol compatibility. A new WebSocket/SignalR Core server with an adapter in the modified edition is an option for longer-term maintainability. **ASP.NET Core SignalR is not directly compatible with the old ASP.NET SignalR client**; Microsoft documents these [protocol/API differences](https://learn.microsoft.com/en-us/aspnet/core/signalr/version-differences?view=aspnetcore-10.0). Simply changing the server address is insufficient for that approach.

No public service was provisioned, no server was implemented, and no multiplayer match is claimed to have succeeded as part of this analysis.

## Source evidence

- [Early original game code](archive/web/2013-10-02/scripts/game.6a9ca04b.js) and [libraries](archive/web/2013-10-02/scripts/game-libs.81568e1f.js).
- [Later original game code](archive/web/2019-03-11/scripts/game.cbbb14d7.js) and [libraries](archive/web/2019-03-11/scripts/game-libs.922bbe8e.js).
- Relevant symbols: `Hover.signalr`, `hoverHub`, `createGame`, `joinGame`, `attachHubListeners`, `setCraftState`, `getStateUpdate`, `checkGameExpiration`, `api/scoreboard/`.

[Project overview](README.en.md) · [Restoration report](RESTORATION.en.md)
