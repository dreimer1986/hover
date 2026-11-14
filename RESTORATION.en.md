# Restoration report

[Deutsch](RESTORATION.md) · **English**

Updated: November 14, 2026.

## Which releases were preserved?

| Release | Evidence | Local location |
| --- | --- | --- |
| Earliest recovered website | Homepage `20131002142942`; game header `2013-10-02`; `game.6a9ca04b.js` | `archive/web/2013-10-02/` |
| Last recovered successful website | Homepage `20190311054501`; game header `2017-07-28`; `game.cbbb14d7.js` | `archive/web/2019-03-11/` |
| Store bundle | `Microsoft.Hover_2013.1016.2233.1156_neutral_~_8wekyb3d8bbwe.zip`, 105,014,490 bytes | `archive/windows/HoverWinRT.zip.part*` |
| Standalone Store package | `Hover.zip`, 103,788,649 bytes | `archive/windows/hover_202508.zip.part*` |

“First” means the earliest public web snapshot recovered from launch day, not a claimed internal version number of 1.0. “Last” means the last successful homepage capture in the queried archive index. 2019 is the capture date, not the game's build date.

Original web files were downloaded through Wayback's `id_` mode without replay injections and verified against CDX SHA-1 digests. CDX indexes for `hover.ie`, its CDN subdomains and `mshovercdn.blob.core.windows.net`, along with original Store upload metadata, are saved in `archive/metadata/`.

## Store packages

Both downloads contain version **1.1.0.3**. The bundle contains the main Appx with 2,665 files and two additional resource packages for scales 140 and 180. The second download contains the standalone Appx and uploader-supplied certificate/signing files; these are archived unchanged, not installed or executed.

2,661 files in the two main Appx packages are identical. Differences are limited to `AppxBlockMap.xml`, `AppxMetadata/CodeIntegrity.cat`, `AppxSignature.p7x` and `[Content_Types].xml`. The second Store package therefore provides no additional distinct game textures.

Verification covered the SHA-1 values published by Archive.org, additional SHA-256 hashes, all ZIP CRC values including nested Appx/bundle files, and every SHA-256 block listed in the Appx block maps. This is an integrity check, not a Windows installation test or a validation of the signature trust chain.

## Actual resources, not just CDN references

`cdn-files.*.js` does contain file lists and URL mappings. Required images, fonts, models and sounds are also present as actual files in `web/assets/`. `mazes.*.js` contains the three levels and their schemes; model JavaScript files contain geometry data.

2,637 resource files were recovered from the complete Store bundle. **887 CDX entries** matched these files exactly by SHA-1 digest; multiple archive URLs may refer to the same file. Another 21 distinct resources were downloaded directly from Wayback and also verified by CDX digest. Similar filenames alone are not considered proof of provenance.

Assets are shared between the two web releases. Version-specific hashed filenames are retained separately. Additional unversioned Store files are documented as supplements, not claimed to be proven launch-day files.

## Replacement and adaptation rules

| Change | Source / reason | Evidence |
| --- | --- | --- |
| Exact graphics, models, fonts and audio copies | Store bundle, byte-identical to CDX SHA-1 | `archive/metadata/assets.json` |
| Additional Wayback originals | Including original Ogg files and IE graphics | `archive/metadata/additional-assets.json` |
| Missing sound names | Existing M4A files of the same sound name from the Store; where Ogg is missing, conversion using FFmpeg/libvorbis at quality 5 | `archive/metadata/local-restoration.json`, `web/*/scripts/offline.js` |
| `Maze2/DECAL_04_NORMAL_HALF.png` and `Maze3/DECAL_04_NORMAL_HALF.png` | Existing Store file `DECAL_04_NORMALS_HALF.png` from the same respective level | `archive/metadata/texture-restoration.json` |
| Missing normal/glow maps without a matching variant | Existing original `BlankNormal.png` or `BlankEmissive.png`, matching the neutral fallback already implemented in the game | `archive/metadata/texture-restoration.json` |
| Five unused Maze2 textures | `FBASE_02`, `WBASE_09` through `WBASE_12` are not referenced in maze 46 and are absent from both Store packages and successful CDX captures; only these unnecessary preload entries are removed | `web/*/scripts/offline.js` |
| Case sensitivity | Linux-compatible aliases for `Images/images` and `MAZE*/Maze*`; published build normalizes paths | `scripts/build_site.py` |
| GitHub Pages subdirectory | Original absolute paths are changed to relative shared assets; retro path detection therefore finds `Schemes` regardless of its index | `scripts/build_site.py` |
| Google Analytics, IE advertising flyout, YouTube | External scripts disabled; old video preview uses an existing local game image; external Segoe advertising fonts fall back to local fonts | `scripts/build_site.py`, `web/*/scripts/offline.js` |
| Return to selection page | Small archive link at the lower-left edge of the game | `scripts/build_site.py` |

All unchanged web originals are stored separately. Replacement files and transcoded sounds are not described as byte-identical originals of their respective web releases. Neutral effect maps are not newly recovered lost textures. The five unused diffuse textures are not replaced with invented artwork.

## Browser verification

Tested with Chromium on Linux, WebGL/SwiftShader and external network access blocked:

- Main menu, hovercraft selection and normal level 1 start.
- All three modern levels (44, 46, 47) in both releases, with a running simulation and movement using arrow keys.
- Retro mode in both releases, also with a running simulation and movement.
- Locally loaded sounds (29 modern, 32 retro); no subjective listening test.
- Homepage at desktop and mobile widths, game links and download links.
- Reassembled ZIP downloads match the complete original downloads.

The final check under a simulated GitHub Pages project path `/hover/` found no JavaScript errors, missing HTTP resources or external requests in all eight game scenarios. The homepage was checked at widths of 1440 and 390 pixels without horizontal overflow. Both ZIP downloads were additionally fetched in full over HTTP and checked against their original SHA-256 hashes.

JSON reports and screenshots in `verification/` record the results. Initial reports remain as diagnostic evidence; `pages-browser-results.json` describes the publishable website build.

## Remaining limitations

- The original multiplayer backend is not included. The original game's multiplayer menu remains, but cannot recreate an archived game server.
- Promotional videos and external information sites are not fully archived.
- Byte-exact completeness of every web resource at each release date is not claimed because of the documented supplements.
- Store packages are fully preserved and integrity-checked, but were not installed/tested on Windows 8.1, RT or current Windows releases.
- Browser verification checks startup, resources and controls; it is not a complete playthrough or a test of every item and device.

## Compact Pages package and release downloads

The first Pages job stalled at `syncing_files` and timed out. Its log does not identify an explicit size limit. The build was therefore reduced from about 379 MB to about 63.4 MB; the complete archive in the Git repository remains unchanged.

Both original ZIPs are available as GitHub Release assets. GitHub's server-side SHA-256 digests and file sizes match the original downloads. `archive/windows/release-downloads.json` maps original filenames to release filenames and URLs. The bundle uses the simplified release name `Hover-AppxBundle-1.1.0.3.zip`; its contents remain byte-identical.

Publication excludes only:

- 654 byte-identical files under the differently capitalized `Images/` directory. The website uses their identical counterparts in `images/`.
- Additional exported texture variants not selected by the existing loader. The loader uses regular JPG diffuse textures, PNG decals, half-resolution normal maps and quarter-resolution glow maps. Quarter-resolution PNG textures for the ARM code path are retained too. All retro resources remain included.

Files excluded only from Pages are listed in `verification/pages-asset-selection.json`. No resources are removed from the source archive or recompressed. The browser smoke test was rerun against the compact build. The additional ARM test forces only the existing texture-loading branch; it is not a test on actual ARM hardware.

The additional ARM loading-path test found that `Maze1/FBASE_02_QUARTER.png` was already missing from the complete source archive. Both web releases now use the existing original texture `Maze1/FBASE_02.jpg` from the same level for this specific case. No redrawing or lossy conversion is involved.

Final compact-build verification: 14/14 scenarios passed (eight regular and six forced ARM texture-loading branches), with no JavaScript errors, missing resources or external runtime requests. Movement was confirmed in every scenario.

## Optional touch/fullscreen edition (November 14, 2026)

`play/modified/` is built as a third edition from the already restored later web release. `modifications/modern.js` and `modern.css` add a launch menu, a Pointer Events directional pad, action buttons and switchable full-window mode. Input uses the existing touch controller; the keyboard controller remains intact. Cancellation, focus loss and view changes release held input. Full-window mode adjusts rendering size and camera aspect ratio, removes the decorative border and retains radar, flags and readable inventory/status values. Browser fullscreen requires a button press; full-window mode remains usable where browser fullscreen is unsupported.

`site/mobile.js` redirects mobile homepage visits to the third edition. `?view=archive` and direct section links bypass this redirect. Desktop visits and direct links to the two existing game releases retain their behavior. The original archives, restored game releases and shared textures are not changed for this addition. The third edition loads the same shared assets; Store packages remain downloads through Releases.

The added features were tested with Chromium and emulated mobile multi-touch input (`scripts/modified_smoke.cjs`, results in `verification/modified-*`). This does not replace testing on actual mobile hardware.

After the first successful deployment of the addition, a German/English interface was introduced. `site/locale.js` translates only the archive page and third edition according to the primary browser language: German for `de-*`, English otherwise. Asset paths, game logic and original releases remain unchanged. `scripts/locale_smoke.cjs` checks German, English and French browser preferences (English fallback), live HUD text, fullscreen messages and mobile entry.
