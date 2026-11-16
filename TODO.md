# Geplante Erweiterungen / Planned improvements

**Stand / Recorded: 16.11.2026.** Diese Liste hält die besprochenen Ideen fest; sie ist kein Auftrag, sie sofort umzusetzen. Zuerst testet der Nutzer den aktuellen Stand. Danach werden Umfang und Reihenfolge wieder aufgenommen. / This list records the discussed ideas; it does not authorize immediate implementation. The user will test the current release first, then revisit scope and order.

Vorgeschlagene Reihenfolge / Suggested order: Einstellungen und Pause → vollständige Controller-Bedienung → Werkstatt-Testfahrt → Multiplayer-Komfort → Bestzeiten → Karteneditor. Rennstrecken zunächst technisch erproben, dann Zeitfahren, danach Multiplayer-Rennen; Renn-KI zuletzt und separat. / Settings and pause → full controller navigation → workshop test drive → multiplayer usability → personal records → map editor. Validate track feasibility first, then time trials, multiplayer races, and finally racing AI as a separate project.

## Zuerst: aktuellen Stand testen / First: test the current release

- [ ] Nutzerfeedback zu v0.3.5 sammeln, bevor neue Funktionen begonnen werden / Collect user feedback on v0.3.5 before starting new features.
- [ ] PC, Android/iPhone, echte Controller und NAS-Multiplayer prüfen / Check PC, Android/iPhone, physical controllers and NAS multiplayer.
- [ ] Besonders Import/Export, Texturen, Drehung, Speichern/Neuladen, Außenansicht und Schiffsteilung prüfen / Focus on import/export, textures, orientation, persistence, chase view and shared crafts.
- [ ] Einheitliche Vergleichswerte und die neuen Erläuterungen auf Verständlichkeit prüfen / Check that the shared comparison scale and handling explanations are understandable.

## 1. Pause und Einstellungen / Pause and settings

- [ ] Echtes Pausenmenü im Einzelspieler; im Multiplayer öffnet sich das Menü bei weiterlaufender Partie / Actual single-player pause; multiplayer menu leaves the match running.
- [ ] Getrennte Lautstärke für Musik, Motor und Effekte / Separate music, engine and effects volume.
- [ ] HUD-Größe, Kameradistanz und Touch-Bedienung einstellbar machen / Adjustable HUD size, camera distance and touch controls.
- [ ] Einstellungen dauerhaft speichern und auf Standard zurücksetzen können / Persist preferences and provide a reset to defaults.

## 2. Steuerung und Controller-Menüs / Input and controller menus

- [ ] Frei belegbare Tastatur- und Controller-Aktionen / Rebindable keyboard and controller actions.
- [ ] Stick-Totzone und Empfindlichkeit einstellbar machen / Adjustable stick dead zone and sensitivity.
- [ ] Startmenü, Schiffsauswahl, Lobby und Einstellungen vollständig per Controller bedienen / Full controller navigation for the home screen, craft selection, lobbies and settings.
- [ ] Sichtbaren Fokus und verständliche Bestätigen-/Zurück-Aktionen sicherstellen / Visible focus and clear confirm/back actions.

## 3. Einführung und Training / Introduction and training

- [ ] Kurze optionale Trainingsrunde für neue Spieler / Short optional training round for new players.
- [ ] Flaggen, Sprung, Tarnung, Wände, eingesammelte Extras und HUD-Anzeigen praktisch erklären / Teach flags, jumping, cloaking, walls, pickups and HUD indicators through play.

## 4. Bestzeiten und Wiederholungen / Records and replays

- [ ] Persönliche Bestzeiten pro Karte, Schiff, Modern/Retro und Flaggenzahl speichern / Store personal records by map, craft, Modern/Retro and flag count.
- [ ] Regeln und eigene Schiffe klar unterscheiden, damit Zeiten sinnvoll vergleichbar bleiben / Separate rulesets and custom crafts so records remain meaningfully comparable.
- [ ] Geisterschiff der eigenen Bestzeit als spätere Erweiterung prüfen / Consider a ghost of the player's best run as a later extension.
- [ ] Rennzeiten und Rundenrekorde in denselben Speicheransatz integrieren / Integrate race times and lap records into the same storage design.

## 5. Multiplayer-Komfort / Multiplayer usability

- [ ] Bereit-Schalter und Start-Countdown / Ready state and start countdown.
- [ ] Ping-Anzeige / Ping display.
- [ ] Kartenabstimmung und einstellbare Kartenrotation / Map voting and configurable rotation.
- [ ] Wiederverbinden nach kurzem Verbindungsabbruch mit Wiederherstellung der Sitzung / Reconnect after a brief disconnect and restore the session.
- [ ] Gastgeberrolle übergeben, wenn der Gastgeber geht / Transfer host ownership when the host leaves.
- [ ] Gastgeber kann störende Spieler aus öffentlichen Lobbys entfernen / Let hosts remove disruptive players from public lobbies.
- [ ] Einfache Schnellnachrichten für die Verständigung / Simple quick messages for communication.

## 6. Schiffswerkstatt und Testfahrt / Craft workshop and test drive

- [ ] Kleine Teststrecke direkt aus der Werkstatt starten und anschließend direkt zum Editor zurückkehren / Launch a small test track from the workshop and return directly to editing.
- [ ] Import, Ausrichtung und Fahrpunkte dadurch unmittelbar praktisch ausprobieren / Immediately try imported geometry, orientation and handling points in play.
- [ ] Sichtbare Markierung für vorne/Fahrtrichtung in der Importvorschau / Visible front/forward-direction marker in the import preview.
- [x] Standard- und eigene Schiffe auf derselben Fünf-Werte-Skala vergleichen / Compare stock and custom crafts on the same five-attribute scale.
- [x] Eigenschaften, Punktelimit und Anfängerfreundlichkeit erklären / Explain handling attributes, the point cap and beginner-friendly handling.

Die letzten beiden Punkte sind bereits umgesetzt (v0.3.4/v0.3.5), nicht erneut einplanen. „Nachdrehen“ bedeutet: mehr Punkte → weniger Drehdämpfung → längeres Weiterdrehen nach Loslassen. / The last two items are already implemented (v0.3.4/v0.3.5); do not schedule them again. More “Turn coasting” points mean less rotational damping and longer rotation after steering is released.

## 7. Offline-Nutzung und Archiv / Offline use and preservation

- [ ] Benutzerfreundliches vollständiges Offline-Paket mit einfacher lokaler Startmöglichkeit / User-friendly complete offline package with a simple local launcher.
- [ ] Gesamte eigene Schiffsbibliothek und Einstellungen gemeinsam sichern und wiederherstellen / Back up and restore the entire custom-craft library and preferences together.
- [ ] Herkunft, Veröffentlichungs- und Archivdatum direkt bei den Fassungen verständlich anzeigen / Clearly show provenance, release dates and archive dates alongside each edition.
- [ ] Bekannte Lücken und dokumentierte Ersatzdateien verständlich zugänglich machen / Make known gaps and documented replacement assets easy to understand and find.
- [ ] Kleine bebilderte Zeitleiste ergänzen / Add a small illustrated timeline.
- [ ] Deutlich erklären: später Websnapshot 2019 enthält Spielcode von 2017; beide Store-Pakete sind unterschiedliche Verpackungen derselben Version / Explain that the 2019 web snapshot contains 2017 game code and that both Store packages wrap the same game version.

## 8. Karteneditor / Map editor

- [ ] Auf vorhandenen strukturierten Maze-Daten aufbauen / Build on the existing structured Maze data.
- [ ] Erste Fassung als Raster-/Draufsicht mit einfachen Bauteilen: Wände, Bodenflächen, Höhen und Texturen / Start with a grid/top-down editor for simple walls, floors, heights and textures.
- [ ] Startplätze, Flaggenplätze, Items und weitere Spielobjekte platzieren / Place spawns, flags, pickups and other game objects.
- [ ] 3D-Vorschau mit der Hover-Engine und direkter Probefahrt / Hover-engine 3D preview and immediate test drive.
- [ ] Erreichbare Start-/Flaggenplätze, ausreichende Flaggenpositionen und sinnvolle Kollisionsflächen prüfen / Validate reachable spawns/flags, sufficient flag positions and sensible collision geometry.
- [ ] Für Rennen Startaufstellung, Ziellinie und geordnete Checkpoints ergänzen / Add race grids, finish lines and ordered checkpoints.
- [ ] OBJ/GLTF später als Dekoration erwägen; eine automatische Umwandlung beliebiger 3D-Modelle in spielbare Karten ist ein separates Projekt / Consider OBJ/GLTF decoration later; automatic conversion of arbitrary models into playable maps is a separate project.

## 9. Rennmodus und größere Strecken / Racing and larger tracks

### Technische Prüfung vor Umsetzung / Technical validation before implementation

Diese Befunde stammen aus einer Quellcodeprüfung, nicht aus einem Großkarten-Belastungstest. / These findings come from source inspection, not large-map stress testing.

| Bereich / Area | Befund / Finding |
| --- | --- |
| Originalkarten / Stock maps | Ungefähr 20.000–22.500 Einheiten breit/tief / Roughly 20,000–22,500 units across |
| Kollisionssuche / Collision lookup | Festes Rechteck von −10.000 bis +30.000 auf X/Z, also 40.000 × 40.000 / Fixed X/Z rectangle from −10,000 to +30,000, or 40,000 × 40,000 |
| Hauptkamera / Main camera | Ferne Clipping-Ebene bei 25.000; Sichtweite ist keine Kartenlängengrenze / Far plane at 25,000; view distance is not a map-length cap |
| Multiplayer / Multiplayer | Positionsprüfung derzeit bis ±100.000 je Achse / Current position validation allows ±100,000 per axis |
| Geometrie / Geometry | Alle statischen Geometriegruppen werden gezeichnet / All static geometry groups are drawn |
| Schiffsimport / Craft import | Das 4.096-Dreiecke-Limit gilt für Schiffe, nicht für Karten / The 4,096-triangle limit applies to crafts, not maps |

Quellen im Repository / Repository references: [Spielcode / Game code](web/2019-03-11/scripts/game.cbbb14d7.js), [Kartendaten / Map data](web/2019-03-11/scripts/mazes.c3a2bdf0.js), [Server](server/app.py). Im Spielcode sind insbesondere der World-Konstruktor (`wallQuad`), `getCollisionXYZ`, `checkCraftAgainstStaticGeometry`, die Kartendarstellung und die Kameraeinstellungen relevant. / Relevant game paths include the world constructor (`wallQuad`), collision queries, static rendering and camera settings.

- [ ] Kollisions-Suchbereich dynamisch aus den tatsächlichen Kartengrenzen mit Reserve ableiten / Derive collision bounds dynamically from actual map bounds with a margin.
- [ ] Kollisionen an alten und neuen Bereichsgrenzen prüfen; außerhalb der alten Fläche dürfen keine Wände aus der Suche verschwinden / Verify old and new boundaries; walls outside the old region must remain collidable.
- [ ] Multiplayer-Positionsgrenzen passend erweitern beziehungsweise kartenbezogen prüfen; Validierung beibehalten / Extend or map-scope multiplayer position limits while retaining validation.
- [ ] Einfache Teststrecke mit langen Geraden und weiten Kurven erstellen; zunächst auch innerhalb der bisherigen Fläche erproben / Build a simple course with long straights and sweeping turns; first also test within the existing area.
- [ ] Ladezeit, Speicher, Bildrate und Kollisionen auf PC und Mobilgeräten messen / Measure load time, memory, frame rate and collision behaviour on PC and mobile devices.
- [ ] Größere Fläche und höhere Detaildichte getrennt testen; daraus belastbare Grenzen ableiten / Test physical extent and detail density separately to establish practical limits.
- [ ] Bei Bedarf abschnittsweise Darstellung beziehungsweise Ausblenden entfernter Streckenbereiche ergänzen / Add section-based rendering or distant-section culling if needed.
- [ ] Sichtweite, Nebel, Radar und Außenkamera für lange Strecken prüfen / Review view distance, fog, radar and chase camera on long tracks.

### Spielregeln und Ausbau / Rules and rollout

- [ ] Zuerst Zeitfahren auf einer einfachen Teststrecke / Start with time trials on a simple test course.
- [ ] Startaufstellung und Countdown / Starting grid and countdown.
- [ ] Checkpoints in vorgeschriebener Reihenfolge und mit Überfahrtrichtung; Abkürzungen dürfen keine gültige Runde ergeben / Ordered directional checkpoints; shortcuts must not count as valid laps.
- [ ] Rundenanzahl, Rundenzähler, Rundenzeiten, Gesamtzeit und Platzierung / Lap count, lap counter, lap times, total time and race position.
- [ ] Zurücksetzen zum letzten gültigen Streckenpunkt / Reset to the last valid track point.
- [ ] Eigenes Renn-HUD statt Flaggenanzeigen / Race HUD replacing flag indicators.
- [ ] Regeln für Waffen, platzierbare Hindernisse und Extras festlegen / Define rules for weapons, deployable obstacles and pickups.
- [ ] Modern und Retro berücksichtigen / Support both Modern and Retro.
- [ ] Danach Multiplayer-Rennen mit den vorhandenen bis zu acht Spielern / Then add multiplayer races for the existing maximum of eight players.
- [ ] Rennfortschritt, Checkpointfolge und Ergebnisse serverseitig prüfen / Validate progress, checkpoint order and results on the server.
- [ ] Rennrunden in die bestehende dauerhafte Lobby und Kartenrotation integrieren / Integrate races with persistent lobbies and map rotation.
- [ ] Renn-KI separat und zuletzt prüfen; die vorhandene Flaggen-/Verfolger-KI kann nicht unverändert mitfahren / Evaluate racing AI separately and last; existing flag/pursuit AI cannot race unchanged.

## Übergreifende Vorgaben / Cross-cutting requirements

- Originalarchive und restaurierte Originalfassungen erhalten; neue Spielregeln nur in der erweiterten Fassung / Preserve original archives and restored editions; add new rules only to the extended edition.
- Neue Bedienoberflächen und Dokumentation auf Deutsch und Englisch / Provide new UI and documentation in German and English.
- PC, Touch und Controller bei Planung und Tests berücksichtigen / Consider PC, touch and controller use in design and testing.
- Rennmodus und Editor sind bisher Vorschläge, keine bereits vorhandenen Funktionen / Racing and the map editor remain proposals, not existing features.

---

# Bisheriger Umsetzungsstand / Previous implementation status

# Audio-Nachtest / Audio retest

- **Umgesetzt am 15.11.2026:** Die modifizierte Fassung verwendet vorbereitete PCM-Motorschleifen mit geglättetem Übergang. Original-Samples und Archivfassungen bleiben unverändert. Automatisierte Tests prüfen wiederholte Schleifen; der Nutzer hat den erfolgreichen iPhone-Hörtest bestätigt. Android-Audio wurde vor dieser Änderung vom Nutzer als korrekt bestätigt.
- **Implemented November 15, 2026:** The modified edition uses prepared PCM engine loops with a blended transition. Original samples and archived editions remain unchanged. Automated tests check repeated loops; the user confirmed successful listening on the affected iPhone. The user confirmed correct Android audio before this change.

# Abgleich der Anforderungen / Request checklist

Umgesetzt / Implemented:

- [x] Ursprünglicher Startbildschirm und Stil / Original home screen and styling.
- [x] Versteckte O-Freischaltung mit Originalklang und Text / Hidden O unlock with original sound and message.
- [x] Drei Arenen in Modern/Retro, 3–6 Flaggen je Team, passender Retro-Rahmen / Three arenas in Modern/Retro, 3–6 flags per team, fitted Retro frame.
- [x] Einzelspieler-Kartenfortschritt in beiden Grafikmodi / Single-player progression in both graphics modes.
- [x] Dauerhafte Lobby zwischen Runden, Teamwahl, Gastgeber-Einstellungen und Endabrechnung / Persistent lobby between rounds, team choice, host settings and final scores.
- [x] Öffentliche HTTPS/WSS-Verbindungen, Caddy-Integration / Public HTTPS/WSS connections, Caddy integration.
- [x] Erweiterte Fassung als Standard auf allen Geräten; Originalfassungen separat erhalten / Extended edition default on all devices; original releases preserved separately.
- [x] Deutsche/englische Oberfläche und Dokumentation, gekürzte README mit Spieladresse / German/English interface and documentation, concise README with play URL.
- [x] Synology-Updateanleitung für v0.2.0 / Synology update instructions for v0.2.0.

Am Gerät nach Veröffentlichung prüfen / Check on actual devices after publication:

- [x] Container v0.2.0 auf der NAS und Multiplayer über Caddy / v0.2.0 NAS container and multiplayer through Caddy.
- [x] Durchgehender Motorlauf auf dem betroffenen iPhone / Continuous engine loop on the affected iPhone.

# Neue Erweiterungen vom 16.11.2026 / New enhancements, November 16, 2026

- [x] Schiffsvorschau und Originalwerte; O-Schalter mit Sieg-/Niederlagenklängen / Craft preview/statistics; O toggle with win/loss cues.
- [x] Große modale Karte, M/Esc/Touch/Controller / Large modal map, M/Esc/touch/controller.
- [x] Startfläche und Controller-Auswahl; kompakte Breite / Start gate and controller selection; compact width.
- [x] Ausklappbare Übersicht; veraltetes Empfehlungsbanner entfernt / Expandable change overview; obsolete recommendation banner removed.
- [x] OBJ/GLTF/GLB, Texturatlas, Vorschau im Importbereich, Größenlimits / OBJ/GLTF/GLB, texture atlas, in-workshop preview and size limits.
- [x] Punktebudget, Browser-/Serverprüfung, Persistenz, Import/Export / Point budget, browser/server validation, persistence and import/export.
- [x] Gastgeber-Schiffe teilen, Prüfsummen-Cache, Gastschiffe behalten / Host sharing, checksum cache, retain guest crafts.
- [x] Außenansicht ohne Verschieben des Fahrzeugs / Chase view without moving the vehicle.
- [x] Benannte, optional öffentliche Lobbys mit Suchliste / Named, optionally public lobbies and discovery.
- [x] Map-Editor-Einschätzung dokumentiert / Map editor assessment documented.

Nach diesem Release noch am Gerät prüfen / Actual-device checks after this release:

- [ ] Aktuellen Stand v0.3.5 auf NAS und echten Geräten testen; Container bei Bedarf aktualisieren / Test current v0.3.5 on NAS and actual devices; update the container if needed.
