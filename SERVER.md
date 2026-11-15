# Multiplayer auf Synology / Docker

**Deutsch** · [English](SERVER.en.md)

Der Container enthält den Python-Spielserver **und die Website**. Er benötigt nur **8080/TCP** im Container. Kein Microsoft-Dienst, keine Datenbank und kein Volume sind erforderlich. Räume liegen im Arbeitsspeicher und gehen bei einem Neustart verloren.

## Installation auf der Synology

1. Im [Release multiplayer-v0.1.1](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.1.1) das passende Image herunterladen:
   - **amd64** für Synology mit Intel-/AMD-Prozessor.
   - **arm64** für unterstützte NAS mit 64-Bit-ARM-Prozessor. Die NAS muss Container Manager/Docker unterstützen; nicht jedes ARM-Modell tut das. 32-Bit-ARM ist nicht enthalten.
2. In **Container Manager → Image/Abbild → Hinzufügen → Aus Datei hinzufügen** die Datei `hover-multiplayer-….tar.gz` importieren. Falls DSM die komprimierte Datei nicht annimmt, zuerst zu `.tar` entpacken.
3. Aus dem Image **hover-multiplayer:0.1.1** einen Container erstellen, automatischen Neustart aktivieren und **NAS-Port 8080 → Container-Port 8080, TCP** zuordnen. Keine Ordner einbinden und keinen privilegierten Modus verwenden.
4. `http://NAS-IP:8080/play/modified/` öffnen. Unter **Multiplayer** ist bei der Container-Website die aktuelle Adresse voreingestellt.

Die Menünamen können sich zwischen Docker und neueren Container-Manager-Versionen unterscheiden. Die mitgelieferte [compose.yaml](compose.yaml) kann alternativ als Container-Manager-Projekt importiert werden, nachdem das Image geladen wurde. Ist NAS-Port 8080 schon belegt, beispielsweise `18080:8080` verwenden und den Proxy auf 18080 richten.

Per SSH geht es alternativ so (Dateiname je nach Architektur):

```sh
sudo docker load -i hover-multiplayer-amd64.tar.gz
sudo docker compose -f compose.yaml up -d
```

Bei älterem DSM ohne Compose:

```sh
sudo docker run -d --name hover-multiplayer --restart unless-stopped \
  --read-only --cap-drop ALL --security-opt no-new-privileges:true \
  -p 8080:8080 hover-multiplayer:0.1.1
```

## Caddy 2: hover.dreimer.de

```caddyfile
hover.dreimer.de {
    reverse_proxy NAS-IP:8080
}
```

`NAS-IP` ersetzen. Läuft Caddy selbst im Container, meint `localhost` diesen Caddy-Container, nicht die NAS. Bei gemeinsamem Docker-Netzwerk kann stattdessen `hover-multiplayer:8080` verwendet werden.

Caddy übernimmt HTTPS und [WebSocket-Weiterleitung automatisch](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy). Öffentlich sind dann die üblichen HTTPS/HTTP-Ports von Caddy erforderlich; der Spielcontainer benötigt keine zusätzliche öffentliche UDP- oder TCP-Portfreigabe. Prüfen: `https://hover.dreimer.de/healthz` muss JSON mit `"status":"ok"` liefern.

Spiel starten: **https://hover.dreimer.de/play/modified/**. Die GitHub-Pages-Fassung kann ebenfalls verwendet werden; dort ist `https://hover.dreimer.de` als Spielserver voreingestellt. Solange der NAS-Dienst noch nicht eingerichtet ist, ist diese Adresse nur eine Vorgabe und keine Zusage einer funktionierenden Verbindung.

## DynDNS und direkte Verbindung

`http://dreimer1986.spdns.de:8080/play/modified/` funktioniert bei entsprechender Portweiterleitung direkt zum Container. Für öffentliche Nutzung empfehlen wir HTTPS über Caddy, auch mit einem frei gewählten externen Port. **Eine auf HTTPS geöffnete GitHub-Seite kann keinen unverschlüsselten `ws://`-Spielserver benutzen.** Entweder beide über die direkt bereitgestellte HTTP-Website im LAN testen oder einen gültigen HTTPS-Endpunkt verwenden.

Im Feld **Server-Adresse** lässt sich jede passende HTTP-/HTTPS-Adresse mit Port eintragen. Einladungslinks enthalten Raumcode und Serveradresse. Die Verbindung führt immer zu `/ws` an dieser Adresse; der Proxy sollte die Domain-Wurzel unverändert weiterreichen.

## Spielen

Name, Hovercraft und Arena wählen, unter Multiplayer einen Raum für maximal 2/4/6/8 Spieler erstellen und den Einladungslink teilen. Beitretende Spieler wählen ihren Namen und Hovercraft. Der Gastgeber startet mit einer geraden Spielerzahl; Teams werden ausgeglichen verteilt. Alle sammeln die vier gegnerischen Flaggen. Es gibt drei Arenen, gemeinsame Items, temporäre Wände, Kollisionen und die vorhandenen Waffenereignisse. Ein Verbindungsabbruch beendet die laufende Runde mit einer Meldung; für die nächste Runde einen neuen Raum erstellen.

Der neue Multiplayer verwendet zunächst die normale Grafik. Der Einzelspieler einschließlich Retro und die beiden erhaltenen Originalfassungen bleiben verfügbar.

## Einstellungen und Betrieb

- `PORT`: interner HTTP-/WebSocket-Port, Standard 8080. Bei Änderung auch Healthcheck und Portzuordnung anpassen; normalerweise unverändert lassen.
- `ALLOWED_ORIGINS`: zusätzliche erlaubte Website-Ursprünge, durch Kommas getrennt. Standard: `https://dreimer1986.github.io,https://hover.dreimer.de`. Die eigene Website-Adresse des Containers wird zusätzlich zugelassen. Bei abweichenden externen Spiel-Websites deren Ursprung inklusive Port ergänzen.
- `MAX_ROOMS=32`, `MAX_CLIENTS=256`: Begrenzungen, keine gemessene Kapazitätszusage für eine NAS.
- Räume verfallen spätestens nach einer Stunde, wartende/ladende/beendete Räume nach zehn Minuten. Serverneustart beendet alle Runden.
- `/healthz`: Zustand und Anzahl der Räume/Verbindungen. Kein öffentliches Administrationsinterface.
- `docker logs hover-multiplayer`: Fehlerdiagnose. Spielerzustände werden nicht dauerhaft gespeichert.

## Umfang, Herkunft und Tests

Dies ist ein neu implementierter Ersatzserver, kein wiedergefundenes Microsoft-Backend. Der Clientadapter `modifications/multiplayer.js` ersetzt SignalR durch unser JSON/WebSocket-Protokoll v1; die bestehende Multiplayer-Engine übernimmt Darstellung und lokale Physik. `server/maps.json` enthält ausschließlich Spawn-, Flaggen- und Itempositionen aus `web/2019-03-11/scripts/mazes.c3a2bdf0.js`. Vier Flaggen pro Team werden aus den vorhandenen Positionen gewählt. Die moderne Originalengine ignorierte Itemhöhen (`Y=20`); nur im neuen Multiplayer wird die Kartenhöhe wieder eingesetzt.

Räume, Teamzuordnung, einmalige Itemvergabe und Flaggenzustände werden serverseitig verwaltet. Bewegung und Effekte bleiben weitgehend clientberechnet. Es gibt Größen-/Ratenlimits und grundlegende Zustands-/Abstandsprüfungen, aber keine vollständige serverseitige Physik oder wettkampftaugliche Betrugserkennung. Rückgabefelder, Waffen und Inventar werden nicht vollständig serverautoritativ simuliert. Keine dauerhafte Rangliste, kein Wiedereinstieg in laufende Runden und keine Wiederherstellung nach Serverneustart.

Tests: `python -m unittest server.test_server -v` prüft unter anderem acht Clients, Raumgrenzen, Teamverteilung, Zustände, doppelte Flaggen-/Itemereignisse, Herkunftsprüfung und Verbindungsabbrüche. `scripts/multiplayer_smoke.cjs` prüft zwei echte Browserkontexte mit Lobby, replizierter Bewegung, Itemvergabe, gemeinsamen Flaggen und Rundenausgang. Gezielte Teleports im Test prüfen Sammelereignisse; sie sind kein kompletter manueller Kartendurchlauf. Weitere Tests auf der tatsächlichen NAS und über das Internet bleiben erforderlich.

Die Originalarchive und Store-Pakete wurden nicht verändert. [Analyse der alten Schnittstelle](MULTIPLAYER.md) · [Restaurierung](RESTORATION.md)

## Image selbst bauen

```sh
docker build -t hover-multiplayer:0.1.1 .
docker compose up -d
```

GitHub Actions baut native Linux-Images für amd64 und arm64 und legt importierbare Docker-Archive im Release ab. Dadurch ist zum Import auf der NAS kein GitHub-Registry-Login erforderlich.
