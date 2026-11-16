# Multiplayer on Synology / Docker

[Deutsch](SERVER.md) · **English**

The container includes the Python game server **and the website**. It needs only **TCP port 8080** inside the container. No Microsoft service, database or volume is required. Rooms are held in memory and disappear on restart.

## Installing on Synology

1. Download the matching image from [release multiplayer-v0.3.0](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.3.0):
   - **amd64** for Synology NAS with Intel/AMD processors.
   - **arm64** for supported NAS with 64-bit ARM processors. The NAS must support Container Manager/Docker; not every ARM model does. 32-bit ARM is not included.
2. In **Container Manager → Image → Add → Add from File**, import `hover-multiplayer-….tar.gz`. If DSM rejects compressed files, decompress it to `.tar` first.
3. Create a container from **hover-multiplayer:0.3.0**, enable automatic restart and map **NAS port 8080 → container port 8080, TCP**. No folder mappings or privileged mode are needed.
4. Point Caddy at the NAS port as described below and open **https://hover.dreimer.de/**. The container website defaults to its current HTTPS address in the **Multiplayer** panel.

Menu names vary between the older Docker package and newer Container Manager. Alternatively, import [compose.yaml](compose.yaml) as a Container Manager project after loading the image. If NAS port 8080 is occupied, use a mapping such as `18080:8080` and point the proxy at port 18080.

Using SSH (choose the correct architecture filename):

```sh
sudo docker load -i hover-multiplayer-amd64.tar.gz
sudo docker compose -f compose.yaml up -d
```

Older DSM without Compose:

```sh
sudo docker run -d --name hover-multiplayer --restart unless-stopped \
  --read-only --cap-drop ALL --security-opt no-new-privileges:true \
  -p 8080:8080 hover-multiplayer:0.3.0
```

## Caddy 2: hover.dreimer.de

```caddyfile
hover.dreimer.de {
    reverse_proxy NAS-IP:8080
}
```

Replace `NAS-IP`. If Caddy runs in another container, `localhost` means that Caddy container, not the NAS. On a shared Docker network, `hover-multiplayer:8080` can be used instead.

Caddy handles HTTPS and [WebSocket forwarding automatically](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy). Only Caddy's usual public HTTPS/HTTP ports are needed; the game container needs no additional public TCP or UDP forwarding. Check `https://hover.dreimer.de/healthz`: it should return JSON containing `"status":"ok"`.

Play at **https://hover.dreimer.de/play/modified/**. The GitHub Pages edition can also connect; it defaults to `https://hover.dreimer.de` as its game server. Until the NAS service is configured, that address is only a default, not a claim that a live service exists.

## HTTPS and DynDNS

Public multiplayer connections require **HTTPS/WSS** with a valid certificate, including DynDNS and custom ports. Enter an HTTPS **Server address**. HTTP is allowed only for local development when both website and server use `localhost`, `127.0.0.1` or `[::1]`. LAN addresses are not exempt.

Caddy terminates TLS and reaches the container over HTTP on port 8080 inside the private network. Do not expose that port directly to the internet. Invitations contain the room code and server address; WebSockets use `/ws`, and the proxy forwards the domain root without rewriting paths.

## Playing and scoring

Choose a name and craft, open **Multiplayer**, create a lobby for at most 2/4/6/8 players and share the invitation. Each player chooses Red or Blue (up to four players per team). Both teams need at least one player; unequal teams are allowed. Craft colour follows the team. The host selects one of three arenas, Modern or Retro, and three to six flags per team.

Everyone returns to **the same lobby** after a round. The host can change arena, graphics and flag count before starting the next round; everyone can change teams. **End lobby · Scores** ends the session for all players and displays totals. A flag point belongs to the player whose captured flag remains captured at the end of a completed round; returned flags do not count. Every member of the winning team gets a personal win, and that team gets a round win. Aborted rounds give no points. Changing teams does not change previously earned personal points.

A disconnection aborts the round, keeping the remaining players in the lobby. When the host leaves, a remaining player becomes host. Players may leave individually. The last departure or a server restart deletes the lobby. Scores last only for the session; rejoining creates a new player identity.

## Updating an existing Synology container

1. Finish active games. Download the matching v0.3.0 archive and import it through **Container Manager → Image → Add → Add from File**. The new image is `hover-multiplayer:0.3.0`.
2. Note the old container's ports and environment variables. Stop it and rename it, for example to `hover-multiplayer-old`, to keep a rollback option. Disable its automatic restart.
3. Create a new `hover-multiplayer` container from the **new image**. Keep the same ports (usually `8080:8080`) and environment variables, and enable automatic restart. No volumes or privileged mode are required. Restarting the old container alone does not update its image.
4. Start the new container. `https://hover.dreimer.de/healthz` should report `version: 0.3.0` and `protocol: 3`. Reload the website, create and join a lobby. Caddy needs no changes if the port mapping stays the same.
5. After a successful test, remove the old container. To roll back, stop the new one and restart the old one, restoring its original name if needed. Active lobbies are not transferred.

For a **Compose project**, import the new image, change the existing project's image to `hover-multiplayer:0.3.0` and recreate the project. Keep your own port/origin settings. Using SSH in the project directory:

```sh
sudo docker load -i hover-multiplayer-amd64.tar.gz
# compose.yaml: image: hover-multiplayer:0.3.0
sudo docker compose up -d --force-recreate
sudo docker compose ps
```

The release includes [compose.yaml](compose.yaml) and this guide. Use the arm64 file for ARM. Both website and server must use protocol 3; the new Pages edition requires the new container.

## Configuration and operation

- `PORT`: internal HTTP/WebSocket port, default 8080. Changing it also requires changing the healthcheck and port mapping; normally leave it unchanged.
- `ALLOWED_ORIGINS`: comma-separated additional website origins. Default: `https://dreimer1986.github.io,https://hover.dreimer.de`. The container website's own origin is also accepted. Add the exact origin, including port, for other external game websites.
- `MAX_ROOMS=32`, `MAX_CLIENTS=256`: limits, not measured NAS capacity guarantees.
- Occupied lobbies stay open. Empty reservations and stalled loading expire after ten minutes. Restarting the server ends all rounds.
- `/healthz`: service state and room/connection counts. No public administration interface.
- `docker logs hover-multiplayer`: diagnostics. Player states are not persisted.

## Scope, provenance and tests

This is a newly implemented replacement, not the recovered Microsoft backend. `modifications/multiplayer.js` replaces SignalR with our JSON/WebSocket protocol v3; the existing multiplayer engine handles rendering and local physics. `server/maps.json` contains only spawn, flag and item positions from `web/2019-03-11/scripts/mazes.c3a2bdf0.js`. Three to six flags per team are selected from existing positions. The original modern engine ignored item heights (`Y=20`); only the new multiplayer restores their map heights.

Rooms, teams, single item awards and flag states are server-managed. Movement and effects remain largely client-simulated. Message size/rate limits and basic state/distance checks exist, but there is no complete server physics simulation or competitive anti-cheat. Flag-return pads, weapons and inventory are not fully server-authoritative. There is no persistent scoreboard, mid-round rejoining or recovery after server restart.

Tests: `python -m unittest server.test_server -v` covers eight clients, room limits, team assignment, states, duplicate flag/item events, origin checks and disconnections. `scripts/multiplayer_smoke.cjs` exercises two real browser contexts with team changes, multiple Modern/Retro rounds in one lobby, replicated movement, item awards, three/six flags and cumulative final scores. Targeted test teleports exercise collection events; they are not a full manual map playthrough. Testing on the actual NAS and over the internet remains necessary.

Original archives and Store packages are unchanged. [Historical interface analysis](MULTIPLAYER.en.md) · [Restoration](RESTORATION.en.md)

## Building the image yourself

```sh
docker build -t hover-multiplayer:0.3.0 .
docker compose up -d
```

GitHub Actions builds native Linux amd64 and arm64 images and attaches importable Docker archives to the release. Importing them on the NAS requires no GitHub registry login.

## Crafts and lobby directory in v0.3.0

Protocol 3 adds named lobbies, private by default, and a directory of joinable public rooms. Hosts can share up to eight validated crafts (1.5 MB each, 8 MB combined). Other players fetch missing SHA-256 packages before starting and select them in the lobby. Server checks cover point budget, geometry, PNG structure and storage limits. Server copies last only until the lobby closes; guests can retain/export them in their browsers. [Details](CRAFTS.en.md). Messages remain limited to 16 KiB except validated craft uploads (2 MB WebSocket ceiling). The global room limit also bounds total model storage.
