# Multiplayer auf Synology / Docker

**Deutsch** · [English](SERVER.en.md)

Der Container enthält den Python-Spielserver **und die Website**. Er benötigt nur **8080/TCP** im Container. Kein Microsoft-Dienst, keine Datenbank und kein Volume sind erforderlich. Räume liegen im Arbeitsspeicher und gehen bei einem Neustart verloren.

## Installation auf der Synology

1. Im [Release multiplayer-v0.3.2](https://github.com/dreimer1986/hover/releases/tag/multiplayer-v0.3.2) das passende Image herunterladen:
   - **amd64** für Synology mit Intel-/AMD-Prozessor.
   - **arm64** für unterstützte NAS mit 64-Bit-ARM-Prozessor. Die NAS muss Container Manager/Docker unterstützen; nicht jedes ARM-Modell tut das. 32-Bit-ARM ist nicht enthalten.
2. In **Container Manager → Image/Abbild → Hinzufügen → Aus Datei hinzufügen** die Datei `hover-multiplayer-….tar.gz` importieren. Falls DSM die komprimierte Datei nicht annimmt, zuerst zu `.tar` entpacken.
3. Aus dem Image **hover-multiplayer:0.3.2** einen Container erstellen, automatischen Neustart aktivieren und **NAS-Port 8080 → Container-Port 8080, TCP** zuordnen. Keine Ordner einbinden und keinen privilegierten Modus verwenden.
4. Caddy wie unten beschrieben auf den NAS-Port richten und **https://hover.dreimer.de/** öffnen. Unter **Multiplayer** ist bei der Container-Website die aktuelle HTTPS-Adresse voreingestellt.

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
  -p 8080:8080 hover-multiplayer:0.3.2
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

## HTTPS und DynDNS

Öffentliche Multiplayer-Verbindungen erfordern **HTTPS/WSS** mit gültigem Zertifikat, auch bei DynDNS und frei gewählten Ports. Im Feld **Server-Adresse** eine HTTPS-Adresse eintragen. Die einzige HTTP-Ausnahme ist ein lokaler Entwicklungstest, bei dem sowohl Website als auch Server auf `localhost`, `127.0.0.1` oder `[::1]` liegen. LAN-Adressen sind keine Ausnahme.

Caddy beendet TLS; innerhalb des privaten Netzes erreicht er den Container per HTTP auf Port 8080. Diesen Port nicht direkt ins Internet freigeben. Einladungen enthalten Raumcode und Serveradresse; der WebSocket-Endpunkt ist `/ws`, der Proxy reicht die Domain-Wurzel unverändert weiter.

## Spielen und Punkte

Name und Hovercraft wählen, **Multiplayer** öffnen, Lobby für maximal 2/4/6/8 Spieler erstellen und Einladungslink teilen. Jeder wählt Rot oder Blau (höchstens vier Spieler je Team). Beide Teams müssen mindestens einen Spieler enthalten; ungleiche Teamgrößen sind erlaubt. Die Farbe entspricht dem Team. Der Gastgeber wählt eine der drei Arenen, Modern oder Retro und drei bis sechs Flaggen pro Team.

Nach einer Runde kehren alle in **dieselbe Lobby** zurück. Der Gastgeber kann Karte, Grafik und Flaggenzahl ändern und die nächste Runde starten; alle können ihr Team wechseln. **Lobby beenden · Punkte** beendet die Sitzung für alle und zeigt die Punkte. Ein Flaggenpunkt zählt für den Spieler, dessen eroberte Flagge am Ende einer abgeschlossenen Runde noch erobert ist; zurückgegebene Flaggen zählen nicht. Persönliche Siege zählen für alle Mitglieder des Siegerteams, Teams erhalten jeweils einen Rundensieg. Abgebrochene Runden geben keine Punkte. Teamwechsel ändern bereits verdiente persönliche Punkte nicht.

Bei Verbindungsabbruch wird die Runde abgebrochen, die übrigen Spieler bleiben in der Lobby. Verlässt der Gastgeber die Lobby, wird ein verbleibender Spieler Gastgeber. Einzelne Spieler können selbst austreten. Der letzte Austritt oder ein Serverneustart löscht die Lobby. Punkte sind nur für diese Sitzung gespeichert; ein erneuter Beitritt erhält eine neue Spieleridentität.

## Bestehenden Synology-Container aktualisieren

1. Laufende Partien beenden. Passendes v0.3.2-Archiv herunterladen und in **Container Manager → Abbild/Image → Hinzufügen → Aus Datei** importieren. Das neue Image heißt `hover-multiplayer:0.3.2`.
2. Portzuordnung und Umgebungsvariablen des alten Containers notieren. Den alten Container stoppen und zur Rückfallmöglichkeit umbenennen, z. B. `hover-multiplayer-old`. Sein automatischer Neustart sollte deaktiviert sein.
3. Aus dem **neuen Image** einen neuen Container `hover-multiplayer` erstellen. Dieselben Ports (normalerweise `8080:8080`) und Umgebungsvariablen übernehmen, automatischen Neustart aktivieren. Keine Volumes und kein privilegierter Modus erforderlich. Ein bloßer Neustart des alten Containers aktualisiert sein Image nicht.
4. Den neuen Container starten. `https://hover.dreimer.de/healthz` muss `version: 0.3.2` und `protocol: 3` melden. Website neu laden, Lobby erstellen und beitreten. Caddy bleibt bei unveränderter Portzuordnung unverändert.
5. Nach erfolgreichem Test kann der alte Container entfernt werden. Für einen Rückfall den neuen stoppen und den alten wieder starten; gegebenenfalls dessen ursprünglichen Namen wiederherstellen. Laufende Lobbys werden nicht übertragen.

Bei Installation als **Compose-Projekt** stattdessen das neue Image importieren, die Image-Zeile im vorhandenen Projekt auf `hover-multiplayer:0.3.2` ändern und das Projekt neu erstellen. Eigene Port-/Origin-Einstellungen behalten. Per SSH im Projektverzeichnis:

```sh
sudo docker load -i hover-multiplayer-amd64.tar.gz
# compose.yaml: image: hover-multiplayer:0.3.2
sudo docker compose up -d --force-recreate
sudo docker compose ps
```

Das Release enthält [compose.yaml](compose.yaml) und diese Anleitung. Für ARM die arm64-Datei verwenden. Website und Server müssen beide Protokoll 3 verwenden (Server ab 0.3.0). Version 0.3.2 liefert außerdem FBX, DDS/TGA und manuelle Materialzuordnung für die auf der NAS gehostete Website.

## Einstellungen und Betrieb

- `PORT`: interner HTTP-/WebSocket-Port, Standard 8080. Bei Änderung auch Healthcheck und Portzuordnung anpassen; normalerweise unverändert lassen.
- `ALLOWED_ORIGINS`: zusätzliche erlaubte Website-Ursprünge, durch Kommas getrennt. Standard: `https://dreimer1986.github.io,https://hover.dreimer.de`. Die eigene Website-Adresse des Containers wird zusätzlich zugelassen. Bei abweichenden externen Spiel-Websites deren Ursprung inklusive Port ergänzen.
- `MAX_ROOMS=32`, `MAX_CLIENTS=256`: Begrenzungen, keine gemessene Kapazitätszusage für eine NAS.
- Belegte Lobbys bleiben geöffnet. Leere Reservierungen und hängende Ladevorgänge verfallen nach zehn Minuten. Serverneustart beendet alle Runden.
- `/healthz`: Zustand und Anzahl der Räume/Verbindungen. Kein öffentliches Administrationsinterface.
- `docker logs hover-multiplayer`: Fehlerdiagnose. Spielerzustände werden nicht dauerhaft gespeichert.

## Umfang, Herkunft und Tests

Dies ist ein neu implementierter Ersatzserver, kein wiedergefundenes Microsoft-Backend. Der Clientadapter `modifications/multiplayer.js` ersetzt SignalR durch unser JSON/WebSocket-Protokoll v3; die bestehende Multiplayer-Engine übernimmt Darstellung und lokale Physik. `server/maps.json` enthält ausschließlich Spawn-, Flaggen- und Itempositionen aus `web/2019-03-11/scripts/mazes.c3a2bdf0.js`. Drei bis sechs Flaggen pro Team werden aus den vorhandenen Positionen gewählt. Die moderne Originalengine ignorierte Itemhöhen (`Y=20`); nur im neuen Multiplayer wird die Kartenhöhe wieder eingesetzt.

Räume, Teamzuordnung, einmalige Itemvergabe und Flaggenzustände werden serverseitig verwaltet. Bewegung und Effekte bleiben weitgehend clientberechnet. Es gibt Größen-/Ratenlimits und grundlegende Zustands-/Abstandsprüfungen, aber keine vollständige serverseitige Physik oder wettkampftaugliche Betrugserkennung. Rückgabefelder, Waffen und Inventar werden nicht vollständig serverautoritativ simuliert. Keine dauerhafte Rangliste, kein Wiedereinstieg in laufende Runden und keine Wiederherstellung nach Serverneustart.

Tests: `python -m unittest server.test_server -v` prüft unter anderem acht Clients, Raumgrenzen, Teamverteilung, Zustände, doppelte Flaggen-/Itemereignisse, Herkunftsprüfung und Verbindungsabbrüche. `scripts/multiplayer_smoke.cjs` prüft zwei echte Browserkontexte mit Teamwechsel, mehreren Modern-/Retro-Runden in derselben Lobby, replizierter Bewegung, Itemvergabe, drei/sechs Flaggen und abschließender Punkteabrechnung. Gezielte Teleports im Test prüfen Sammelereignisse; sie sind kein kompletter manueller Kartendurchlauf. Weitere Tests auf der tatsächlichen NAS und über das Internet bleiben erforderlich.

Die Originalarchive und Store-Pakete wurden nicht verändert. [Analyse der alten Schnittstelle](MULTIPLAYER.md) · [Restaurierung](RESTORATION.md)

## Image selbst bauen

```sh
docker build -t hover-multiplayer:0.3.2 .
docker compose up -d
```

GitHub Actions baut native Linux-Images für amd64 und arm64 und legt importierbare Docker-Archive im Release ab. Dadurch ist zum Import auf der NAS kein GitHub-Registry-Login erforderlich.

## Schiffe und Lobbyverzeichnis ab v0.3.0

Protokoll 3 ergänzt benannte, standardmäßig private Lobbys und ein Verzeichnis beitretbarer öffentlicher Räume. Der Gastgeber darf bis zu acht geprüfte Schiffe (je 1,5 MB, zusammen 8 MB) freigeben. Andere Spieler laden fehlende SHA-256-Pakete vor dem Start und wählen diese in der Lobby aus. Serverprüfungen umfassen Punktebudget, Geometrie, PNG-Struktur und Speichergrenzen. Die Schiffe bleiben serverseitig nur bis zum Lobbyende gespeichert; Gäste können sie im Browser behalten/exportieren. [Details](CRAFTS.md). Nachrichten bleiben auf 16 KiB begrenzt, außer geprüften Schiff-Uploads (WebSocket-Obergrenze 2 MB). Die globale Raumgrenze begrenzt auch den maximalen Modellspeicher.
