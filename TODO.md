# Audio-Nachtest / Audio retest

- **Umgesetzt am 15.11.2026:** Die modifizierte Fassung verwendet vorbereitete PCM-Motorschleifen mit geglättetem Übergang. Original-Samples und Archivfassungen bleiben unverändert. Automatisierte Tests prüfen wiederholte Schleifen; der Hörtest auf dem betroffenen iPhone steht noch aus. Android-Audio wurde vor dieser Änderung vom Nutzer als korrekt bestätigt.
- **Implemented November 15, 2026:** The modified edition uses prepared PCM engine loops with a blended transition. Original samples and archived editions remain unchanged. Automated tests check repeated loops; listening on the affected iPhone still needs confirmation. The user confirmed correct Android audio before this change.

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

- [ ] Neuer Container auf der NAS und Multiplayer über Caddy / Updated NAS container and multiplayer through Caddy.
- [ ] Durchgehender Motorlauf auf dem betroffenen iPhone / Continuous engine loop on the affected iPhone.
