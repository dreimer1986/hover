/* Remapping and DOM menu navigation, limited to the extended edition. */
(function(){
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
 const keys={forward:'ArrowUp',reverse:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',jump:'KeyA',placeWall:'KeyS',cloak:'KeyD',fire:'Space',map:'KeyM',pause:'Escape',wide:'KeyV',chase:'KeyC',fullscreen:'KeyF'};
 const buttons={forward:12,reverse:13,left:14,right:15,jump:0,placeWall:2,cloak:1,fire:7,map:8,pause:9};
 const labels={forward:t('Vorwärts','Forward'),reverse:t('Rückwärts','Reverse'),left:t('Links','Left'),right:t('Rechts','Right'),jump:t('Sprung','Jump'),placeWall:t('Wand','Wall'),cloak:t('Tarnung','Cloak'),fire:t('Feuern','Fire'),map:t('Karte','Map'),pause:t('Pause / Menü','Pause / menu'),wide:t('Großansicht','Wide view'),chase:t('Außenansicht','Chase view'),fullscreen:t('Vollbild','Fullscreen')};
 let saved={};try{saved=JSON.parse(localStorage.getItem('hover-bindings')||'{}');}catch(_){}
 function validate(raw){const result={keys:{...keys},buttons:{...buttons}};for(const k of Object.keys(keys)){if(typeof raw?.keys?.[k]==='string'&&/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Escape|Tab|Enter|ShiftLeft|ControlLeft)$/.test(raw.keys[k]))result.keys[k]=raw.keys[k];if(k in buttons&&Number.isInteger(raw?.buttons?.[k])&&raw.buttons[k]>=0&&raw.buttons[k]<=16)result.buttons[k]=raw.buttons[k];}/* Older backups may already use the new default keys. Preserve existing assignments. */for(const action of ['wide','chase','fullscreen'])if(!raw?.keys?.[action]&&Object.entries(result.keys).some(([k,v])=>k!==action&&v===result.keys[action]))result.keys[action]=Array.from('VCFGHJKLBNOPQRTUWXYZ',c=>'Key'+c).find(code=>!Object.values(result.keys).includes(code));if(new Set(Object.values(result.keys)).size!==Object.keys(keys).length||new Set(Object.values(result.buttons)).size!==Object.keys(buttons).length)throw Error(t('Jede Taste darf nur einmal belegt sein.','Each binding must be unique.'));return result;}
 let bindings;try{bindings=validate(saved);}catch(_){bindings=validate({});}
 let capture=null,previous=[],lastNav=0,held=new Set();
 const section=document.createElement('details');section.id='hover-bindings';section.innerHTML=`<summary>${t('Tastenbelegung & Controller','Bindings & controller')}</summary><p>${t('Menüs: Steuerkreuz oder linker Stick · A bestätigen · B zurück. Bei Auswahllisten links/rechts ändern.','Menus: D-pad or left stick · A confirm · B back. Use left/right to change selections.')}</p><div class="binding-grid"></div><button type="button">${t('Belegung zurücksetzen','Reset bindings')}</button>`;
 document.querySelector('#hover-settings .preference-fields').after(section);
 const grid=section.querySelector('.binding-grid');
 function save(){localStorage.setItem('hover-bindings',JSON.stringify(bindings));render();}
 function assign(kind,action,value){const other=Object.keys(bindings[kind]).find(k=>bindings[kind][k]===value);if(other)bindings[kind][other]=bindings[kind][action];bindings[kind][action]=value;capture=null;save();}
 function render(){grid.replaceChildren();for(const action of Object.keys(keys)){const label=document.createElement('span');label.textContent=labels[action];grid.append(label);for(const kind of ['keys','buttons']){if(kind==='buttons'&&!(action in buttons)){grid.append(document.createElement('span'));continue;}const b=document.createElement('button');b.textContent=(kind==='buttons'?'🎮 ':'')+bindings[kind][action];b.onclick=()=>{capture={kind,action};b.textContent=t('Taste drücken …','Press a button …');};grid.append(b);}}}
 section.querySelector(':scope > button').onclick=()=>{bindings=validate({});save();};
 window.HoverBindings={get values(){return bindings;},validate,replace(raw){bindings=validate(raw);save();},button(action){return bindings.buttons[action];}};
 window.addEventListener('keydown',e=>{
  if(capture?.kind==='keys'){e.preventDefault();e.stopImmediatePropagation();try{validate({keys:{...keys,[capture.action]:e.code}});}catch(_){if(!/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Escape|Tab|Enter|ShiftLeft|ControlLeft)$/.test(e.code))return;}assign('keys',capture.action,e.code);return;}
  const view=Hover.router.currentView;if(e.altKey||e.ctrlKey||e.metaKey||!view?.playing||api.menuOpen||e.target.matches('input,select,textarea,button'))return;
  const action=Object.keys(bindings.keys).find(k=>bindings.keys[k]===e.code);if(!action)return;
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  const viewButton={wide:'modern-wide',chase:'modern-camera',fullscreen:'modern-full'}[action];if(viewButton){document.getElementById(viewButton)?.click();return;}if(action==='map'){api.toggleMap();return;}if(action==='pause'){api.toggleSettings();return;}
  if(!api.mapOpen)held.add(action);
 },true);
 window.addEventListener('keyup',e=>{for(const k of Object.keys(bindings.keys))if(bindings.keys[k]===e.code)held.delete(k);},true);
 window.addEventListener('blur',()=>held.clear());
 const update=api.updateInput;
 api.updateInput=function(game,view){
  if(api.menuOpen||api.mapOpen||!view?.playing)held.clear();
  for(const c of game?.craftControllers||[]){if(typeof c.onKey!=='function'||c.remapped)continue;c.remapped=true;c.onKey=function(){};const base=c.update;c.update=function(dt,passive){for(const k of Object.keys(keys))if(!['map','pause','wide','chase','fullscreen'].includes(k))this[k]=held.has(k);const result=base.call(this,dt,passive);for(const k of ['jump','placeWall','cloak'])held.delete(k);return result;};}
  return update(game,view);
 };
 const keyboard=document.createElement('dialog');keyboard.className='hover-dialog';keyboard.id='controller-keyboard';keyboard.innerHTML='<output></output><div class="controller-keyboard-grid"></div>';document.body.append(keyboard);let target=null;
 function openKeyboard(input){target=input;keyboard.querySelector('output').textContent=input.value;keyboard.showModal();keyboard.querySelector('button').focus();}
 for(const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -_:/.' .split('').concat(['⌫','✓'])){const button=document.createElement('button');button.textContent=char===' '?t('Leer','Space'):char;button.onclick=()=>{if(char==='✓'){target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));keyboard.close();target.focus();return;}target.value=char==='⌫'?target.value.slice(0,-1):(target.value+char).slice(0,target.maxLength>0?target.maxLength:200);keyboard.querySelector('output').textContent=target.value;};keyboard.querySelector('div').append(button);}
 api.navigateController=function(pad,view){
  const now=performance.now(),down=i=>!!pad.buttons[i]?.pressed,edge=i=>down(i)&&!previous[i];
  if(capture?.kind==='buttons'){const i=pad.buttons.findIndex((b,i)=>b.pressed&&!previous[i]);if(i>=0&&i<=16)assign('buttons',capture.action,i);previous=pad.buttons.map(b=>b.pressed);return true;}
  if(api.mapOpen&&edge(1)){api.toggleMap();previous=pad.buttons.map(b=>b.pressed);return true;}
  const menu=api.menuOpen||!!document.querySelector('dialog[open]')||!view?.playing;
  if(menu){
   const scope=keyboard.open?keyboard:document.querySelector('dialog[open]')||document;
   const elements=[...scope.querySelectorAll('button,input,select,summary,a[href]')].filter(e=>!e.disabled&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
   let index=elements.indexOf(document.activeElement),vertical=down(13)||pad.axes[1]>.55?1:down(12)||pad.axes[1]<-.55?-1:0;
   const horizontal=down(15)||pad.axes[0]>.55?1:down(14)||pad.axes[0]<-.55?-1:0;
   if(now-lastNav>180&&(vertical||horizontal)){lastNav=now;const focused=elements[index];if(horizontal&&focused?.tagName==='SELECT'){focused.selectedIndex=Math.max(0,Math.min(focused.options.length-1,focused.selectedIndex+horizontal));focused.dispatchEvent(new Event('change'));}else if(horizontal&&focused?.type==='range'){horizontal>0?focused.stepUp():focused.stepDown();focused.dispatchEvent(new Event('input'));}else{index=(index+(vertical||horizontal)+elements.length)%elements.length;elements[index]?.focus();elements[index]?.scrollIntoView({block:'nearest'});}}
   if(edge(0)){const focused=document.activeElement;if(focused?.tagName==='SUMMARY')focused.parentElement.open=!focused.parentElement.open;else if(focused?.tagName==='SELECT'){focused.selectedIndex=(focused.selectedIndex+1)%focused.options.length;focused.dispatchEvent(new Event('change'));}else if(focused?.tagName==='INPUT'&&['text','url','number'].includes(focused.type)){openKeyboard(focused);}else focused?.click?.();}
   if(edge(1)){if(keyboard.open)keyboard.close();else if(api.menuOpen)api.toggleSettings();else if(api.sectionOpen)api.closeSection();}
  }else if(edge(bindings.buttons.pause))api.toggleSettings();
  previous=pad.buttons.map(b=>b.pressed);return menu;
 };
 document.getElementById('hover-settings').addEventListener('close',()=>{capture=null;render();});
 render();
})();
