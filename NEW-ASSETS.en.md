# New assets and provenance

[Deutsch](NEW-ASSETS.md) · **English**

## ReactOS Silver

The fourth bundled craft is **ReactOS Silver (Balanced)**. Handling points are speed **6**, acceleration **5**, steering **4**, coasting **5**, turn coasting **4**: **24/40**. Speed is comparable to Wizard, with more steering authority and less rotational coasting. The existing five-property physics model is used; there is no separate mass parameter. Original craft profiles are unchanged.

The craft can be selected without importing, previewed with its statistics, exported through the workshop, or edited into a separate custom copy. Its bundled copy cannot be deleted. Hosts share it through the existing validated craft protocol, so it uses one of the eight shared-craft slots. Identical hashes avoid redundant downloads. Both modes use the same handling values.

Files:

- [Importable Hover package](modifications/stock-crafts/ReactOS-Silver.hovercraft.json): geometry, texture atlas and handling points.
- [Editable GLB](models/reactos-silver/ReactOS-Silver.glb): embedded logo and PBR materials.
- [Build script](scripts/build_reactos_ship.py): `python3 scripts/build_reactos_ship.py` requires NumPy and Pillow. `scripts/render_reactos_logos.cjs` rasterizes the text-only SVG with Playwright; the orb PNG is kept unchanged. `scripts/convert_reactos_ship.cjs` uses the running site workshop converter to regenerate the validated Hover package. Original source files are retained under `models/reactos-silver/source/`.

This work is based on [“low poly space ship”](https://sketchfab.com/3d-models/low-poly-space-ship-587941c9c11742c6b82dfb99e7b210b9) by [chrisonciuconcepts](https://sketchfab.com/chrisonciuconcepts), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [original license notice](models/reactos-silver/SOURCE-LICENSE.txt). Changes: subdivision and blended smoothing, corrected forward orientation, silver materials, 24-sided front intake/rear engine housings and projected wing symbols and side wordmarks. The derivative contains 3,392 triangles, below the 4,096-triangle import limit.

The text-free wing symbol is the unmodified [official logo_alpha.png](https://github.com/reactos/press-media/blob/master/Art/Logo/Orb/logo_alpha.png) by Mindflyer (GPLv2). The side wordmark comes from [reactos_text_noglowing.svg](https://github.com/reactos/press-media/blob/master/Art/Logo/String/reactos_text_noglowing.svg) by Krzysztof Blaszczyk (GPLv2 or later, alternatively CC BY-SA 3.0). Transparent areas remain transparent through conversion and rendering. The wordmark uses its official vector outlines, not a substitute font. [Original licensing notice](models/reactos-silver/LOGO-LICENSE.txt), [GPLv2 license text](models/reactos-silver/GPL-2.txt). Third-party artwork retains its respective licenses; the repository MIT license does not replace them. No official ReactOS endorsement is implied.

The GLB stores metallic/roughness properties. Hover's old renderer uses a diffuse atlas and its existing lighting; it does not reproduce full modern PBR reflections. Exported Hover geometry faces forward along −Z. Reimport the GLB with Y-up, rotation 0°, size 100%, and the five points above to regenerate the complete package.

## Neon Causeway

[Generator](scripts/build_cyber_map.py), [importable package](modifications/maps/Neon-Causeway.hovermap.json), [usage and format](MAPS.en.md).

`modifications/maps/assets/city-panorama.png` is an unchanged copy of the existing PSPStreamer project image at `psp-client/assets/xmb-cyberpunk-concept/city-panorama.png`, reused as requested. It is displayed as a cylindrical city backdrop, not a newly captured panorama.

`modifications/maps/assets/cyber-panel.png` was generated with the built-in **image_gen.imagegen** tool for this extension. The original generated raster is retained unchanged. Exact prompt:

> Use case: stylized-concept. Asset type: a seamless square game environment diffuse texture, 1024x1024. Create a straight-on orthographic tile of dark brushed steel cyberpunk architectural panels for a Hover racing arena. Clean geometric recessed plates, subtle wear, narrow cyan luminous strip accents near panel seams, tiny magenta light details. No perspective, no text, no symbols, no objects, no frame, no scenery. Evenly lit flat material surface, not a photograph of a wall. All four edges tile seamlessly. Mainly dark blue-gray steel with restrained neon highlights, readable at 512 pixels. Texture only.

The example embeds its textures. Original archived maps, textures and ship files are not modified.

Lighting changes in 0.5.2 do not edit the source artwork. At load time, `neon-lighting.js` derives a separate grayscale emissive mask for neon strips from colour saturation and adjusts the map shaders only for Neon Causeway.
