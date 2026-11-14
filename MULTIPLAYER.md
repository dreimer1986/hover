# Multiplayer: Befund und Wiederherstellbarkeit

**Deutsch** · [English](MULTIPLAYER.en.md)

Stand: 14. November 2026. Dies ist eine Codeanalyse, kein implementierter oder getesteter Mehrspielerbetrieb.

## Ergebnis

**Ein neuer, funktional vergleichbarer Multiplayer ist technisch plausibel und gut begründbar.** Große Teile des Netzwerkclients, die Fahrzeugphysik, die Darstellung fremder Fahrzeuge und die Spielressourcen sind erhalten. In den vorliegenden Sicherungen fehlt der laufende Server samt seiner Implementierung. Deshalb muss ein Ersatzserver entwickelt und separat betrieben werden. Ein bytegenauer Nachbau aller früheren Serverregeln kann aus den Clients allein nicht zugesichert werden.

Die Website kann auf GitHub Pages bleiben. Der aktive Multiplayer-Dienst benötigt einen separaten Host: [GitHub Pages ist statisches Hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Neue Clientanpassungen sollten ausschließlich in einer optionalen modifizierten Fassung erfolgen; beide archivierten und bereits wiederhergestellten Fassungen bleiben erhalten.

## Nachgewiesene Struktur

| Teil | Befund im erhaltenen Code |
| --- | --- |
| Früher Client | jQuery SignalR **1.1.3**, Endpunkt `http://mshover-mp.cloudapp.net/signalr` |
| Später Client | jQuery SignalR **2.0.3**, Basisadresse `http://hovermp.azurewebsites.net/`, Hub unter `signalr` |
| Verbindung | Dynamischer Hub-Proxy über `/signalr/hubs`, gemeinsamer Hub `hoverHub` |
| Lobby | Spiel erzeugen, Einladungslink mit Spiel-ID, Name und Fahrzeug wählen, auf Mitspieler warten |
| Teamwahl | UI für insgesamt 2, 4, 6 oder 8 Spieler, also zwei Teams mit je 1–4 Spielern |
| Vorgaben beim Erzeugen | `createGame(44, 4, teamSize)`: Maze-ID 44 und Flaggenparameter 4 |
| Zustandsaustausch | Höchstens etwa 15 Anfragen pro Sekunde; nächste Anfrage erst nach Rückmeldung auf die vorherige |
| Fahrzeugzustand | Position, Geschwindigkeit, Drehung, Gas/Lenken, Schutz-/Effektzeiten, Tarnung, Ausfallzeit, Zustand; später zusätzlich eroberte Flaggen |
| Fremde Fahrzeuge | Eigene clientseitige Bewegungsvorhersage und Positionskorrektur (`NetworkPlayerController`) |
| Spätere Ergänzungen | Optionaler Endzeitpunkt in `startGame`, lokale Auswertung bei Zeitablauf, zusätzlicher Scoreboard-Endpunkt |

Die alten HTTP-Adressen dienen hier nur als Quellnachweis. Ein neuer öffentlicher Dienst für die HTTPS-Website sollte HTTPS/WSS verwenden. Sein Betrieb an diesen alten Adressen wird nicht vorausgesetzt.

## Ablauf und Nachrichten

Der Ersteller ruft `createGame` auf und erhält eine Spiel-ID. Teilnehmer melden sich mit `join(gameId, craftProfile, playerName)` an. `waitingUpdate` liefert Wartelisten und Spielerzahlen. Der Server weist eine Arena zu (`useMazeId`), der Client meldet die geladene Arena mit `spawnMe`, und `spawnAt` liefert Position und Team. `startGame` startet den Austausch; vor dem Laden eintreffende Nachrichten werden im Client gepuffert.

`setCraftState` übermittelt den eigenen Zustand und liefert die Zustände der anderen Spieler zurück. Bewegungen werden lokal simuliert und zwischen Netzwerkupdates fortgeschrieben. Ein einfacher Relay-Prototyp ist daher naheliegend; wie stark der Originalserver eingehende Angaben prüfte, ist aus dem Client nicht vollständig ersichtlich.

Die erhaltene Schnittstelle umfasst außerdem:

| Client → Server | Server → Client / Wirkung |
| --- | --- |
| `capturedFlag`, `uncapturedFlag` | `onFlagCaptured`, `onFlagUncaptured` |
| `hitPod` | `spawnPod`, `removePod` für Extras |
| `createTempWall` | `onTempWallCreated` |
| `sendCollision` | `onHit` |
| `fireBullet` | `onBulletFired` |
| `sendMyBulletHitCraft`, `sendBulletDestroyed` | `hitByBullet`, `bulletDestroyed` |

Das Vorhandensein der Schuss-Schnittstellen belegt Clientunterstützung, nicht automatisch eine in jedem Spielmodus verfügbare Waffe. Die vollständigen extrahierten Methodennamen, Zustandsfelder und Datei-Prüfsummen stehen in [multiplayer-client-analysis.json](verification/multiplayer-client-analysis.json).

## Was ein Ersatzserver leisten müsste

- Räume und Spiel-IDs, Teams, Teilnehmer, Wartestatus sowie geregeltes Verlassen und Verbindungsabbrüche verwalten.
- Startzustände, Flaggen und Extras mit den vorhandenen Kartendaten erzeugen und an alle Teilnehmer verteilen.
- Zustandsupdates und Ereignisse korrekt zuordnen, weitergeben und auf Plausibilität prüfen.
- Gemeinsame Regeln für Flaggen, Extras, temporäre Wände, Kollisionen, Rundensieg/-ende und gegebenenfalls Zeitlimit umsetzen.
- Für die spätere Spezialfunktion ein Scoreboard ergänzen, sofern dieses zum gewünschten Umfang gehört.

Die genaue serverseitige Validierung, Zufallsverteilung, Raumlebensdauer und Persistenz sind nicht vollständig dokumentiert. Die erhaltene Einzelspielerlogik und Kartendaten liefern dafür Grundlagen, ersetzen aber keine Mehrspieler-Synchronisation.

## Sinnvoller Umsetzungsweg

1. Einen separaten Prototyp mit zwei Browsern, einer Arena, Raumcode und sichtbarer Bewegung beider Spieler bauen.
2. Flaggen und Rundensieg über einen gemeinsamen Serverzustand synchronisieren.
3. Extras, Wände, Kollisionen, Verbindungsabbrüche und weitere Spieler ergänzen; danach Latenz, Gleichzeitigkeit und Manipulation prüfen.

Für möglichst große Protokollnähe wäre ein klassischer SignalR-kompatibler Server möglich. Für eine langfristig pflegbare Neufassung bietet sich ein neuer WebSocket-/SignalR-Core-Server mit einem Adapter in der modifizierten Fassung an. **ASP.NET Core SignalR ist nicht direkt kompatibel mit dem alten ASP.NET-SignalR-Client**; Microsoft dokumentiert diese [Protokoll-/API-Unterschiede](https://learn.microsoft.com/en-us/aspnet/core/signalr/version-differences?view=aspnetcore-10.0). Ein Austausch der Serveradresse allein genügt bei dieser Variante nicht.

Für dieses Ergebnis wurde kein öffentlicher Dienst eingerichtet, kein Server implementiert und kein Mehrspielermatch als erfolgreich behauptet.

## Quellnachweise

- [Früher Original-Spielcode](archive/web/2013-10-02/scripts/game.6a9ca04b.js) und [Bibliotheken](archive/web/2013-10-02/scripts/game-libs.81568e1f.js).
- [Später Original-Spielcode](archive/web/2019-03-11/scripts/game.cbbb14d7.js) und [Bibliotheken](archive/web/2019-03-11/scripts/game-libs.922bbe8e.js).
- Relevante Symbole: `Hover.signalr`, `hoverHub`, `createGame`, `joinGame`, `attachHubListeners`, `setCraftState`, `getStateUpdate`, `checkGameExpiration`, `api/scoreboard/`.

[Projektübersicht](README.md) · [Wiederherstellungsbericht](RESTORATION.md)
