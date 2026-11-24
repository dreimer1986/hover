# Eigene Karten

**Deutsch** · [English](MAPS.en.md)

In der erweiterten Fassung öffnet **☰ → Eigene Karten** die Kartenbibliothek. **Neon Causeway laden** importiert das mitgelieferte Beispiel. Alternativ eine `.hovermap.json` auswählen und **Karte importieren** drücken. Die Draufsicht zeigt Böden, Wände und Flaggenplätze. Modern/Retro und 3–6 Flaggen pro Team wählen, dann starten. Das Schiff wird im Hauptmenü gewählt.

Bis zu acht Karten bleiben im lokalen Browserspeicher erhalten. **Exportieren** sichert die gewählte Karte einschließlich Texturen; Browserdaten können gelöscht werden, daher wichtige Karten exportieren. Die bisherige gemeinsame Schiff-/Einstellungssicherung enthält keine Karten. Karten können einzeln gelöscht und wieder importiert werden. Der Import ist derzeit für Einzelspieler; Multiplayer-Kartenübertragung und ein grafischer Editor stehen noch auf der TODO-Liste.

Für die freistehende Plattform in Arena 3 sammelt die KI zuerst ein vorhandenes Sprung-Extra und verbraucht beim Springen eine Ladung. Sie erhält keine Gratisladungen. Ohne erreichbares Sprung-Extra kann sie eine ausschließlich per Sprung erreichbare Flagge nicht holen. Die Sprungplanung unterstützt einen Sprung pro Route, keine beliebigen Ketten von Sprungplattformen.

## Neon Causeway

**Neon Causeway ist fest als Karte 4 integriert.** Im Einzelspieler startet sie nach Abschluss von Karte 3 automatisch; Modern und Retro verhalten sich gleich. Mit freigeschalteter Levelauswahl ist sie direkt wählbar. Im Multiplayer steht sie ohne Import in Kartenauswahl, Abstimmung und Rotation bereit (Server ab 0.5.1). Nach Karte 4 endet der Einzelspieler-Durchlauf. Beliebige selbst importierte Karten bleiben vorerst Einzelspieler-Karten.

33.792 × 33.792 Einheiten: **50 % längere Seiten** als eine 22.528-Einheiten-Originalarena, entsprechend 125 % mehr Fläche. Vier breite Treppen mit jeweils 24 Stufen führen 1.536 Einheiten nach oben. Ein umlaufender Ring und Querbrücken verbinden die obere Ebene. Unter den Brücken bleibt die untere Ebene befahrbar. Beide Teams haben sechs mögliche Flaggenplätze, darunter obere und untere Plätze.

Alle Arenen der erweiterten Fassung erhalten eine höhenabhängige Gegner-Wegfindung. Sie prüft befahrbare Verbindungen, Treppen und die Durchfahrt unter oberen Flächen. Gegner fahren mit normaler Physik über die Treppen und können obere Flaggen sammeln. Die beiden archivierten Originalfassungen behalten ihre ursprüngliche KI. In importierten Karten müssen Wegpunkte passende Treppenein-/ausgänge und Plattformverbindungen enthalten; die Beispielkarte bringt diese mit. Die Suche ist begrenzt und behandelt getrennte Wegnetze ohne Endlosschleifen. Der Kartenimport prüft Geometrie, Ressourcen und Aufstellorte, garantiert aber keine spielerische Erreichbarkeit beliebiger Karten.

In der erweiterten Fassung werden Flaggenplätze zwischen Rot und Blau verteilt. Erhöhte Plätze sind nicht mehr ausschließlich blau. Wenn nur ein erhöhter Platz vorhanden ist, wird seine Teamfarbe zufällig bestimmt; mehrere werden möglichst gleichmäßig verteilt. Die Regel gilt auch im Multiplayer. Die Kartenvorschau zeigt mögliche Plätze, keine festgelegte Rundenaufstellung.

## Datenformat, Version 1

Das [Beispielpaket](modifications/maps/Neon-Causeway.hovermap.json) ist zugleich Vorlage. Keine JavaScript-Dateien oder externen Ressourcen:

- `format: "hover-map"`, `version: 1`, `name`, `author`, `description`.
- `assets.wall`, `assets.floor`, `assets.sky`: eingebettete PNG/JPEG-Daten-URLs, je maximal 8 MiB Zeichen, maximal 4096 × 4096 Pixel. Laufzeittexturen werden für den alten Renderer auf 512² bzw. 1024 × 512 begrenzt.
- `maze.Walls`: `A` und `B` mit `X,Y,Z`; `A.Y` ist Unterkante, `B.Y` Oberkante. Gleiche Wandgrundrisse zusammenführen. `Step: true` kennzeichnet bis zu 64 Einheiten hohe Treppenstirnseiten: Diese werden gezeichnet, aber nicht als senkrechte Hindernisse behandelt; die Bodenflächen tragen das Schiff.
- `maze.Floors`: geschlossene, ebene, konvexe `Points`-Polygone (erster Punkt am Ende wiederholen). Mehrere Höhen sind möglich. Treppen werden aus einzelnen ebenen Flächen gebaut; geneigte Polygone sind nicht erlaubt.
- `Spawns` und `Flags`: Punkte mit `Team: "RED"` oder `"BLUE"`; mindestens ein roter und sechs blaue Startpunkte sowie sechs Flaggenplätze je Team.
- `Pods` und `Beacons`: Punkte mit `X,Y,Z`; mindestens acht Wegpunkte. Startpunkte liegen normalerweise 96 Einheiten über dem Boden, Flaggen 1 Einheit darüber.

Grenzen: 16 MiB Paket, 2.048 Wände, 1.024 Bodenpolygone, 50.000 Einheiten Seitenlänge; Koordinatenbetrag maximal 50.000. Das sind bewusst gesetzte Importgrenzen, keine nachgewiesenen Maximalwerte der Engine. Die Kollisionssuche wird für importierte Karten über die gesamte Kartenausdehnung aufgebaut. Bestzeiten verwenden den vollständigen Kartenhash, damit verschiedene Kartenstände nicht vermischt werden.

Erzeugen des Beispiels: `python3 scripts/build_cyber_map.py`. [Herkunft der Texturen](NEW-ASSETS.md).
