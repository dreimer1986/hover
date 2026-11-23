# Erweiterte Fassung: Bedienung

**Deutsch** · [English](FEATURES.en.md)

Die Neuerungen gelten für Modern und Retro. Die Originalfassungen im Archiv bleiben unverändert.

## Pause, Einstellungen und Steuerung

**☰** oben rechts öffnet das senkrechte Menü. **Esc**, **Einstellungen** oder Controller **Start** öffnet die Einstellungen. Im Einzelspieler stehen Simulation und Bestzeit-Uhr still. Im Multiplayer läuft die Partie weiter. **Partie verlassen** beendet die eigene Teilnahme ausdrücklich.

Musik, Motor und Effekte lassen sich getrennt regeln. Dazu kommen HUD-Größe, Außenkamera-Abstand, Touch-Größe/-Deckkraft sowie Stick-Totzone und Empfindlichkeit. Die Einstellungen werden lokal gespeichert und lassen sich zurücksetzen.

Unter **Tastenbelegung & Controller** eine Aktion auswählen, dann die gewünschte Taste drücken. Doppelte Belegungen werden getauscht. Controller-Menüs: Steuerkreuz/linker Stick navigiert, A bestätigt, B geht zurück; links/rechts ändert Auswahllisten und Regler. Für Textfelder öffnet A eine Bildschirmtastatur. Menübedienung verwendet stets diese festen Tasten; die Belegungen darunter betreffen das Spiel. **Back/Select** öffnet standardmäßig die große Karte.

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
