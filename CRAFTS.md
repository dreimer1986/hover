# Eigene Schiffe und öffentliche Lobbys

**Deutsch** · [English](CRAFTS.en.md)

Im Startbildschirm der erweiterten Fassung **Eigene Schiffe · Import / Export** aufklappen. Die Vorschau erscheint direkt dort und zusätzlich in der Schiffsauswahl. Ziehen dreht die Vorschau; die exportierte Orientierung wird mit **Oben-Achse** und **Drehen** festgelegt.

## Importieren und sichern

1. Ein **OBJ**, **FBX**, **GLTF** oder **GLB** gemeinsam mit den benötigten lokalen Dateien auswählen. Bei mehreren Modellfassungen im Dateisatz das **Hauptmodell** auswählen. Bei OBJ gehören gegebenenfalls MTL und Texturen dazu; ohne MTL lässt sich die Farbtextur manuell zuordnen; bei GLTF auch BIN-Dateien. Dateinamen müssen eindeutig sein. Externe URLs werden nicht heruntergeladen.
2. Namen, Oben-Achse (Y/Z), Drehung und Größe wählen. **Importieren und prüfen** erzeugt eine Vorschau mit den konvertierten Texturen. Änderungen an Ausrichtung und Größe aktualisieren die Vorschau sofort. Ziehen mit Maus oder Finger dreht nur die Betrachtungsansicht.
3. Fahrpunkte verteilen, **Werte in Vorschau übernehmen** und **Vorschau speichern**. Das Schiff steht dann im Einzelspieler zur Auswahl und bleibt nach Neuladen erhalten.
4. **Gewähltes Schiff exportieren** speichert ein vollständiges `.hovercraft.json` mit Modell, Farbtextur und Punkteverteilung. Diese Datei kann wieder importiert werden; alle Prüfungen laufen erneut. **Modell als Hover-JSON/JS** exportiert nur die Geometrie im alten Three.js-3.1-Format, ohne Textur und Fahrwerte.

**Gewähltes Schiff bearbeiten** lädt gespeicherte oder empfangene Schiffe in den Editor für Fahrwerte, Ausrichtung und Größe. Bei einem falsch herum gespeicherten Schiff hier **Drehen → 180** wählen und **Vorschau speichern**. Speichern erzeugt eine neue, über ihre Prüfsumme identifizierte Variante. Alte Varianten können gelöscht werden. Die Bibliothek liegt in IndexedDB dieses Browsers und dieser Website: GitHub Pages und die NAS haben getrennte Speicher. Browserdaten-Löschen entfernt die Bibliothek; Exportdateien sind die dauerhafte Sicherung. Maximal 24 dauerhaft gespeicherte Schiffe, höchstens 64 geladene Varianten je Seitensitzung.

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

## Materialzuordnung und zusätzliche Formate

Nach dem Import erscheint eine Farbtextur-Auswahl für jedes Material. **Automatisch** verwendet vorhandene Materialzuordnungen oder, wenn diese fehlen, eine eindeutig erkennbare Albedo-/Diffuse-/BaseColor-Datei. Andernfalls eine der ausgewählten Texturen ausdrücklich zuweisen. **Nur Materialfarbe** entfernt die Farbtextur. Änderungen aktualisieren die Vorschau. Bei mehreren Hauptmodellen wechselt **Hauptmodell** zwischen den alternativen Dateien; die Modelle werden nicht zusammengefügt.

Unterstützte Farbtexturen: PNG, JPEG, WebP, BMP, TGA und DDS. DDS wird für DXT1/BC1, DXT3/BC2, DXT5/BC3 sowie vom Loader unterstütztes unkomprimiertes 32-Bit-BGRA in Software dekodiert, ohne S3TC-Unterstützung der Handy-GPU vorauszusetzen. Andere DDS-Kompressionen, Cubemaps und Volumentexturen werden abgelehnt. TGA unterstützt die vom Three.js-Loader gelesenen Varianten einschließlich RLE. Alle werden in denselben PNG-Farbatlas umgewandelt.

FBX verwendet den separaten Three.js-r160-Loader; statische Meshes werden übernommen. Animationen, Skins und Morph Targets bleiben ausgeschlossen. **MAX und BLEND werden nicht direkt importiert**: Dafür eine FBX-/OBJ-/GLTF-Fassung aus dem jeweiligen Ursprungsprogramm verwenden. Die Auswahl eines MAX-Modells allein zeigt eine entsprechende Erklärung.

Normal-, Height-, Metalness-, Roughness-, Specular- und Emissionsdateien sind keine zusätzlichen Farbtexturen desselben Materials. Diese Effekte werden weiterhin nicht als vollständiges PBR-Material umgesetzt. Aus einem Satz mit neun solchen PNGs wird daher normalerweise nur Albedo als Farbtextur benötigt. Bei mehreren Exporten oder Textursets nur eine passende Zusammenstellung auswählen; das Gesamteingabelimit bleibt 24 MiB.

## Fahrwerte und Punkte

Fünf Regler haben jeweils 0–10 Punkte; insgesamt stehen **40 Punkte** zur Verfügung. Die Werte werden aus festen Originalbereichen berechnet:

| Regler | Bereich von 0 bis 10 Punkten |
| --- | --- |
| Tempo (`maxSpeed`) | ca. 50 → 75 |
| Beschleunigung (`acceleration`) | ca. 1,375 → 5 |
| Lenkkraft (`turnSpeed`) | ca. 0,07363 → 0,18408 |
| Gleitfähigkeit (`drag`) | 3275 → 64 |
| Nachdrehen (`turnDrag`) | 26214 → 13107 |

Das Budget entspricht dem höchsten normierten Gesamtwert der Originalprofile (Bambi: 40). Alle fünf Regler zusammen auf Maximum wären 50 und sind unzulässig. Es gibt keine zusätzliche Kostenkurve; das einfache Budget ist nachvollziehbar. Die Originalprofile bleiben unverändert. Ein frei editierbarer Massewert existiert in diesen Profilen nicht; Kollisionsgröße und Physikcode werden nicht aus Importdateien übernommen.

Bei eigenen Schiffen zeigt die Schiffsauswahl dieselben fünf Fahrpunkte und Bezeichnungen wie der Editor, einschließlich der Gesamtpunktzahl. Die drei Standardschiffe werden in der erweiterten Fassung auf dieselben fünf Vergleichswerte von 0–10 umgerechnet. Bruchwerte erscheinen mit höchstens einer Nachkommastelle; ihre ursprünglichen Fahrwerte werden nicht verändert. 0 bedeutet das untere Ende des jeweiligen Originalbereichs, nicht Stillstand oder eine fehlende Eigenschaft. Die unveränderten Archivfassungen behalten ihre historische Anzeige. Die Editorpunkte werden innerhalb der obigen Bereiche in physikalische Fahrwerte umgerechnet und sind keine direkten Geschwindigkeits- oder Beschleunigungseinheiten.

[Messwerte und Budgetableitung](verification/craft-policy-analysis.json) · [Verbindliche Regeln](modifications/craft-policy.json). Browser **und Server** prüfen Schema, endliche Zahlen, Grenzen, Indizes, Bildgröße, erlaubte Eigenschaften und Budget. Der Server prüft außerdem die PNG-Struktur und begrenzt die Dekompression. Ein Texteditor kann diese Regeln nicht durch zusätzliche Profilfelder umgehen. Diese Grenzen ersetzen weder praktische Balance-Tests noch vollständige serverseitige Spielphysik.

### Was bewirken die Werte?

In Schiffsauswahl und Editor öffnet **Was bedeuten die Werte?** die Erläuterungen auch per Touch oder Tastatur.

- **Tempo:** Mehr Punkte erhöhen die normale Höchstgeschwindigkeit.
- **Beschleunigung:** Mehr Punkte erhöhen den Schub beim Gasgeben; weniger Punkte machen das Anfahren sanfter.
- **Lenkkraft:** Mehr Punkte erhöhen sowohl den Aufbau der Drehbewegung als auch das maximale Drehtempo bei Lenkeingaben.
- **Gleitfähigkeit:** Mehr Punkte verringern die Dämpfung ohne Gas; das Schiff rollt länger weiter. Weniger Punkte bremsen es nach dem Loslassen stärker ab.
- **Nachdrehen:** Mehr Punkte verringern die Drehdämpfung ohne Lenkeingabe; das Schiff dreht länger weiter. Weniger Punkte lassen die Drehbewegung schneller abklingen. Die frühere Bezeichnung „Direkte Lenkung“ war irreführend und wurde korrigiert; Fahrwerte und gespeicherte Punkte bleiben gleich.

40 Punkte sind eine Obergrenze, keine Zielvorgabe und keine objektive Leistungsnote. Mehr Gleitfähigkeit oder Nachdrehen kann die Kontrolle erschweren. Chicago ist trotz 10 Punkten anfängerfreundlich, weil es langsamer fährt, sanfter beschleunigt, langsamer dreht und ohne Gas stärker abbremst. Eine unterschiedliche Masse ist in den Profilen nicht enthalten. Diese Aussagen folgen aus `applyTurn` und `applyAccel` des erhaltenen Spielcodes; es wurde keine neue Physik eingeführt.

## Multiplayer und Wiederverwendung

Der Gastgeber teilt beim Beitritt seine gespeicherten Schiffe automatisch, bis zu acht Stück und insgesamt 8 MB je Lobby. Ein ausgewähltes eigenes Schiff wird bevorzugt. **Eigene Schiffe teilen / aktualisieren** ergänzt später importierte Modelle. Nur der Gastgeber darf die gemeinsame Auswahl erweitern; alle können daraus ein Schiff wählen. Gästen ist damit kein ungeprüfter Upload in fremde Lobbys möglich.

Jedes vollständige Paket hat eine SHA-256-Prüfsumme. Bereits vorhandene identische Pakete werden nicht erneut angefordert. Die Modelle werden vor dem Rundenstart geladen und auch für andere Spieler dargestellt, in Modern und Retro. Empfangene Modelle stehen zunächst für die Sitzung bereit; **Gewähltes Sitzungsschiff behalten** übernimmt sie dauerhaft in die eigene Bibliothek. Danach sind Export, Einzelspieler und eigene Lobbys möglich.

Der optionale Knopf **Außenansicht** zeigt das eigene Schiff von hinten. Die Kamera wird bei Hindernissen näher herangeholt. In sehr engen Stellen wechselt sie vorübergehend in die Innenansicht, damit weder Wände noch das eigene Schiff die Sicht versperren. Fahrzeug- und Kameraposition bleiben getrennt. Der Modus ist kein neuer Physikmodus.

## Öffentliche Lobbyliste

Beim Erstellen einen Lobbynamen eingeben und bei Bedarf **Öffentlich in der Lobbyliste anzeigen** aktivieren. Standard ist privat. **Öffentliche Lobbys suchen** zeigt beitretbare öffentliche Lobbys auf dem ausgewählten Server. Laufende, volle und private Räume erscheinen nicht. Der Gastgeber kann Name und Sichtbarkeit zwischen Runden ändern. Private Räume bleiben über Raumcode/Einladung erreichbar.

## Einschätzung zum Karteneditor

Ein Editor ist machbar, sinnvollerweise auf Grundlage der vorhandenen Maze-Daten statt eines beliebigen OBJ-Modells. Die Engine braucht neben Geometrie ausdrücklich Wände/Böden, Texturzuordnungen, Höhen, Startplätze, Flaggenplätze, Items und weitere Spielobjekte.

Ein erster Editor sollte daher eine Raster-/Draufsicht mit Höhen für Wände und Bodenflächen anbieten und dieselbe strukturierte Kartendefinition exportieren. Eine 3D-Vorschau kann direkt die vorhandene Hover-Engine verwenden. Prüfungen sollten begehbare Start- und Flaggenplätze, ausreichende Flaggenpositionen je Team und geschlossene/sinnvolle Kollisionsflächen kontrollieren. OBJ/GLTF eignet sich später für dekorative Modelle; daraus automatisch faire, spielbare Karten zu erzeugen wäre ein eigenständiges, deutlich größeres Projekt. Ein Karteneditor ist in diesem Release nicht enthalten.
