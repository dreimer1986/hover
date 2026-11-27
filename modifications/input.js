/* Standard Gamepad API adapter. Physical keyboard remains available in all modes. */
(function(){
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
 let ready=sessionStorage.getItem('hover-input-ready')==='1',mode=hoverMobile?'touch':'off',pad=null,seen=false,armed=false,lastButtons=[],mapButton=false,menuNavigation=false;
 const root=document.documentElement,touch=document.getElementById('modern-touch'),selector=document.createElement('select');
 selector.id='modern-input-mode';selector.hidden=true;selector.setAttribute('aria-label',t('Eingabegerät','Input device'));
 selector.innerHTML=`<option value="off">${t('Aus','Off')}</option><option value="touch">Touch</option><option value="controller">Controller</option>`;touch.after(selector);
 function setMode(value){mode=value;armed=false;selector.value=value;api.setTouch(value==='touch');}
 selector.onchange=()=>setMode(selector.value);
 function start(){ready=true;sessionStorage.setItem('hover-input-ready','1');root.classList.remove('input-gate');window.HoverAudio?.unlock();}
 api.installHome=function(el){
  if(ready)return;root.classList.add('input-gate');
  const gate=document.createElement('div');gate.id='input-start';gate.innerHTML=`<p>${t('Drücke eine Taste auf deinem Controller oder deiner Tastatur. Du kannst auch hier tippen oder klicken.','Press a button on your controller or keyboard. You can also tap or click here.')}</p><button type="button">${t('Starten','Start')}</button><p>${t('Controller: zuerst eine Taste drücken, damit der Browser ihn erkennt.','Controller: press a button first so the browser can detect it.')}</p>`;
  gate.querySelector('button').onclick=start;el.querySelector('#homeContent').appendChild(gate);
 };
 window.addEventListener('keydown',e=>{if(!ready&&document.getElementById('input-start')&&!['Shift','Control','Alt','Meta','Tab'].includes(e.key)){start();e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{armed=false;});document.addEventListener('visibilitychange',()=>{armed=false;});
 const down=(p,i)=>!!p?.buttons[i]?.pressed;
 function neutral(p){return !p.buttons.some(b=>b.pressed)&&!p.axes.some(a=>Math.abs(a)>(window.HoverPreferences?.values.deadzone||.18));}
 const axis=a=>{const v=window.HoverPreferences?.values||{deadzone:.18,sensitivity:1};return Number.isFinite(a)&&Math.abs(a)>v.deadzone?Math.sign(a)*Math.min(1,(Math.abs(a)-v.deadzone)/(1-v.deadzone)*v.sensitivity):0;};
 function clear(c){for(const k of ['forward','reverse','left','right','fire','jump','placeWall','cloak','hudZoomIn','hudZoomOut'])c[k]=false;c.turn=c.engine=0;}
 function patch(game){
  for(const c of game.craftControllers){
   if(typeof c.checkButtonUp!=='function'||c.extendedInput)continue;c.extendedInput=true;
   const base=Object.getPrototypeOf(Object.getPrototypeOf(c)).update;
   c.update=function(dt,passive){
    clear(this);
    if(mode==='controller'&&pad&&armed&&!menuNavigation&&!api.menuOpen&&!api.mapOpen&&!document.hidden&&document.hasFocus()){
     this.turn=axis(pad.axes[0]);this.engine=-axis(pad.axes[1]);
     for(const [key,fallback]of [['forward',12],['reverse',13],['left',14],['right',15],['fire',7]])this[key]=down(pad,window.HoverBindings?.button(key)??fallback);
     for(const [i,key]of [[0,'jump'],[1,'cloak'],[2,'placeWall']]){const n=window.HoverBindings?.button(key)??i;this[key]=down(pad,n)&&!lastButtons[n];lastButtons[n]=down(pad,n);}
    }
    return base.call(this,dt,passive);
   };
  }
 }
 api.updateInput=function(game,view){
  let pads=[];try{pads=Array.from(navigator.getGamepads?.()||[]);}catch(e){}
  pad=pads.find(p=>p?.connected&&p.mapping==='standard')||null;
  if(pad&&!seen){seen=true;touch.hidden=true;selector.hidden=false;setMode('controller');}
  selector.querySelector('[value=controller]').disabled=!pad;
  if(!pad){armed=false;lastButtons=[];mapButton=false;if(mode==='controller')setMode(hoverMobile?'touch':'off');}
  if(pad){
   if(!ready&&pad.buttons.some(b=>b.pressed))start();
   if(!armed&&neutral(pad)&&!document.hidden&&document.hasFocus())armed=true;
   menuNavigation=!!api.navigateController?.(pad,view);
   const pressed=down(pad,window.HoverBindings?.button('map')??8);
   if(ready&&mode==='controller'&&view?.playing&&!api.menuOpen&&pressed&&!mapButton&&armed)api.toggleMap?.();
   mapButton=pressed;
  }
  if(game?.craftControllers)patch(game);
 };
 api.inputMode=()=>mode;api.resetInput=()=>{armed=false;lastButtons=[];};
})();
(function(){
 const de=hoverLocale.lang==='de',details=document.createElement('details');details.className='enhanced-changes';
 const items=de?[
 'Ursprünglicher Startbildschirm, Schiffsvorschau und originale Schiffswerte.',
 'Touch, Tastatur und Standard-Controller; Großansicht und Vollbild bleiben am PC optional.',
 'Große Radarübersicht mit M, Controller-Back-Taste oder Touch; zum Fahren wieder schließen.',
 'Vier Arenen in Modern und Retro, 3–6 Flaggen je Team und automatischer Einzelspieler-Kartenfortschritt.',
 'Die Mitte des O schaltet die Levelauswahl ein und aus, mit Originalklängen für Sieg und Niederlage.',
 'Multiplayer mit Teamwahl, Lobby über mehrere Runden, wechselnden Karten und abschließenden Punkten.',
 'Korrigierte Darstellung bei verschiedenen Pixeldichten, Retro-HUD und Ergebnisdialoge.',
 'Gemeinsame Audioausgabe, ergänzte Motorgeräusche und geglättete Motorschleifen.',
 'Deutsch/Englisch nach Browsersprache, HTTPS/WSS für öffentliche Multiplayer-Verbindungen.',
 'Eigene OBJ/FBX/GLTF/GLB-Schiffe mit Texturen, Größenprüfung, Punktebudget und Import/Export.',
 'Optionale Außenansicht, öffentliche Lobbys und geteilte Gastgeber-Schiffe.',
 'Echte Einzelspieler-Pause, getrennte Lautstärken, HUD-/Touch-Größe und Kameradistanz mit gespeicherten Einstellungen.',
 'Frei belegbare Spieltasten, Stick-Einstellungen und Controller-Menüs mit Bildschirmtastatur.',
 'Optionale Trainingsarena, Werkstatt-Testfahrt mit Rückkehr zum Editor und markierter Fahrtrichtung.',
 'Persönliche Bestzeiten nach Karte, Schiff, Modern/Retro und Flaggenzahl; Übungsfahrten zählen nicht.',
 'Bereitschaft und Countdown, Ping, Kartenabstimmung/Rotation, Wiederverbinden, Gastgeberwechsel und Schnellnachrichten.',
 'Bibliothek und Einstellungen gemeinsam sichern; vollständiges Offline-Paket und bebilderte Archivzeitleiste.',
 'Senkrechtes Burgermenü und eigene Ansichten für Werkstatt, Training, Bestzeiten, Sicherung und Multiplayer; zentrierte Vorschau.',
 'Lobby mit klar erkennbaren Gastgeberfeldern und ausgerichteten Aktionen; Bots je Team, unabhängige KI-Stärke und verwinkelte Neon-Causeway-Karte mit abgesenkten Höfen und eigenen Itemplätzen.',
 'Ausgewogenes viertes Schiff ReactOS Silver mit abgerundeter Geometrie und Flügellogos; Kartenimport/-export im Einzelspieler mit zweistöckiger Cyberpunk-Beispielkarte und neuer KI für alle erweiterten Arenen. Erhöhte Flaggenplätze stehen beiden Teams offen. Neon Causeway ist Karte 4 nach Karte 3 sowie im Multiplayer auswählbar; hellere Fahrwege und Treppen mit getrennten Neon-Leuchtmasken.',
 'Großansicht (V), Außenansicht (C) und Vollbild (F) mit belegbaren Tasten; massive Gebäude, Wände und Treppen sowie dichtere obere Gänge in Neon Causeway.',
 'Beide Original-Webfassungen und Store-Pakete bleiben separat erhalten.'
 ]:[
 'Original home screen, craft preview and original craft statistics.',
 'Touch, keyboard and standard controllers; expanded view and fullscreen remain optional on desktop.',
 'Large radar with M, the controller Back button or touch; close it to resume driving.',
 'Four arenas in Modern and Retro, 3–6 flags per team and automatic single-player progression.',
 'The centre of the O toggles level selection with original victory/defeat sounds.',
 'Multiplayer with team selection, persistent lobbies, changing maps and final scores.',
 'Corrected rendering across pixel densities, Retro HUD and result dialogs.',
 'Shared audio output, restored engine sounds and blended engine loops.',
 'German/English based on browser language; HTTPS/WSS for public multiplayer.',
 'Custom OBJ/FBX/GLTF/GLB crafts with textures, size validation, point budgets and import/export.',
 'Optional chase view, public lobbies and shared host crafts.',
 'Real single-player pause, separate audio volumes, HUD/touch size and camera distance with saved preferences.',
 'Rebindable gameplay inputs, stick settings and controller menus with an on-screen keyboard.',
 'Optional training arena, workshop test drives with editor return and a forward-direction marker.',
 'Personal records by map, craft, Modern/Retro and flag count; practice runs are excluded.',
 'Readiness/countdown, ping, map votes/rotation, reconnection, host transfer and quick messages.',
 'Combined library/settings backups, a complete offline package and illustrated archive timeline.',
 'Vertical hamburger menu and separate workshop, training, records, backup and multiplayer views; centered preview.',
 'Lobby with clear host-only controls and aligned actions; bots per team, independent AI difficulty and a winding Neon Causeway layout with recessed courtyards and separate pickup locations.',
 'Balanced fourth craft ReactOS Silver with rounded geometry and wing logos; custom single-player map import/export with a two-storey cyberpunk example and new AI across all extended arenas. Elevated flag locations are shared between teams. Neon Causeway is map 4 after map 3 and selectable in multiplayer; brighter roads and stairs with separate neon emissive masks.',
 'Rebindable wide view (V), chase view (C) and fullscreen (F); solid buildings, walls and stairs with denser upper corridors in Neon Causeway.',
 'Both original web releases and Store packages remain separately preserved.'
 ];
 const summary=document.createElement('summary');summary.textContent=de?'Was wurde erweitert?':'What has changed?';details.appendChild(summary);
 const list=document.createElement('ul');for(const text of items){const li=document.createElement('li');li.textContent=text;list.appendChild(li);}details.appendChild(list);
 HoverEnhanced.controls.get('modern-launcher').querySelector('.modern-card').appendChild(details);
})();
