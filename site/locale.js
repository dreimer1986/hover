/* Only the archive UI and optional derivative are translated. Preserved releases
   retain their original text. The primary browser language selects German/English. */
(function () {
  'use strict';
  const language = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
  const lang = language.startsWith('de') ? 'de' : 'en';
  const english = {
    'Hover! — Zurück in der Arena': 'Hover! — Back in the Arena',
    'Hover! — Touch + Vollbild': 'Hover! — Touch + Fullscreen',
    'Zum Inhalt': 'Skip to content',
    'Hover! Startseite': 'Hover! home',
    'Hauptnavigation': 'Main navigation',
    'Spielen': 'Play',
    'DAS WEB-REMAKE VON 2013': 'THE 2013 WEB REMAKE',
    'Zurück in': 'Back in',
    'der': 'the',
    'Gleiten. Ausweichen. Flaggen schnappen.': 'Glide. Dodge. Capture the flags.',
    'Hover! ist wieder da — mit zwei gesicherten Webfassungen und einer neuen Fassung für Touch und Vollbild.': 'Hover! is back — with two preserved web releases and a new edition for touch and fullscreen play.',
    'Jetzt spielen': 'Play now',
    'Andere Version wählen': 'Choose another version',
    '3 ARENEN': '3 ARENAS',
    'Hovercraft-Cockpit vor einer futuristischen Stadt mit leuchtenden Gebäuden': 'Hovercraft cockpit facing a futuristic city with glowing buildings',
    '01 / WEBFASSUNGEN': '01 / WEB EDITIONS',
    'Wähle deinen Startpunkt.': 'Choose your starting point.',
    'Zwei Zeitstände. Eine neue Bedienung.': 'Two releases. A new way to play.',
    'Ohne Installation direkt loslegen.': 'Jump in without installing anything.',
    'TOUCH + VOLLBILD': 'TOUCH + FULLSCREEN',
    'OPTIONALE ERWEITERUNG': 'OPTIONAL ENHANCEMENT',
    'Die mobile Fassung': 'The mobile edition',
    'Die späte Fassung mit Steuerkreuz, Aktionstasten und bildschirmfüllender Ansicht. Auf Mobilgeräten der direkte Einstieg, am PC frei wählbar.': 'The later release with a directional pad, action buttons and a full-window view. The default on mobile, an optional choice on desktop.',
    'Basis: Webstand 2017': 'Based on the 2017 web release',
    'Touch + Vollbild': 'Touch + fullscreen',
    'Modifizierte Fassung starten': 'Play modified edition',
    'EMPFOHLEN': 'RECOMMENDED',
    'LETZTER GESICHERTER WEBSTAND': 'LAST PRESERVED WEB RELEASE',
    'Die späte Fassung': 'The later release',
    'Die letzte gefundene Überarbeitung des Web-Remakes. Gesichert aus der Website vom März 2019.': 'The last recovered update of the web remake, preserved from the website captured in March 2019.',
    'Build: 28.07.2017': 'Build: 2017-07-28',
    '3D + Retro-Modus': '3D + retro mode',
    'Späte Fassung starten': 'Play later release',
    'VERÖFFENTLICHUNGSTAG': 'LAUNCH DAY',
    'ZURÜCK ZUM ANFANG': 'BACK TO THE BEGINNING',
    'Die erste Fassung': 'The first release',
    'Der früheste gefundene Webstand vom 2. Oktober 2013. So begann die Rückkehr des Windows-Klassikers.': 'The earliest recovered web release, from October 2, 2013. Where the Windows classic made its comeback.',
    'Build: 02.10.2013': 'Build: 2013-10-02',
    'Frühe Fassung starten': 'Play early release',
    'TIPP': 'TIP',
    'Tippe im Spiel-Hauptmenü': 'Type',
    'für den Retro-Modus.': 'in the game’s main menu to enter retro mode.',
    'Einzelspieler wiederhergestellt · Der frühere Online-Mehrspieler-Dienst ist nicht enthalten.': 'Single player restored · The original online multiplayer service is not included.',
    '02 / WINDOWS-ARCHIV': '02 / WINDOWS ARCHIVE',
    'Ein Stück Spielgeschichte.': 'A piece of gaming history.',
    'Zum Behalten.': 'Yours to keep.',
    'Beide gesicherten Store-Pakete als vollständige ZIPs.': 'Both preserved Store packages as complete ZIP files.',
    'Für Windows 8.1 / RT — unverändert aus dem Archiv.': 'For Windows 8.1 / RT — unchanged from the archive.',
    'Das AppxBundle': 'The AppxBundle',
    'Spielpaket mit zusätzlichen Anzeigeskalierungen': 'Game package with additional display scale resources',
    'ZIP · 105,0 MB': 'ZIP · 105.0 MB',
    'Bundle herunterladen': 'Download bundle',
    'Das einzelne Appx-Paket': 'The standalone Appx package',
    'Spielpaket mit den mitgelieferten Zertifikatsdateien': 'Game package with its included certificate files',
    'ZIP · 103,8 MB': 'ZIP · 103.8 MB',
    'Paket herunterladen': 'Download package',
    'Zwei unterschiedliche Pakete, dieselbe Spielversion. Die Archive wurden auf Integrität geprüft; eine Installation auf aktuellen Windows-Versionen ist nicht zugesichert.': 'Two different packages, the same game version. Archive integrity has been checked; installation on current Windows versions is not guaranteed.',
    'BEWAHREN. WEITERSPIELEN.': 'PRESERVE. KEEP PLAYING.',
    'Aus dem Archiv zurück ins Spiel.': 'From the archive back into the game.',
    'Die Website, ihr Spielcode und ihre Ressourcen wurden aus dem Internet Archive gesichert. Fehlende Dateien wurden, soweit möglich, aus den erhaltenen Store-Paketen ergänzt. Originale und Anpassungen sind im Repository nachvollziehbar getrennt.': 'The website, game code and assets were preserved from the Internet Archive. Missing files were recovered from the surviving Store packages wherever possible. Originals and restoration changes are kept separate in the repository.',
    'Was wurde ergänzt, was fehlt?': 'What was restored, and what is missing?',
    'Beide Webfassungen enthalten alle drei Arenen und den Retro-Modus. Fehlende Soundvarianten wurden durch Store-Audio ergänzt; Ogg-Ersatzdateien ermöglichen die Wiedergabe in weiteren Browsern. Abweichende Texturpfade und verfügbare Ersatztexturen sind dokumentiert.': 'Both web releases include all three arenas and retro mode. Missing audio variants were restored using Store audio; Ogg conversions support additional browsers. Changed texture paths and available replacement textures are documented.',
    'Die ursprünglichen Multiplayer-Server und eingebettete Werbevideos sind nicht Teil der Wiederherstellung. Die Browserfassungen sind rekonstruierte Spielstände, keine behaupteten bytegenauen Komplettkopien der damaligen Website.': 'The original multiplayer servers and embedded promotional videos are not part of the restoration. These browser editions are reconstructed releases, not claimed byte-for-byte copies of the complete original website.',
    'Wiederherstellungsbericht lesen ↗': 'Read the restoration report ↗',
    'Spiel & Originalgrafiken © Microsoft und jeweilige Rechteinhaber.': 'Game & original graphics © Microsoft and their respective rights holders.',
    'Unabhängiges Archivprojekt.': 'Independent preservation project.',
    'Quellarchiv ↗': 'Source archive ↗',
    'Hover! ist zurück. Spiele die frühe und späte Webfassung des Remakes von 2013 und lade die gesicherten Windows-8.1/RT-Pakete herunter.': 'Hover! is back. Play the early and later web releases of the 2013 remake and download the preserved Windows 8.1/RT packages.',
    'Spielansicht': 'Game view',
    '← Archiv': '← Archive',
    'Menü': 'Menu',
    'Großansicht': 'Full window',
    '⛶ Vollbild': '⛶ Fullscreen',
    '⛶ Beenden': '⛶ Exit fullscreen',
    'Hover starten': 'Start Hover',
    'TOUCH + VOLLBILD · MODIFIZIERTE FASSUNG': 'TOUCH + FULLSCREEN · MODIFIED EDITION',
    'Deine Arena. Dein Bildschirm.': 'Your arena. Your screen.',
    'Die späte Webfassung mit neuer Bedienung. Fahre mit den Pfeiltasten oder dem Steuerkreuz. Sammle Flaggen und bringe sie zur Basis!': 'The later web release with new controls. Drive with the arrow keys or directional pad. Collect flags and bring them back to base!',
    '1 · Stadt': '1 · City',
    '2 · Kanalisation': '2 · Sewers',
    '3 · Burg': '3 · Castle',
    'Einfach': 'Easy',
    'Schwer': 'Hard',
    'Spiel starten →': 'Start game →',
    'Retro-Modus starten': 'Start retro mode',
    'Sprung: A · Wand: S · Tarnung: D · Feuern: Leertaste': 'Jump: A · Wall: S · Cloak: D · Fire: Space',
    'Sprung, Wand und Tarnung benötigen eingesammelte Extras; Feuern eine Waffe. Booster wirken nach dem Einsammeln automatisch. Querformat bietet mehr Übersicht.': 'Jump, wall and cloak require collected power-ups; firing requires a weapon. Boosters activate automatically when collected. Landscape orientation gives you a wider view.',
    'Späte Originalfassung': 'Later original release',
    'Frühe Originalfassung': 'Early original release',
    'Spielstatus': 'Game status',
    'Retro-Status': 'Retro status',
    'Sprunghöhe': 'Jump height',
    'Wanddauer': 'Wall time',
    'Schilddauer': 'Shield time',
    'Tempo-Effekt': 'Speed effect',
    'Fortsetzen': 'Continue',
    'Steuerkreuz: ziehen zum Fahren und Lenken': 'Directional pad: drag to drive and steer',
    'Extras': 'Power-ups',
    'Sprung': 'Jump',
    'Wand': 'Wall',
    'Tarnung': 'Cloak',
    'Feuern': 'Fire',
    'Schild': 'Shield',
    'Leertastenfunktion: wirkt nur mit ausgerüsteter Waffe': 'Space bar action: only works with an equipped weapon',
    'Browser-Vollbild ist hier nicht verfügbar. Die Großansicht nutzt den verfügbaren Bildschirm.': 'Browser fullscreen is not available here. Full-window mode uses the available screen.',
    'Vollbild wurde nicht zugelassen. Die Großansicht bleibt verfügbar.': 'Fullscreen was not allowed. Full-window mode remains available.'
  };
  function t(text) { return lang === 'en' && Object.prototype.hasOwnProperty.call(english, text) ? english[text] : text; }
  function translate(element) {
    if (lang !== 'en') return;
    element.querySelectorAll('[data-english-href]').forEach(link => { link.href = link.dataset.englishHref; });
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.parentElement.tagName)) continue;
      const trimmed = node.nodeValue.trim();
      if (trimmed) node.nodeValue = node.nodeValue.replace(trimmed, t(trimmed));
    }
    const elements = [element, ...element.querySelectorAll('[alt], [title], [aria-label], meta[name="description"]')];
    elements.forEach(el => {
      if (!el.getAttribute) return;
      ['alt', 'title', 'aria-label', 'content'].forEach(name => {
        if (el.hasAttribute(name)) el.setAttribute(name, t(el.getAttribute(name)));
      });
    });
  }
  document.documentElement.lang = lang;
  window.hoverLocale = {lang, t, translate};
  document.addEventListener('DOMContentLoaded', () => translate(document.documentElement));
})();
