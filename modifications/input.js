/* Standard Gamepad API adapter. Physical keyboard remains available in all modes. */
(function(){
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
 let ready=sessionStorage.getItem('hover-input-ready')==='1',mode=hoverMobile?'touch':'off',pad=null,seen=false,armed=false,lastButtons=[],mapButton=false;
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
 function neutral(p){return !p.buttons.some(b=>b.pressed)&&!p.axes.some(a=>Math.abs(a)>.18);}
 const axis=a=>Number.isFinite(a)&&Math.abs(a)>.18?Math.sign(a)*Math.min(1,(Math.abs(a)-.18)/.82):0;
 function clear(c){for(const k of ['forward','reverse','left','right','fire','jump','placeWall','cloak','hudZoomIn','hudZoomOut'])c[k]=false;c.turn=c.engine=0;}
 function patch(game){
  for(const c of game.craftControllers){
   if(typeof c.checkButtonUp!=='function'||c.extendedInput)continue;c.extendedInput=true;
   const base=Object.getPrototypeOf(Object.getPrototypeOf(c)).update;
   c.update=function(dt,passive){
    clear(this);
    if(mode==='controller'&&pad&&armed&&!api.mapOpen&&!document.hidden&&document.hasFocus()){
     this.turn=axis(pad.axes[0]);this.engine=-axis(pad.axes[1]);
     this.forward=down(pad,12);this.reverse=down(pad,13);this.left=down(pad,14);this.right=down(pad,15);this.fire=down(pad,7);
     for(const [i,key]of [[0,'jump'],[1,'cloak'],[2,'placeWall']]){this[key]=down(pad,i)&&!lastButtons[i];lastButtons[i]=down(pad,i);}
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
   const pressed=down(pad,8)||down(pad,9);
   if(ready&&mode==='controller'&&view?.playing&&pressed&&!mapButton&&armed)api.toggleMap?.();
   mapButton=pressed;
  }
  if(game?.craftControllers)patch(game);
 };
 api.inputMode=()=>mode;
})();
(function(){
 const de=hoverLocale.lang==='de',details=document.createElement('details');details.className='enhanced-changes';
 const items=de?[
 'Ursprünglicher Startbildschirm, Schiffsvorschau und originale Schiffswerte.',
 'Touch, Tastatur und Standard-Controller; Großansicht und Vollbild bleiben am PC optional.',
 'Große Radarübersicht mit M, Controller-Menütaste oder Touch; zum Fahren wieder schließen.',
 'Drei Arenen in Modern und Retro, 3–6 Flaggen je Team und automatischer Einzelspieler-Kartenfortschritt.',
 'Die Mitte des O schaltet die Levelauswahl ein und aus, mit Originalklängen für Sieg und Niederlage.',
 'Multiplayer mit Teamwahl, Lobby über mehrere Runden, wechselnden Karten und abschließenden Punkten.',
 'Korrigierte Darstellung bei verschiedenen Pixeldichten, Retro-HUD und Ergebnisdialoge.',
 'Gemeinsame Audioausgabe, ergänzte Motorgeräusche und geglättete Motorschleifen.',
 'Deutsch/Englisch nach Browsersprache, HTTPS/WSS für öffentliche Multiplayer-Verbindungen.',
 'Beide Original-Webfassungen und Store-Pakete bleiben separat erhalten.'
 ]:[
 'Original home screen, craft preview and original craft statistics.',
 'Touch, keyboard and standard controllers; expanded view and fullscreen remain optional on desktop.',
 'Large radar with M, the controller menu button or touch; close it to resume driving.',
 'Three arenas in Modern and Retro, 3–6 flags per team and automatic single-player progression.',
 'The centre of the O toggles level selection with original victory/defeat sounds.',
 'Multiplayer with team selection, persistent lobbies, changing maps and final scores.',
 'Corrected rendering across pixel densities, Retro HUD and result dialogs.',
 'Shared audio output, restored engine sounds and blended engine loops.',
 'German/English based on browser language; HTTPS/WSS for public multiplayer.',
 'Both original web releases and Store packages remain separately preserved.'
 ];
 const summary=document.createElement('summary');summary.textContent=de?'Was wurde erweitert?':'What has changed?';details.appendChild(summary);
 const list=document.createElement('ul');for(const text of items){const li=document.createElement('li');li.textContent=text;list.appendChild(li);}details.appendChild(list);
 HoverEnhanced.controls.get('modern-launcher').querySelector('.modern-card').appendChild(details);
})();
