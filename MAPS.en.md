# Custom maps

[Deutsch](MAPS.md) · **English**

In the extended edition, open **☰ → Custom maps**. **Load Neon Causeway** imports the bundled example. Alternatively select a `.hovermap.json` file and choose **Import map**. The overhead preview shows floors, walls and flag locations. Select Modern/Retro and 3–6 flags per team, then play. Choose your craft on the home screen.

Up to eight maps persist in this browser. **Export** saves the selected map including its textures. Export important maps before clearing browser storage. The existing combined craft/settings backup does not include maps. Individual maps can be deleted and imported again. Import currently supports single player; multiplayer map sharing and a graphical editor remain on the TODO list.

## Neon Causeway

**Neon Causeway is integrated as map 4.** Single player advances to it automatically after completing map 3, in both Modern and Retro. Unlocking level selection allows direct access. Multiplayer includes it in map selection, voting and rotation without importing (server 0.5.1 or later). Map 4 ends the single-player campaign. Arbitrary user-imported maps remain single-player only.

33,792 × 33,792 units: **50% longer sides** than a 22,528-unit stock arena, corresponding to 125% more area. Four broad stair flights with 24 steps each climb 1,536 units. A continuous ring and cross-bridges connect the upper floor. The ground floor remains accessible beneath the bridges. Each team has six potential flag locations, on both levels.

All arenas in the extended edition receive height-aware opponent navigation. It checks drivable links, stairs and passage beneath upper platforms. Opponents use normal craft physics to climb stairs and capture upstairs flags. The two archived original editions retain their original AI. In imported maps, beacons must cover stair entrances/exits and platform connections; the example provides them. Bounded search handles disconnected beacon networks without infinite loops. Import checks geometry, resources and placement support; it cannot guarantee playability or reachability in arbitrary maps.

In the extended edition, flag locations are shared between red and blue. Elevated positions are no longer exclusively blue. A lone elevated position receives a random team; multiple positions are distributed as evenly as possible. Multiplayer uses the same rule. The map preview shows possible locations, not the final round layout.

For the isolated platform in Arena 3, AI opponents first collect an existing jump pickup and spend one charge when jumping. They receive no free charges. Without a reachable jump pickup, they cannot collect a flag that requires jumping. Jump planning supports one jump per route, not arbitrary chains of jump platforms.

## Data format, version 1

The [example package](modifications/maps/Neon-Causeway.hovermap.json) also serves as a template. No JavaScript files or external resources:

- `format: "hover-map"`, `version: 1`, `name`, `author`, `description`.
- `assets.wall`, `assets.floor`, `assets.sky`: embedded PNG/JPEG data URLs, each limited to 8 MiB of characters and 4096 × 4096 pixels. Runtime textures are reduced to 512² or 1024 × 512 for the old renderer.
- `maze.Walls`: `A` and `B`, each with `X,Y,Z`; `A.Y` is the bottom and `B.Y` the top. Combine walls sharing the same footprint. `Step: true` marks stair risers up to 64 units high: they are drawn without acting as vertical obstacles; floor polygons support the craft.
- `maze.Floors`: closed, flat, convex `Points` polygons, repeating the first point at the end. Multiple elevations are supported. Build stairs from individual flat polygons; sloping polygons are rejected.
- `Spawns` and `Flags`: points with `Team: "RED"` or `"BLUE"`; at least one red and six blue spawns, and six flag locations per team.
- `Pods` and `Beacons`: `X,Y,Z` points; at least eight beacons. Spawns normally sit 96 units above the floor, flags 1 unit above it.

Limits: 16 MiB package, 2,048 walls, 1,024 floor polygons, 50,000-unit side span; absolute coordinates at most 50,000. These are chosen import limits, not proven engine maxima. Imported maps receive a collision index covering their full extent. Records include the complete map hash to distinguish revisions.

Build the example with `python3 scripts/build_cyber_map.py`. [Texture provenance](NEW-ASSETS.en.md).
