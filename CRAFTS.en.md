# Custom crafts and public lobbies

[Deutsch](CRAFTS.md) · **English**

Open **Custom crafts · Import / export** on the extended edition home screen. The preview appears inside the workshop and in craft selection. Drag to rotate the preview; **Up axis** and **Rotate** set the exported orientation.

## Importing and saving

1. Select exactly one **OBJ**, **GLTF** or **GLB**, together with all required local resources. OBJ may need MTL and textures; GLTF may need BIN files. Resource filenames must be unique. External URLs are not downloaded.
2. Choose a name, up axis (Y/Z), rotation and size. **Import and validate** displays the converted model and textures. Orientation and size changes update the preview immediately. Dragging with a mouse or finger only changes the viewing angle.
3. Allocate handling points, choose **Preview edited values**, then **Save preview**. The craft becomes available in single player and survives page reloads.
4. **Export selected craft** saves a complete `.hovercraft.json` containing model, colour texture and points. Reimporting runs all validation again. **Model as Hover JSON/JS** exports only legacy Three.js 3.1 geometry, without texture or handling data.

**Edit selected craft** loads saved or received crafts into the handling, orientation and size editor. To correct a backwards craft, choose **Rotate → 180** here and **Save preview**. Saving creates a new checksum-identified variant; old variants can be deleted. IndexedDB storage belongs to this browser and website: GitHub Pages and the NAS have separate libraries. Clearing browser data removes the library; exported files are the durable backup. Limits: 24 persistent crafts and 64 loaded variants per page session.

## Size, geometry and textures

| Property | Limit / behavior |
| --- | --- |
| Combined input files | 24 MiB |
| Normalized X × Y × Z bounds | 224 × 77 × 237 game units |
| Target size | 10–100% of those bounds, uniformly scaled |
| Converted vertices | 8,192 |
| Triangles | 4,096 |
| Materials | 16 |
| Output texture | One 512 × 512 PNG colour atlas |
| Individual source texture | At most 4,096 pixels on either axis |
| Complete craft package | 1,500,000 bytes |

The bounding box derives from the largest axis dimensions of the three original crafts. Both large and small models are uniformly scaled to the chosen target size, centred on X/Z and grounded at Y=0. The legacy `scale` is 1; scaling is already baked into vertices, avoiding the old loader's inverse scale convention. Geometry limits are conservative project performance/memory limits, not claimed absolute Three.js limits.

The importer triangulates and merges identical position/normal/UV combinations. It does not decimate meshes. Over-limit models must be simplified in a modelling tool such as Blender. Skinning, morph targets, instances and animated GLTFs are rejected; compression requiring additional decoders is not configured.

OBJ material colours/diffuse textures and GLTF base colours are baked into the atlas. Transformed UVs must stay within 0–1; bake repeating UVs in Blender first. PBR metallic/roughness, normal/emissive maps and transparent material effects are not faithfully retained. The atlas is a simplified colour texture for the old engine. Missing resources produce an error.

Original geometry is JSON v3.1 despite its `.js` extension. Imported scripts are never executed. The user-provided `threejs_v3_to_obj.py` was used for the initial round-trip test; `scripts/prepare_craft_fixtures.py` generates reproducible fixtures.

## Handling and points

Five sliders each offer 0–10 points, with **40 points total**. Values are derived from fixed original ranges:

| Slider | Range from 0 to 10 points |
| --- | --- |
| Speed (`maxSpeed`) | approximately 50 → 75 |
| Acceleration | approximately 1.375 → 5 |
| Steering power (`turnSpeed`) | approximately 0.07363 → 0.18408 |
| Coasting (`drag`) | 3275 → 64 |
| Steering response (`turnDrag`) | 26214 → 13107 |

The budget equals the largest normalized original total (Bambi: 40). Maximizing all five sliders costs 50 and is rejected. There is no nonlinear cost curve. Original profiles remain unchanged. These profiles have no editable mass parameter; collision dimensions and physics code are not imported.

[Measurements and budget derivation](verification/craft-policy-analysis.json) · [Enforced policy](modifications/craft-policy.json). Both browser **and server** validate schema, finite numbers, bounds, indices, image dimensions, permitted properties and points. The server also checks PNG structure and bounds decompression. Editing package text cannot bypass the rules by adding profile fields. These limits do not replace practical balancing or fully server-authoritative physics.

## Multiplayer and reuse

The host automatically shares saved crafts on joining, up to eight and 8 MB per lobby. The currently selected custom craft has priority. **Share / refresh custom crafts** adds later imports. Only the host can expand the shared selection; all players can select from it. Guests cannot upload unvalidated crafts into someone else's lobby.

Each complete package has a SHA-256 checksum. Identical cached packages are not requested again. Models load before each round and appear for other players in Modern and Retro. Received crafts initially remain session-local; **Keep selected session craft** saves them permanently. They can then be exported, used in single player or shared in the player's own lobbies.

The optional **Chase view** button shows your own craft from behind. Obstacles pull the camera closer; very narrow spaces temporarily use the cockpit view to avoid looking through walls or the craft. Vehicle and camera positions remain separate. This is not a different physics mode.

## Public lobby list

Choose a lobby name and optionally enable **Show publicly in the lobby list** when creating it. The default is private. **Find public lobbies** lists joinable public rooms on the selected server. Running, full and private rooms are omitted. Hosts can change name and visibility between rounds. Private rooms remain accessible through codes/invitations.

## Map editor assessment

An editor is feasible, best based on existing Maze data rather than an arbitrary OBJ model. The engine needs explicit walls/floors, texture assignments, heights, spawn points, flags, items and other gameplay objects in addition to geometry.

A useful first editor would offer a grid/top-down view with wall and floor heights, exporting the same structured map definition. The existing Hover engine could provide a 3D preview. Validation should check accessible spawn/flag positions, enough flag locations per team and sensible collision boundaries. OBJ/GLTF could later supply decorative models; automatically producing fair, playable arenas from them would be a separate, substantially larger project. A map editor is not included in this release.
