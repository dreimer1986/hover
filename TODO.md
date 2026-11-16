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

- [ ] NAS auf v0.3.0 aktualisieren und mit echten Geräten testen / Update NAS to v0.3.0 and test with actual devices.
