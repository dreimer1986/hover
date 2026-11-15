# Multiplayer on Synology / Docker

[Deutsch](SERVER.md) · **English**

The container includes the Python game server **and the website**. It needs only **TCP port 8080** inside the container. No Microsoft service, database or volume is required. Rooms are held in memory and disappear on restart.

## Installing on Synology

1. Download the matching image from [release multiplayer-v0.1.1](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.1.1):
   - **amd64** for Synology NAS with Intel/AMD processors.
   - **arm64** for supported NAS with 64-bit ARM processors. The NAS must support Container Manager/Docker; not every ARM model does. 32-bit ARM is not included.
2. In **Container Manager → Image → Add → Add from File**, import `hover-multiplayer-….tar.gz`. If DSM rejects compressed files, decompress it to `.tar` first.
3. Create a container from **hover-multiplayer:0.1.1**, enable automatic restart and map **NAS port 8080 → container port 8080, TCP**. No folder mappings or privileged mode are needed.
4. Open `http://NAS-IP:8080/play/modified/`. The **Multiplayer** panel defaults to the current website address when served by the container.

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
  -p 8080:8080 hover-multiplayer:0.1.1
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

## DynDNS and direct access

`http://dreimer1986.spdns.de:8080/play/modified/` works with matching port forwarding to the container. For public access, HTTPS through Caddy is recommended, including on a custom external port. **An HTTPS GitHub page cannot connect to an unencrypted `ws://` game server.** Test both through the directly served HTTP website on the LAN, or provide a valid HTTPS endpoint.

The **Server address** field accepts an HTTP/HTTPS address with a port. Invitation links include the room code and server address. Connections always use `/ws` on that address; proxy the domain root without changing paths.

## Playing

Choose a name, craft and arena, create a room with a maximum of 2/4/6/8 players, and share the invitation link. Joining players choose their names and crafts. The host starts with an even player count; teams are balanced automatically. Collect all four enemy flags. Three arenas, shared items, temporary walls, collisions and existing weapon events are supported. A disconnection ends the current round with a message; create a new room for the next round.

The new multiplayer initially uses modern graphics. Single player including retro mode and both preserved original releases remain available.

## Configuration and operation

- `PORT`: internal HTTP/WebSocket port, default 8080. Changing it also requires changing the healthcheck and port mapping; normally leave it unchanged.
- `ALLOWED_ORIGINS`: comma-separated additional website origins. Default: `https://dreimer1986.github.io,https://hover.dreimer.de`. The container website's own origin is also accepted. Add the exact origin, including port, for other external game websites.
- `MAX_ROOMS=32`, `MAX_CLIENTS=256`: limits, not measured NAS capacity guarantees.
- Rooms expire after at most one hour; waiting/loading/finished rooms after ten minutes. Restarting the server ends all rounds.
- `/healthz`: service state and room/connection counts. No public administration interface.
- `docker logs hover-multiplayer`: diagnostics. Player states are not persisted.

## Scope, provenance and tests

This is a newly implemented replacement, not the recovered Microsoft backend. `modifications/multiplayer.js` replaces SignalR with our JSON/WebSocket protocol v1; the existing multiplayer engine handles rendering and local physics. `server/maps.json` contains only spawn, flag and item positions from `web/2019-03-11/scripts/mazes.c3a2bdf0.js`. Four flags per team are selected from existing positions. The original modern engine ignored item heights (`Y=20`); only the new multiplayer restores their map heights.

Rooms, teams, single item awards and flag states are server-managed. Movement and effects remain largely client-simulated. Message size/rate limits and basic state/distance checks exist, but there is no complete server physics simulation or competitive anti-cheat. Flag-return pads, weapons and inventory are not fully server-authoritative. There is no persistent scoreboard, mid-round rejoining or recovery after server restart.

Tests: `python -m unittest server.test_server -v` covers eight clients, room limits, team assignment, states, duplicate flag/item events, origin checks and disconnections. `scripts/multiplayer_smoke.cjs` exercises two real browser contexts with lobby, replicated movement, item awards, shared flags and round outcomes. Targeted test teleports exercise collection events; they are not a full manual map playthrough. Testing on the actual NAS and over the internet remains necessary.

Original archives and Store packages are unchanged. [Historical interface analysis](MULTIPLAYER.en.md) · [Restoration](RESTORATION.en.md)

## Building the image yourself

```sh
docker build -t hover-multiplayer:0.1.1 .
docker compose up -d
```

GitHub Actions builds native Linux amd64 and arm64 images and attaches importable Docker archives to the release. Importing them on the NAS requires no GitHub registry login.
