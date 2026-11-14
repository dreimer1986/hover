# Hover! — The Archive

**Deutsch** · [English](README.en.md)

Das Web-Remake von 2013, aus dem Internet Archive gesichert und lokal spielbar wiederhergestellt.

**Website:** https://dreimer1986.github.io/hover/

| Sicherung | Inhalt |
| --- | --- |
| Frühe Webfassung | Frühester gefundener Snapshot vom **02.10.2013**, Spielcode vom selben Tag |
| Späte Webfassung | Letzter erfolgreicher Startseiten-Snapshot vom **11.03.2019**, Spielcode vom **28.07.2017** |
| Windows AppxBundle | Original-ZIP aus `HoverWinRT`, Spielversion **1.1.0.3**, einschließlich Skalierungsressourcen |
| Windows Appx-Paket | Original-ZIP aus `hover_202508`, Spielversion **1.1.0.3**, einschließlich mitgelieferter Zertifikatsdateien |

Die zwei Store-Downloads sind unterschiedliche Pakete **derselben Spielversion**. Beide enthalten identische Spielressourcen.

## Spielen und herunterladen

Auf der Website eine Webfassung starten oder eines der vollständigen ZIP-Pakete herunterladen. Der Einzelspieler-Modus funktioniert ohne die ehemaligen Spielserver. Im Spiel-Hauptmenü `bambi` eingeben, um den Retro-Modus zu öffnen.

Lokal genügt Python 3.10 oder neuer:

```sh
python3 scripts/build_site.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Danach http://127.0.0.1:8000/ öffnen. Kein npm-Schritt und keine Build-Abhängigkeiten erforderlich.

Alternativ nur die wiederhergestellten Webfassungen ohne Auswahlseite starten:

```sh
python3 scripts/serve.py
```

Die lokalen Quellfassungen verwenden relative symbolische Links. Der Website-Build erzeugt ausschließlich normale Dateien und funktioniert auch unter dem GitHub-Pages-Projektpfad `/hover/`.

## Modifizierte Fassung: Touch und Vollbild

[Touch + Vollbild starten](https://dreimer1986.github.io/hover/play/modified/). Die dritte Fassung basiert auf dem späten Webstand. Sie bietet einen mobilen Startbildschirm, Steuerkreuz mit diagonalen Eingaben sowie Sprung, Wand, Tarnung und die originale Feuerfunktion (nur mit Waffe). Am PC funktionieren weiterhin Pfeiltasten, Leertaste und A/S/D.

Mobilgeräte werden von der Startseite dorthin geleitet; Touch und Großansicht sind dort voreingestellt. Am PC bleibt der bisherige Einstieg erhalten, und beide Optionen sind in der modifizierten Fassung zunächst aus. **Großansicht** füllt das Browserfenster und zeigt ein kompaktes HUD. **Vollbild** blendet nach einem Tastendruck zusätzlich die Browseroberfläche aus, sofern der Browser dies unterstützt. Andernfalls bleibt die Großansicht verfügbar. Querformat wird empfohlen.

Über **Archiv** oder [diesen Link](https://dreimer1986.github.io/hover/?view=archive) lassen sich auch mobil beide bisherigen Fassungen und Store-Downloads auswählen. Die Originalfassungen und Archive werden nicht verändert. Der Zusatzcode liegt getrennt unter `modifications/`; der Build erzeugt daraus `play/modified/` mit gemeinsam genutzten Spielressourcen.

Die Archivseite und die neue Bedienoberfläche wählen anhand der bevorzugten Browsersprache automatisch Deutsch (`de-*`) oder Englisch (alle übrigen Sprachen). Auch laufende Statusanzeigen und Vollbild-Hinweise sind übersetzt; die beiden erhaltenen Originalfassungen bleiben unberührt. Die Übersetzungen liegen in `site/locale.js`. Sprachtests: `scripts/locale_smoke.cjs`.

Browser-Basistests: `scripts/modified_smoke.cjs` mit denselben Umgebungsvariablen wie `browser_smoke.cjs`. Mobile Touch-Ereignisse werden in Chromium emuliert; Tests auf echter Android-/iOS-Hardware stehen noch aus.

## Store-ZIPs wieder zusammensetzen

Die Original-ZIPs sind verlustfrei in maximal 50 MiB große Teile zerlegt, damit keine Git-Datei die GitHub-Grenze von 100 MiB überschreitet.

```sh
python3 scripts/restore_windows.py
```

Die beiden vollständigen Original-ZIPs erscheinen in `downloads/`; SHA-256 wird beim Zusammensetzen geprüft. Auf der Website führen die Downloadbuttons zu den vollständigen Dateien im [GitHub Release](https://github.com/dreimer1986/hover/releases/tag/archive-2013). Für eine lokale Website einschließlich beider ZIPs: `python3 scripts/build_site.py --include-downloads`.

## Aufbau

- `archive/web/`: unveränderte HTML-, CSS- und JavaScript-Originale beider Webstände.
- `archive/windows/`: verlustfreie ZIP-Teile und Originalprüfsummen.
- `archive/metadata/`: CDX-Indizes, Downloadquellen und dateigenaue Herkunfts-/Ergänzungsnachweise.
- `web/`: lokale Spielfassungen und gemeinsam gespeicherte, tatsächliche Ressourcen.
- `site/`: Startseite und Spielbilder.
- `scripts/`: Build, lokaler Server, ZIP-Rekonstruktion und Integritätsprüfung.
- `verification/`: Browserberichte, Spielbilder, Paketvergleich und Integritätsprüfungen.

```sh
python3 scripts/verify_archive.py
```

[Wiederherstellung, Ersatzdateien und Grenzen](RESTORATION.md) · [Rechte und Originalquellen](THIRD_PARTY.md)

## GitHub Pages

`.github/workflows/pages.yml` baut die Seite bei Pushes auf `master` und veröffentlicht sie über GitHub Actions. In den Repository-Einstellungen ist **Pages → Source → GitHub Actions** erforderlich. Die Store-ZIPs werden über GitHub Releases angeboten. Pages enthält beide Spiele gemeinsam, aber nur deren benötigte Texturvarianten. Die vollständigen Originaldateien bleiben im Repository erhalten; der lokale Build mit `--include-downloads` ergänzt die ZIPs.

Die Browserprüfung kann mit `scripts/browser_smoke.cjs` wiederholt werden (Node.js, `playwright-core`; `CHROMIUM_PATH` für einen vorhandenen Chromium-Browser und `HOVER_URL` für die laufende Seite setzen).

Die Store-Pakete wurden auf ZIP-CRC und Appx-Blockprüfsummen geprüft, jedoch nicht unter Windows installiert. Die ehemaligen Multiplayer-Server sind nicht enthalten.
