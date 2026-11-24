# Neue Assets und Herkunft

**Deutsch** · [English](NEW-ASSETS.en.md)

## ReactOS Silver

Das vierte mitgelieferte Schiff heißt **ReactOS Silver (Ausgewogen)**. Fahrpunkte: Tempo **6**, Beschleunigung **5**, Lenkkraft **4**, Gleitfähigkeit **5**, Nachdrehen **4**, insgesamt **24/40**. Das Tempo ist mit Wizard vergleichbar, bei kräftigerer Lenkung und weniger Nachdrehen. Es verwendet die fünf vorhandenen Physikwerte; einen separaten Massewert gibt es nicht. Die Originalprofile bleiben unverändert.

Das Schiff ist ohne Import auswählbar, wird mit seinen Werten angezeigt und lässt sich in der Werkstatt exportieren oder als eigene Kopie bearbeiten. Die mitgelieferte Fassung kann nicht gelöscht werden. Lobbyinhaber teilen es über das vorhandene geprüfte Schiffssystem; es belegt einen der acht geteilten Schiffplätze. Identische Prüfsummen vermeiden erneutes Herunterladen. Modern und Retro verwenden dieselben Fahrwerte.

Dateien:

- [Importierbares Hover-Paket](modifications/stock-crafts/ReactOS-Silver.hovercraft.json): Geometrie, Texturatlas und Fahrpunkte.
- [Bearbeitbares GLB](models/reactos-silver/ReactOS-Silver.glb): eingebettetes Logo und PBR-Materialien.
- [Erzeugungsskript](scripts/build_reactos_ship.py): `python3 scripts/build_reactos_ship.py` benötigt NumPy und Pillow. `scripts/render_reactos_logos.cjs` rasterisiert den Schriftzug mit Playwright; das Symbol-PNG bleibt unverändert. `scripts/convert_reactos_ship.cjs` verwendet den Werkstatt-Konverter der laufenden lokalen Seite und erzeugt das geprüfte Hover-Paket. Unveränderte Quelldateien liegen unter `models/reactos-silver/source/`.

Grundlage ist [„low poly space ship“](https://sketchfab.com/3d-models/low-poly-space-ship-587941c9c11742c6b82dfb99e7b210b9) von [chrisonciuconcepts](https://sketchfab.com/chrisonciuconcepts), lizenziert unter [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Siehe [ursprünglichen Lizenzhinweis](models/reactos-silver/SOURCE-LICENSE.txt). Änderungen: Unterteilung und geglättete Form, korrigierte Vorwärtsrichtung, Silbermaterialien, 24-segmentige Einfassungen der vorderen Lufteinlässe und hinteren Triebwerke sowie auf die Flügel projizierte Symbole und seitliche Schriftzüge. Das Ergebnis enthält 3.392 Dreiecke, unterhalb der Importgrenze von 4.096.

Das textlose Flügelsymbol ist die unveränderte [offizielle PNG-Datei logo_alpha.png](https://github.com/reactos/press-media/blob/master/Art/Logo/Orb/logo_alpha.png) von Mindflyer (GPLv2). Der seitliche Schriftzug stammt aus [reactos_text_noglowing.svg](https://github.com/reactos/press-media/blob/master/Art/Logo/String/reactos_text_noglowing.svg) von Krzysztof Blaszczyk (GPLv2 oder neuer, alternativ CC BY-SA 3.0). Transparente Bereiche bleiben bei der Konvertierung und Darstellung durchsichtig. Der Schriftzug verwendet die offiziellen Vektorformen; es wird keine ähnliche Schrift nachgesetzt. [Originale Lizenzzuordnung](models/reactos-silver/LOGO-LICENSE.txt), [GPLv2-Lizenztext](models/reactos-silver/GPL-2.txt). Die getrennten Drittinhalte behalten ihre Lizenzen; sie werden nicht durch die Repository-MIT-Lizenz ersetzt. Keine offizielle Unterstützung durch ReactOS wird behauptet.

Das GLB enthält Metall-/Rauheitswerte. Hover verwendet einen Farbatlas und seine vorhandene Beleuchtung; vollständige moderne PBR-Reflexionen werden nicht nachgebildet. Die Hover-Geometrie zeigt nach −Z. Zur erneuten Konvertierung GLB mit Y oben, Drehung 0°, Größe 100 % und den oben genannten fünf Punkten importieren.

## Neon Causeway

[Erzeugungsskript](scripts/build_cyber_map.py), [Kartenpaket](modifications/maps/Neon-Causeway.hovermap.json), [Bedienung und Format](MAPS.md).

`modifications/maps/assets/city-panorama.png` ist eine unveränderte Kopie des vorhandenen PSPStreamer-Bilds `psp-client/assets/xmb-cyberpunk-concept/city-panorama.png`, wie gewünscht wiederverwendet. Es erscheint als zylindrischer Stadthintergrund und ist keine neu aufgenommene Panoramaansicht.

`modifications/maps/assets/cyber-panel.png` wurde mit dem eingebauten Werkzeug **image_gen.imagegen** für diese Erweiterung erzeugt. Das ursprüngliche Rasterbild bleibt unverändert. Der genaue englische Prompt ist in der [englischen Herkunftsdokumentation](NEW-ASSETS.en.md#neon-causeway) festgehalten; er fordert eine kachelbare, frontal dargestellte dunkelblaue Stahloberfläche mit dezenten cyanfarbenen und magentafarbenen Lichtstreifen ohne Text oder Perspektive.

Das Beispielpaket enthält seine Texturen. Ursprünglich archivierte Karten, Texturen und Schiffdateien werden nicht verändert.
