# Erweiterte Fassung: Bedienung

**Deutsch** · [English](FEATURES.en.md)

Die Neuerungen gelten für Modern und Retro. Die Originalfassungen im Archiv bleiben unverändert.

## Pause, Einstellungen und Steuerung

**☰** oben rechts öffnet das senkrechte Menü. **Esc**, **Einstellungen** oder Controller **Start** öffnet die Einstellungen. Im Einzelspieler stehen Simulation und Bestzeit-Uhr still. Im Multiplayer läuft die Partie weiter. **Partie verlassen** beendet die eigene Teilnahme ausdrücklich.

Musik, Motor und Effekte lassen sich getrennt regeln. Dazu kommen HUD-Größe, Außenkamera-Abstand, Touch-Größe/-Deckkraft sowie Stick-Totzone und Empfindlichkeit. Die Einstellungen werden lokal gespeichert und lassen sich zurücksetzen.

Unter **Tastenbelegung & Controller** eine Aktion auswählen, dann die gewünschte Taste drücken. Doppelte Belegungen werden getauscht. Controller-Menüs: Steuerkreuz/linker Stick navigiert, A bestätigt, B geht zurück; links/rechts ändert Auswahllisten und Regler. Für Textfelder öffnet A eine Bildschirmtastatur. Menübedienung verwendet stets diese festen Tasten; die Belegungen darunter betreffen das Spiel. **Back/Select** öffnet standardmäßig die große Karte.

Im Spiel schalten **V** die Großansicht, **C** die Außenansicht und **F** das Vollbild um. Diese Tastaturaktionen lassen sich ebenfalls neu belegen. Vorhandene Belegungen werden übernommen; bei Konflikten erhalten die neuen Aktionen freie Tasten. Browser-Tastenkombinationen mit Strg/Alt/Cmd bleiben frei.

## Training und Werkstatt

**☰ → Training → Training starten** öffnet eine eigene kleine Arena. Optional vorher Retro aktivieren. Fahre los, springe, tarne dich, platziere eine Wand, sammle ein Extra und schließlich die blauen Flaggen. Anzeigen erklären Vorrat, Dauer und Radar. Es gibt keine Gegner in der Übung.

Unter **☰ → Eigene Schiffe** übernimmt **Testfahrt mit Vorschau** die aktuell bearbeiteten Werte und das Modell aus der Werkstatt. Der orange Pfeil in der Vorschau zeigt die Vorwärtsrichtung (−Z). Nach der Fahrt führt **Einstellungen → Zurück zur Werkstatt** direkt zum Editor. Die Vorschau muss dafür nicht dauerhaft gespeichert werden. Training und Testfahrt zählen nicht als Bestzeiten.

## Bestzeiten

Persönliche Zeiten verwenden aktive Simulationszeit ohne Pausen. Kategorien unterscheiden Karte, Originalmodell bzw. vollständigen Modell-Hash, Modern/Retro, Flaggenzahl, Spiellevel und Regelversion. Zufällige Flaggen-/Itemplätze bleiben ein Einflussfaktor; das ist keine Rangliste mit identischen Bedingungen.

Das Speicherschema reserviert getrennte Kategorien für Renn-Gesamtzeiten und Rundenrekorde. Rennen werden erst mit TODO 9 implementiert. Ein Geisterschiff ist technisch machbar: Position, Winkel und Zeit in festen Abständen aufzeichnen, dann interpoliert ohne Kollision abspielen. Gleiche Karten-/Regelversion und Schiff-Hash wären erforderlich. Reine Eingabeaufzeichnungen reichen wegen zufälliger Weltzustände und variabler Zeitschritte nicht zuverlässig. Aufnahme, Speicherbudget und Darstellung werden als eigene spätere Erweiterung behandelt.

## Multiplayer

Alle wählen **Bereit**, dann startet der Gastgeber den dreisekündigen Countdown. Änderungen an den Rundeneinstellungen setzen die Bereitschaft zurück. Kartenstimmen bestimmen die nächste Startkarte; bei Gleichstand bleibt die eingestellte Karte, wenn sie zu den Gewinnern zählt. Ohne Stimmen gilt die gewählte Karte bzw. Rotation. Die Rotation schaltet nach einem Sieg auf die nächste Arena; der nächste Start bleibt ausdrücklich beim Gastgeber.

Ping misst WebSocket-Rundlaufzeit. Schnellnachrichten sind auf vorgegebene Texte und eine Nachricht je zwei Sekunden begrenzt. Gastgeber können Spieler entfernen; eine dadurch unterbrochene Runde wird abgebrochen. Beim Verlassen geht die Gastgeberrolle auf den nächsten Spieler über.

Nach kurzem Netzabbruch versucht derselbe offene Tab bis zu 28 Sekunden lang, die Sitzung wieder aufzunehmen. Der Server hält den Platz 30 Sekunden. Andere Spieler spielen weiter. Nach Ablauf wird die unterbrochene Runde beendet und gegebenenfalls der Gastgeber gewechselt. Ein Browserneustart ist keine Wiederaufnahme. Der Server hält Lobbys nur im Arbeitsspeicher; ein Containerneustart beendet sie.

## Sicherung und Offline-Nutzung

**☰ → Sicherung & Wiederherstellung** exportiert alle dauerhaft gespeicherten Schiffe, Regler und Tastenbelegungen. Wiederherstellen prüft sämtliche Modelle und Budgets vor dem Speichern; vorhandene Schiffe bleiben erhalten. Zusammen dürfen höchstens 24 dauerhaft gespeicherte Schiffe entstehen. Sitzungsschiffe vorher ausdrücklich behalten.

Das Offline-ZIP enthält beide restaurierten Webfassungen, die erweiterte Fassung und beide originalen Store-Downloads. Vollständig entpacken, Python 3 installieren und **start.cmd** (Windows) bzw. **sh start.sh** (Linux/macOS) starten. Der lokale Server bindet ausschließlich an `127.0.0.1:8088`. Browserdaten bleiben unter dieser festen Adresse erhalten. Kein Internet für Einzelspieler nötig; Multiplayer braucht weiterhin einen erreichbaren Server. Der Starter benötigt Python, keine zusätzlichen Pakete. Die Store-Pakete werden nicht automatisch installiert.

Erstellen: `python3 scripts/build_offline.py --output /pfad/zum/paket`. Prüfsumme steht neben dem ZIP. Herkunft, Datierungen und bekannte Lücken stehen im Archiv und im [Restaurierungsbericht](RESTORATION.md).

Werkstatt, Bestzeiten, Sicherung, Training und Multiplayer besitzen getrennte Ansichten. Auf der ursprünglichen Startseite bleiben Spielstart, Auswahl und zentrierte Schiffsvorschau. Die fünf Fahrwerte sind alle individuellen Originalparameter; Masse existiert in der Physik nicht. Weitere gemeinsame Regeln wie Sprungimpuls oder Schwebehöhe sind keine versteckten Schiffswerte.

## Neue Schiffe und Karten

[ReactOS Silver](NEW-ASSETS.md) ergänzt die Auswahl als ausgewogenes viertes Schiff. Unter **☰ → Eigene Karten** lassen sich Karten importieren, ansehen, speichern, exportieren und in Modern/Retro spielen. [Anleitung und Cyberpunk-Beispiel](MAPS.md).

Die neue höhenabhängige KI gilt für alle Arenen der erweiterten Fassung. Sie nutzt Treppen und sammelt bei Bedarf Sprung-Extras für erhöhte Ziele. Erhöhte Flaggenplätze werden zwischen Rot und Blau verteilt, auch im Multiplayer. Die archivierten Originalfassungen bleiben unverändert.

Neon Causeway ist Karte 4 der normalen Einzelspieler-Reihenfolge und startet automatisch nach Karte 3. Im Multiplayer ist sie direkt auswählbar und Teil der Kartenabstimmung und Rotation. Dafür den NAS-Server auf 0.5.1 aktualisieren.

Neon Causeway ist ab 0.5.2 heller abgestimmt, mit deutlicheren Fahrwegen und Treppen, gezielt leuchtenden Neonstreifen und weniger Entfernungsabdunklung. Gilt auch für Retro und den vereinfachten mobilen Renderer.

## KI-Stärke und Multiplayer-Bots

Im Hauptmenü lässt sich die **KI-Stärke** unabhängig vom Schiff auf **Leicht, Normal oder Schwer** stellen. Die Auswahl bleibt gespeichert und gilt auch für importierte Karten und Retro. Die Stufen ändern das Fahrtempo der Gegner und ihr Tempo beim Einlenken; normale Kollisionsphysik, Flaggenregeln und das Einsammeln von Sprung-Extras gelten weiterhin. Engstellen und Sprünge begrenzen das Tempo zusätzlich. Bestzeiten unterscheiden die KI-Stufe.

In der Multiplayer-Lobby wählt der Gastgeber die Zahl der Bots für Rot und Blau sowie die KI-Stärke und bestätigt mit **Bots / KI übernehmen**. Bots belegen reguläre Plätze; insgesamt höchstens acht Teilnehmer und vier je Team. Bei einer kleinen Lobby gegebenenfalls mit höherem Spielerlimit neu erstellen. Bots sind automatisch bereit. So sind auch eine Partie allein gegen Bots oder mehrere menschliche Spieler gemeinsam gegen das andere Bot-Team möglich. Zum Freimachen von Plätzen kann der Gastgeber Bots entfernen oder ihre Anzahl reduzieren.

Bots sammeln Flaggen und Extras, nutzen Treppen und erforderliche Sprünge. Sie erhalten Flaggenpunkte und Rundensiege in der gemeinsamen Abrechnung. Ihre Fahrphysik läuft im Browser des Gastgebers; dieser muss die Partie geöffnet und aktiv halten. Der Server prüft die Bot-Berechtigung, Sammelabstände, Flaggen und Punkte. Wie bei menschlicher Bewegung ist dies kein vollständig serverseitiger Anti-Cheat-Modus. Bei einem Gastgeber-Austritt endet die aktuelle Runde, ein verbleibender Mensch übernimmt die Lobby und kann die nächste Runde mit Bots starten. Ohne Menschen bleibt keine Bot-Lobby bestehen.

Gäste sehen die Vorgaben des Gastgebers mit abgedunkelten, gesperrten Steuerelementen und einem erklärenden Hinweis. Die Kartenabstimmung bleibt verfügbar.
