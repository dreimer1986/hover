# Wiederherstellungsbericht

Stand: 10. November 2026.

## Welche Fassungen wurden gesichert?

| Fassung | Nachweis | Lokale Ablage |
| --- | --- | --- |
| Früheste gefundene Website | Startseite `20131002142942`; Spielkopf `2013-10-02`; `game.6a9ca04b.js` | `archive/web/2013-10-02/` |
| Letzte gefundene erfolgreiche Website | Startseite `20190311054501`; Spielkopf `2017-07-28`; `game.cbbb14d7.js` | `archive/web/2019-03-11/` |
| Store-Bundle | `Microsoft.Hover_2013.1016.2233.1156_neutral_~_8wekyb3d8bbwe.zip`, 105.014.490 Bytes | `archive/windows/HoverWinRT.zip.part*` |
| Einzelnes Store-Paket | `Hover.zip`, 103.788.649 Bytes | `archive/windows/hover_202508.zip.part*` |

„Erste“ bezeichnet den frühesten gefundenen öffentlichen Websnapshot am Veröffentlichungstag, nicht eine behauptete interne Versionsnummer 1.0. „Letzte“ bezeichnet die letzte erfolgreiche Startseitenaufnahme im abgefragten Archivindex. Das Datum 2019 ist das Sicherungsdatum, nicht das Builddatum des Spiels.

Die Original-Webdateien wurden über Wayback im `id_`-Modus ohne Wiedergabe-Injektionen geladen und anhand der CDX-SHA-1-Digests geprüft. Die CDX-Indizes von `hover.ie`, den CDN-Subdomains und `mshovercdn.blob.core.windows.net` sowie die Originalmetadaten der Store-Uploads sind in `archive/metadata/` gespeichert.

## Store-Pakete

Beide Downloads enthalten Version **1.1.0.3**. Das Bundle enthält das Haupt-Appx mit 2.665 Dateien und zwei zusätzliche Ressourcenpakete für Skalierung 140 und 180. Der zweite Download enthält das einzelne Appx und die vom Uploader mitgelieferten Zertifikats-/Signierdateien; diese werden unverändert archiviert, nicht installiert oder ausgeführt.

2.661 Dateien der beiden Haupt-Appx sind identisch. Unterschiede betreffen ausschließlich `AppxBlockMap.xml`, `AppxMetadata/CodeIntegrity.cat`, `AppxSignature.p7x` und `[Content_Types].xml`. Es gibt deshalb keine zusätzlichen, abweichenden Spieltexturen im zweiten Store-Paket.

Validiert wurden die von Archive.org publizierten SHA-1-Werte, zusätzlich SHA-256, sämtliche ZIP-CRC-Werte einschließlich der verschachtelten Appx/Bundle-Dateien sowie alle in den Appx-Blockmaps aufgeführten SHA-256-Blöcke. Dies ist eine Integritätsprüfung, keine Prüfung der Windows-Installation oder der Vertrauenskette der Signatur.

## Echte Ressourcen statt bloßer CDN-Verweise

`cdn-files.*.js` enthält tatsächlich Dateilisten und URL-Zuordnungen. Die benötigten Bilder, Schriften, Modelle und Sounds liegen zusätzlich als reale Dateien unter `web/assets/`. `mazes.*.js` enthält die drei Level und ihre Schemata; die Modell-JavaScript-Dateien enthalten Geometriedaten.

2.637 Ressourcendateien wurden aus dem vollständigen Store-Bundle übernommen. **887 CDX-Einträge** konnten durch identischen SHA-1-Digest exakt diesen Daten zugeordnet werden; mehrere Archiv-URLs können dabei dieselbe Datei bezeichnen. Weitere 21 unterschiedliche Ressourcen wurden direkt aus Wayback geladen und ebenfalls per CDX-Digest geprüft. Die Herkunft wird nicht aus ähnlichen Dateinamen allein als bewiesen betrachtet.

Die Assets werden zwischen beiden Webfassungen geteilt. Versionsabhängige, gehashte Dateinamen bleiben getrennt erhalten. Unversionierte zusätzliche Store-Dateien sind als Ergänzung dokumentiert und werden nicht als nachgewiesene Release-Tag-Dateien ausgegeben.

## Ersatz- und Anpassungsregeln

| Änderung | Herkunft / Begründung | Nachweis |
| --- | --- | --- |
| Exakte Grafik-, Modell-, Schrift- und Audiokopien | Store-Bundle, bytegleich mit CDX-SHA-1 | `archive/metadata/assets.json` |
| Weitere Originale aus Wayback | Darunter originale Ogg-Dateien und IE-Grafiken | `archive/metadata/additional-assets.json` |
| Fehlende Soundnamen | Vorhandene M4A-Dateien desselben Soundnamens aus dem Store; bei fehlender Ogg-Fassung Umwandlung dieser Datei mit FFmpeg/libvorbis, Qualitätsstufe 5 | `archive/metadata/local-restoration.json`, `web/*/scripts/offline.js` |
| `Maze2/DECAL_04_NORMAL_HALF.png` und `Maze3/DECAL_04_NORMAL_HALF.png` | Die vorhandene Store-Datei `DECAL_04_NORMALS_HALF.png` des jeweiligen gleichen Levels | `archive/metadata/texture-restoration.json` |
| Fehlende Normal-/Glowmaps ohne passende Variante | Vorhandene originale `BlankNormal.png` bzw. `BlankEmissive.png`; dies entspricht dem bereits im Spielcode implementierten neutralen Fallback | `archive/metadata/texture-restoration.json` |
| Fünf unbenutzte Maze2-Texturen | `FBASE_02`, `WBASE_09` bis `WBASE_12` sind in Maze 46 nicht referenziert und fehlen in beiden Store-Paketen sowie den erfolgreichen CDX-Aufnahmen; nur diese unnötigen Vorladeeinträge werden entfernt | `web/*/scripts/offline.js` |
| Groß-/Kleinschreibung | Linux-kompatible Aliase für `Images/images` und `MAZE*/Maze*`; veröffentlichter Build normalisiert Pfade | `scripts/build_site.py` |
| GitHub-Pages-Unterverzeichnis | Absolute Originalpfade werden auf relative gemeinsame Ressourcen umgestellt; die Retro-Pfaderkennung sucht deshalb `Schemes` unabhängig von dessen Index | `scripts/build_site.py` |
| Google Analytics, IE-Werbeflyout, YouTube | Externe Skripte deaktiviert; der alte Videovorschaubereich verwendet ein vorhandenes lokales Spielbild, externe Segoe-Werbeschriften fallen auf lokale Schrift zurück | `scripts/build_site.py`, `web/*/scripts/offline.js` |
| Rückkehr zur Auswahlseite | Kleiner Archiv-Link am unteren linken Spielrand | `scripts/build_site.py` |

Alle unveränderten Web-Originale sind separat gespeichert. Ersatzdateien und transcodierte Sounds werden nicht als bytegleiche Originaldateien der jeweiligen Webversion bezeichnet. Die neutralen Effektmaps sind kein Fund verschollener Texturen. Fünf nicht benutzte Diffuse-Texturen werden nicht durch erfundene Grafiken ersetzt.

## Browserprüfung

Getestet mit Chromium unter Linux, WebGL/SwiftShader und gesperrten externen Netzwerkzugriffen:

- Hauptmenü, Hovercraft-Auswahl und normaler Start von Level 1.
- Alle drei modernen Level (44, 46, 47) beider Fassungen, jeweils mit laufender Simulation und Bewegung durch Pfeiltasteneingabe.
- Retro-Modus beider Fassungen, ebenfalls mit laufender Simulation und Bewegung.
- Lokal geladene Sounds (29 modern, 32 retro); kein subjektiver Hörtest.
- Startseite bei Desktop- und Mobilbreite, Spiel- und Downloadlinks.
- Die zusammengesetzten Download-ZIPs entsprechen den vollständigen Originaldownloads.

Die finale Prüfung unter dem simulierten GitHub-Pages-Projektpfad `/hover/` ergab in allen acht Spielszenarien keine JavaScript-Fehler, fehlenden HTTP-Ressourcen oder externen Anfragen. Die Startseite wurde bei 1440 und 390 Pixel Breite ohne horizontalen Überlauf geprüft. Beide ZIP-Downloads wurden zusätzlich über HTTP vollständig geladen und gegen die Original-SHA-256-Werte geprüft.

Die JSON-Berichte und Screenshots unter `verification/` dokumentieren die Ergebnisse. Die initialen Berichte bleiben als Diagnose erhalten; `pages-browser-results.json` beschreibt die veröffentlichbare Website-Fassung.

## Verbleibende Grenzen

- Das ursprüngliche Multiplayer-Backend ist nicht enthalten. Der Multiplayer-Menüpunkt des Originalspiels wurde erhalten, kann aber keinen archivierten Spielserver wiederherstellen.
- Werbevideos und externe Informationsangebote sind nicht vollständig archiviert.
- Bytegenaue Vollständigkeit sämtlicher Webressourcen zum jeweiligen Veröffentlichungszeitpunkt ist wegen der genannten Ergänzungen nicht behauptet.
- Die Store-Pakete sind vollständig erhalten und auf Integrität geprüft, aber nicht unter Windows 8.1, RT oder heutigen Windows-Versionen installiert/getestet.
- Browserprüfung ist ein Start-, Ressourcen- und Steuerungstest, kein vollständiger Spieldurchlauf oder Test jedes Items und jedes Geräts.

## Kompaktes Pages-Paket und Release-Downloads

Der erste Pages-Auftrag blieb bei `syncing_files` stehen und endete mit einem Timeout. Das Log nennt kein explizites Größenlimit. Der Build wurde deshalb von rund 379 MB auf rund 63,4 MB verkleinert; die vollständige Sicherung im Git-Repository bleibt unverändert.

Die beiden Original-ZIPs liegen als GitHub-Release-Assets vor. GitHubs serverseitige SHA-256-Digests und Dateigrößen stimmen mit den Originaldownloads überein. `archive/windows/release-downloads.json` ordnet ursprüngliche Dateinamen, Release-Namen und URLs zu. Das Bundle hat im Release den vereinfachten Namen `Hover-AppxBundle-1.1.0.3.zip`; sein Inhalt bleibt bytegleich.

Die Veröffentlichung entfernt ausschließlich:

- 654 bytegleiche Dateien unter dem abweichend geschriebenen Ordner `Images/`. Die Website verwendet die identischen Dateien unter `images/`.
- Zusätzliche exportierte Texturvarianten, die der vorhandene Loader nicht auswählt. Der Loader verwendet reguläre JPG-Diffuse-Texturen, PNG-Decals, halbe Normalmaps und Viertel-Glowmaps. PNG-Viertelauflösungen für den ARM-Codepfad bleiben ebenfalls vorhanden. Sämtliche Retro-Ressourcen bleiben enthalten.

Die Liste der nur aus Pages ausgeschlossenen Dateien steht in `verification/pages-asset-selection.json`. Es werden keine Ressourcen aus dem Quellarchiv gelöscht oder neu komprimiert. Der Browser-Smoketest wird gegen den verkleinerten Build erneut ausgeführt. Der zusätzliche ARM-Test erzwingt nur den vorhandenen Textur-Ladezweig; er ist kein Test auf echter ARM-Hardware.

Beim zusätzlichen ARM-Ladepfadtest fehlte `Maze1/FBASE_02_QUARTER.png` bereits im vollständigen Quellarchiv. Beide Webfassungen verwenden für genau diesen Fall nun die vorhandene Originaltextur `Maze1/FBASE_02.jpg` desselben Levels. Es findet weder eine Neuzeichnung noch eine verlustbehaftete Umwandlung statt.

Abschlussprüfung des kompakten Builds: 14/14 Szenarien bestanden (acht reguläre und sechs erzwungene ARM-Texturladepfade), jeweils ohne JavaScript-Fehler, fehlende Ressourcen oder externe Laufzeitanfragen. Bewegung wurde in allen Szenarien bestätigt.
