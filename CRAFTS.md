# Eigene Schiffe und öffentliche Lobbys

**Deutsch** · [English](CRAFTS.en.md)

Im Startbildschirm der erweiterten Fassung **Eigene Schiffe · Import / Export** aufklappen. Die Vorschau erscheint direkt dort und zusätzlich in der Schiffsauswahl. Ziehen dreht die Vorschau; die exportierte Orientierung wird mit **Oben-Achse** und **Drehen** festgelegt.

## Importieren und sichern

1. Genau ein **OBJ**, **GLTF** oder **GLB** gemeinsam mit allen benötigten lokalen Dateien auswählen. Bei OBJ gehören gegebenenfalls MTL und Texturen dazu; bei GLTF auch BIN-Dateien. Dateinamen müssen eindeutig sein. Externe URLs werden nicht heruntergeladen.
2. Namen, Oben-Achse (Y/Z), Drehung und Größe wählen. **Importieren und prüfen** erzeugt eine Vorschau mit den konvertierten Texturen. Nach Änderungen an Ausrichtung/Größe erneut importieren.
3. Fahrpunkte verteilen, **Werte in Vorschau übernehmen** und **Vorschau speichern**. Das Schiff steht dann im Einzelspieler zur Auswahl und bleibt nach Neuladen erhalten.
4. **Gewähltes Schiff exportieren** speichert ein vollständiges `.hovercraft.json` mit Modell, Farbtextur und Punkteverteilung. Diese Datei kann wieder importiert werden; alle Prüfungen laufen erneut. **Modell als Hover-JSON/JS** exportiert nur die Geometrie im alten Three.js-3.1-Format, ohne Textur und Fahrwerte.

**Gewähltes Schiff bearbeiten** lädt gespeicherte oder empfangene Schiffe in den Punkteeditor. Speichern erzeugt eine neue, über ihre Prüfsumme identifizierte Variante. Alte Varianten können gelöscht werden. Die Bibliothek liegt in IndexedDB dieses Browsers und dieser Website: GitHub Pages und die NAS haben getrennte Speicher. Browserdaten-Löschen entfernt die Bibliothek; Exportdateien sind die dauerhafte Sicherung. Maximal 24 dauerhaft gespeicherte Schiffe, höchstens 64 geladene Varianten je Seitensitzung.

## Größen, Geometrie und Texturen

| Eigenschaft | Grenze / Verhalten |
| --- | --- |
| Eingabedateien zusammen | 24 MiB |
| Normalisierte Hülle X × Y × Z | 224 × 77 × 237 Spieleinheiten |
| Zielgröße | 10–100 % dieser Hülle, proportional auf allen Achsen |
| Vertices im konvertierten Modell | 8.192 |
| Dreiecke | 4.096 |
| Materialien | 16 |
| Textur | Ein PNG-Farbatlas mit 512 × 512 Pixeln |
| Einzelne Quelltextur | Höchstens 4.096 Pixel je Achse |
| Fertiges Schiffspaket | 1.500.000 Bytes |

Die Hülle stammt aus den größten Achsenmaßen der drei Originalschiffe. Große **und kleine** Modelle werden proportional auf die gewählte Zielgröße gebracht, X/Z zentriert und mit der Unterkante auf Y=0 gesetzt. Der ausgegebene Three.js-`scale` ist 1; die Anpassung ist bereits in den Vertices enthalten. Das verhindert die leicht missverständliche inverse Skalierung des alten Loaders. Die Projektgrenzen für Geometrie sind konservative Leistungs-/Speichergrenzen, keine behaupteten absoluten Grenzen von Three.js.

Der Importer trianguliert und fasst identische Vertex-/Normalen-/UV-Kombinationen zusammen. Er vereinfacht das Modell nicht. Bei Überschreitung muss der Modellbauer etwa in Blender reduzieren und erneut exportieren. Haut-/Skelettanimation, Morph Targets, Instanzen und animierte GLTFs werden abgelehnt; Kompressionsverfahren, die zusätzliche Decoder benötigen, sind nicht eingerichtet.

OBJ-Materialfarben und Diffuse-Texturen beziehungsweise GLTF-Basisfarben werden in den Atlas übernommen. UVs müssen nach Texturtransformation im Bereich 0–1 liegen; wiederholte UVs vorher in Blender backen. PBR-Metall-/Rauheitswerte, Normal-/Emissionskarten und transparente Materialeffekte werden nicht gleichwertig übernommen. Der Atlas ist eine vereinfachte Farbtextur für die alte Engine. Fehlende Ressourcen führen zu einer Fehlermeldung.

Die originale Geometrie ist JSON v3.1, auch wenn die Datei `.js` heißt. Der Importer führt keine gelieferten Skripte aus. Dein `threejs_v3_to_obj.py` wurde für den ursprünglichen Rückkonvertierungstest verwendet; die reproduzierbaren Testfixtures erstellt `scripts/prepare_craft_fixtures.py`.

## Fahrwerte und Punkte

Fünf Regler haben jeweils 0–10 Punkte; insgesamt stehen **40 Punkte** zur Verfügung. Die Werte werden aus festen Originalbereichen berechnet:

| Regler | Bereich von 0 bis 10 Punkten |
| --- | --- |
| Tempo (`maxSpeed`) | ca. 50 → 75 |
| Beschleunigung (`acceleration`) | ca. 1,375 → 5 |
| Lenkkraft (`turnSpeed`) | ca. 0,07363 → 0,18408 |
| Gleitfähigkeit (`drag`) | 3275 → 64 |
| Direkte Lenkung (`turnDrag`) | 26214 → 13107 |

Das Budget entspricht dem höchsten normierten Gesamtwert der Originalprofile (Bambi: 40). Alle fünf Regler zusammen auf Maximum wären 50 und sind unzulässig. Es gibt keine zusätzliche Kostenkurve; das einfache Budget ist nachvollziehbar. Die Originalprofile bleiben unverändert. Ein frei editierbarer Massewert existiert in diesen Profilen nicht; Kollisionsgröße und Physikcode werden nicht aus Importdateien übernommen.

[Messwerte und Budgetableitung](verification/craft-policy-analysis.json) · [Verbindliche Regeln](modifications/craft-policy.json). Browser **und Server** prüfen Schema, endliche Zahlen, Grenzen, Indizes, Bildgröße, erlaubte Eigenschaften und Budget. Der Server prüft außerdem die PNG-Struktur und begrenzt die Dekompression. Ein Texteditor kann diese Regeln nicht durch zusätzliche Profilfelder umgehen. Diese Grenzen ersetzen weder praktische Balance-Tests noch vollständige serverseitige Spielphysik.

## Multiplayer und Wiederverwendung

Der Gastgeber teilt beim Beitritt seine gespeicherten Schiffe automatisch, bis zu acht Stück und insgesamt 8 MB je Lobby. Ein ausgewähltes eigenes Schiff wird bevorzugt. **Eigene Schiffe teilen / aktualisieren** ergänzt später importierte Modelle. Nur der Gastgeber darf die gemeinsame Auswahl erweitern; alle können daraus ein Schiff wählen. Gästen ist damit kein ungeprüfter Upload in fremde Lobbys möglich.

Jedes vollständige Paket hat eine SHA-256-Prüfsumme. Bereits vorhandene identische Pakete werden nicht erneut angefordert. Die Modelle werden vor dem Rundenstart geladen und auch für andere Spieler dargestellt, in Modern und Retro. Empfangene Modelle stehen zunächst für die Sitzung bereit; **Gewähltes Sitzungsschiff behalten** übernimmt sie dauerhaft in die eigene Bibliothek. Danach sind Export, Einzelspieler und eigene Lobbys möglich.

Der optionale Knopf **Außenansicht** zeigt das eigene Schiff von hinten. Die Kamera wird bei Hindernissen näher herangeholt. In sehr engen Stellen wechselt sie vorübergehend in die Innenansicht, damit weder Wände noch das eigene Schiff die Sicht versperren. Fahrzeug- und Kameraposition bleiben getrennt. Der Modus ist kein neuer Physikmodus.

## Öffentliche Lobbyliste

Beim Erstellen einen Lobbynamen eingeben und bei Bedarf **Öffentlich in der Lobbyliste anzeigen** aktivieren. Standard ist privat. **Öffentliche Lobbys suchen** zeigt beitretbare öffentliche Lobbys auf dem ausgewählten Server. Laufende, volle und private Räume erscheinen nicht. Der Gastgeber kann Name und Sichtbarkeit zwischen Runden ändern. Private Räume bleiben über Raumcode/Einladung erreichbar.

## Einschätzung zum Karteneditor

Ein Editor ist machbar, sinnvollerweise auf Grundlage der vorhandenen Maze-Daten statt eines beliebigen OBJ-Modells. Die Engine braucht neben Geometrie ausdrücklich Wände/Böden, Texturzuordnungen, Höhen, Startplätze, Flaggenplätze, Items und weitere Spielobjekte.

Ein erster Editor sollte daher eine Raster-/Draufsicht mit Höhen für Wände und Bodenflächen anbieten und dieselbe strukturierte Kartendefinition exportieren. Eine 3D-Vorschau kann direkt die vorhandene Hover-Engine verwenden. Prüfungen sollten begehbare Start- und Flaggenplätze, ausreichende Flaggenpositionen je Team und geschlossene/sinnvolle Kollisionsflächen kontrollieren. OBJ/GLTF eignet sich später für dekorative Modelle; daraus automatisch faire, spielbare Karten zu erzeugen wäre ein eigenständiges, deutlich größeres Projekt. Ein Karteneditor ist in diesem Release nicht enthalten.
