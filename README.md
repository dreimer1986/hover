# Hover! — Erweiterte Fassung und Archiv

**Deutsch** · [English](README.en.md)

Das Browser-Remake von Hover! mit einer erweiterten Fassung und erhaltenen Originalversionen.

**Spielen mit Multiplayer: [hover.dreimer.de](https://hover.dreimer.de/)**

[GitHub-Pages-Alternative](https://dreimer1986.github.io/hover/) · [Originalfassungen und Store-Downloads](https://dreimer1986.github.io/hover/?view=archive)

Die erweiterte Fassung startet standardmäßig auf PC und Mobilgeräten. Sie bietet:

- Den ursprünglichen Startbildschirm mit Einzelspieler, Multiplayer und Retro-Modus.
- Optionales Touch-Steuerkreuz, Aktionstasten, Großansicht und Vollbild; mobil sind Touch und Großansicht voreingestellt.
- Drei Arenen in Modern und Retro, drei bis sechs Flaggen pro Team und automatischen Kartenfortschritt im Einzelspieler.
- Freischaltbare Einzelspieler-Kartenauswahl: in die Mitte des **O** im Hover-Logo drücken. Ohne Freischaltung beginnt eine Partie mit Karte 1.
- Multiplayer-Lobbys für bis zu acht Spieler mit Teamwahl, wechselnden Arenen, Modern/Retro und abschließenden Punkten über mehrere Runden.
- Deutsche oder englische Bedienoberfläche entsprechend der Browsersprache und gemeinsame Audioausgabe für Musik, Motor und Effekte.

Am PC: Pfeiltasten, Leertaste und A/S/D. Vollbild erfordert einen Tastendruck und Browser-Unterstützung; Großansicht funktioniert auch ohne Vollbild-API. Querformat wird auf Handys empfohlen.

## Multiplayer und NAS

Auf [hover.dreimer.de](https://hover.dreimer.de/) **Multiplayer** wählen, Namen eingeben, Lobby erstellen oder per Raumcode beitreten. Teams selbst wählen; der Gastgeber legt Arena, Grafik und Flaggenzahl fest. Nach jeder Runde bleibt die Lobby geöffnet. **Lobby beenden · Punkte** zeigt die Endabrechnung.

Der Python-/WebSocket-Server läuft ohne Microsoft-Dienste im Docker-Container auf **8080/TCP**, öffentlich hinter einem HTTPS-Reverse-Proxy. [Installation und Aktualisierung auf Synology](SERVER.md) · [Container v0.3.3 herunterladen](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.3.3).

## Lokal starten

Python 3.10 oder neuer; für die statische Website keine zusätzlichen Build-Abhängigkeiten:

```sh
python3 scripts/build_site.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Anschließend http://127.0.0.1:8000/ öffnen. Für lokalen Multiplayer siehe [SERVER.md](SERVER.md).

## Erhaltene Fassungen

| Sicherung | Inhalt |
| --- | --- |
| Frühe Webfassung | Snapshot vom 02.10.2013 |
| Späte Webfassung | Snapshot vom 11.03.2019, Spielcode vom 28.07.2017 |
| Windows AppxBundle | Vollständiges Originalpaket aus HoverWinRT, Version 1.1.0.3 |
| Windows Appx-Paket | Vollständiges Originalpaket aus hover_202508, Version 1.1.0.3 |

Die Store-Pakete sind unterschiedliche Verpackungen derselben Spielversion. Originalarchive und Store-Pakete bleiben unverändert; Erweiterungen liegen getrennt in `modifications/`. Vollständige ZIPs stehen im [Archiv-Release](https://github.com/dreimer1986/hover/releases/tag/archive-2013); `python3 scripts/restore_windows.py` setzt sie lokal mit Prüfsummenprüfung zusammen.

[Restaurierung und dokumentierte Änderungen](RESTORATION.md) · [Server und Betrieb](SERVER.md) · [Ursprünglicher Multiplayer](MULTIPLAYER.md) · [Originalquellen und Rechte](THIRD_PARTY.md)

GitHub Actions baut und veröffentlicht die Website bei Pushes auf `master`. `python3 scripts/verify_archive.py` prüft die erhaltenen Originaldateien. Browser- und Servertests liegen unter `scripts/` und `server/`.

Die Schiffsauswahl zeigt Originalmodelle und Werte. **M** oder der Kartenknopf öffnet die große Radarübersicht; **M/Esc** schließt sie. Währenddessen sind Fahr- und Aktionseingaben gesperrt, die Partie läuft weiter. Erneutes Drücken in die Mitte des O sperrt die Levelauswahl wieder.

Standard-Controller: linken Stick/Steuerkreuz zum Fahren, A/Cross für Sprung, X/Square für Wand, B/Circle für Tarnung, rechter Trigger zum Feuern, Start/Back für die Karte. Nach der Erkennung ersetzt **Aus / Touch / Controller** den Touch-Schalter. Zum Start eine Taste drücken oder die Startfläche antippen. Das Menü kann mit Maus/Touch bedient werden. iPhone-Audio und NAS-Betrieb wurden vom Nutzer erfolgreich getestet.

Eigene Schiffe aus OBJ/FBX/GLTF/GLB importieren, Texturen und Größe in der Vorschau prüfen, Fahrpunkte verteilen und im Browser speichern. Exportpakete sichern die Bibliothek; Gastgeber können Schiffe mit der Lobby teilen. Benannte öffentliche Lobbys sind über die Serverliste auffindbar. [Schiffswerkstatt, Grenzen und öffentliche Lobbys](CRAFTS.md).
