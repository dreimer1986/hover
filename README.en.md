# Hover! — The Archive

[Deutsch](README.md) · **English**

The 2013 web remake, preserved from the Internet Archive and restored for local play.

**Website:** https://dreimer1986.github.io/hover/

| Archive | Contents |
| --- | --- |
| Early web release | Earliest recovered snapshot: **2013-10-02**, with game code from the same day |
| Later web release | Last successful homepage snapshot: **2019-03-11**, with game code dated **2017-07-28** |
| Windows AppxBundle | Original ZIP from `HoverWinRT`, game version **1.1.0.3**, including display scale resources |
| Windows Appx package | Original ZIP from `hover_202508`, game version **1.1.0.3**, including the supplied certificate files |

The two Store downloads are different packages of **the same game version**. Both contain identical game resources.

## Play and download

Start a web release on the website or download either complete ZIP package. Single player works without the former game servers. Type `bambi` in the game's main menu to enter retro mode.

For local use, Python 3.10 or later is sufficient:

```sh
python3 scripts/build_site.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Then open http://127.0.0.1:8000/. No npm step or build dependencies are required.

Alternatively, serve only the restored web releases without the selection page:

```sh
python3 scripts/serve.py
```

The local source releases use relative symbolic links. The website build produces regular files only and also works under the GitHub Pages project path `/hover/`.

## Modified edition: touch and fullscreen

[Start touch + fullscreen](https://dreimer1986.github.io/hover/play/modified/). This third edition is based on the later web release. It adds a mobile launch screen, a directional pad with diagonal input, jump, wall, cloak and the original fire action (requires a weapon). Arrow keys, Space and A/S/D still work on desktop.

Mobile visitors to the homepage are redirected to this edition with touch controls and full-window mode enabled. Desktop keeps the existing entry point, and both options initially remain off in the modified edition. **Full window** fills the browser window and displays a compact HUD. **Fullscreen** additionally hides the browser interface after a button press, where supported. Otherwise, full-window mode remains available. Landscape orientation is recommended.

Use **Archive** or [this link](https://dreimer1986.github.io/hover/?view=archive) to select either existing release or the Store downloads, including on mobile. The original releases and archives are not changed. Additional code lives separately in `modifications/`; the build generates `play/modified/` using shared game assets.

The archive page and new controls automatically select German (`de-*`) or English (all other languages) from the preferred browser language. Live status displays and fullscreen messages are translated too; the two preserved original releases remain untouched. Translations live in `site/locale.js`. Language tests: `scripts/locale_smoke.cjs`.

Browser smoke tests: `scripts/modified_smoke.cjs`, using the same environment variables as `browser_smoke.cjs`. Mobile touch events are emulated in Chromium; this does not replace testing on actual Android/iOS hardware.

## Reassemble the Store ZIPs

The original ZIPs are split losslessly into parts of at most 50 MiB so that no Git file exceeds GitHub's 100 MiB limit.

```sh
python3 scripts/restore_windows.py
```

Both complete original ZIPs appear in `downloads/`; SHA-256 is checked during reassembly. Website download buttons link to complete files in the [GitHub Release](https://github.com/dreimer1986/hover/releases/tag/archive-2013). To build a local website including both ZIPs, use `python3 scripts/build_site.py --include-downloads`.

## Layout

- `archive/web/`: unchanged original HTML, CSS and JavaScript from both web releases.
- `archive/windows/`: lossless ZIP parts and original checksums.
- `archive/metadata/`: CDX indexes, download sources and per-file provenance/restoration records.
- `web/`: local game releases and actual shared resources.
- `site/`: homepage and game screenshots.
- `scripts/`: build, local server, ZIP reconstruction and integrity checks.
- `verification/`: browser reports, screenshots, package comparisons and integrity checks.

```sh
python3 scripts/verify_archive.py
```

[Restoration, replacement files and limitations](RESTORATION.en.md) · [Rights and original sources](THIRD_PARTY.en.md)

## GitHub Pages

`.github/workflows/pages.yml` builds the site on pushes to `master` and publishes it through GitHub Actions. Repository settings must use **Pages → Source → GitHub Actions**. Store ZIPs are served through GitHub Releases. Pages shares the game assets and includes only the required texture variants. Complete original files remain in the repository; the local `--include-downloads` build adds the ZIPs.

Repeat the browser checks with `scripts/browser_smoke.cjs` (Node.js and `playwright-core`; set `CHROMIUM_PATH` to an available Chromium executable and `HOVER_URL` to the running site).

The Store packages passed ZIP CRC and Appx block checksum checks, but were not installed on Windows. The former multiplayer servers are not included.
