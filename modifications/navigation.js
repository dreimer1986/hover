/* Extended edition navigation: original home, dedicated sections and a vertical menu. */
(function(){
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b,toolbar=document.getElementById('modern-toolbar');
 const burger=document.createElement('button');burger.id='hover-menu-toggle';burger.type='button';burger.textContent='☰';burger.setAttribute('aria-label',t('Menü öffnen','Open menu'));burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-controls','hover-menu-items');
 const menu=document.createElement('div');menu.id='hover-menu-items';menu.hidden=true;
 const archive=toolbar.querySelector('a');
 for(const el of [archive,...['modern-wide','modern-full','modern-touch','modern-input-mode','modern-map','modern-camera','modern-settings'].map(id=>document.getElementById(id))])if(el)menu.append(el);
 document.getElementById('modern-menu').remove();
 const sound=document.getElementById('modern-sound');sound.textContent=t('Ton an/aus ♪','Sound on/off ♪');document.querySelector('#hover-settings .preference-buttons').append(sound);
 toolbar.prepend(burger,menu);
 document.getElementById('modern-map').textContent=t('Karte','Map');
 function closeMenu(){menu.hidden=true;burger.setAttribute('aria-expanded','false');}
 burger.onclick=()=>{menu.hidden=!menu.hidden;burger.setAttribute('aria-expanded',String(!menu.hidden));};
 menu.addEventListener('click',e=>{if(e.target.closest('button,a'))closeMenu();});
 document.addEventListener('pointerdown',e=>{if(!toolbar.contains(e.target))closeMenu();});
 const sections=document.createElement('section');sections.id='hover-sections';sections.hidden=true;sections.innerHTML=`<header><button id="section-back">← ${t('Hauptmenü','Home')}</button><h1></h1></header><div id="section-content"></div>`;api.ui.append(sections);
 const pages=new Map(),links=[];
 const get=id=>document.getElementById(id)||api.controls.get(id);
 function register(key,label,element){if(!element)return;const page=document.createElement('div');page.className='hover-section-page';page.dataset.section=key;page.hidden=true;if(element.tagName==='DETAILS'){element.open=true;element.classList.add('section-details');}element.hidden=false;page.append(element);sections.querySelector('#section-content').append(page);pages.set(key,{page,label});const button=document.createElement('button');button.textContent=label;button.dataset.openSection=key;button.onclick=()=>open(key);menu.append(button);links.push(button);}
 let current=null;
 function back(){sections.hidden=true;document.documentElement.classList.remove('section-open');current=null;api.sectionOpen=null;closeMenu();if(Hover.router.currentView?.id!=='homeView')api.showHome();}
 function open(key){if(key==='workshop')refreshCrafts();const target=pages.get(key);if(!target)return;closeMenu();if(Hover.router.currentView?.playing)return;current=key;api.sectionOpen=key;sections.querySelector('h1').textContent=target.label;pages.forEach(({page},name)=>page.hidden=name!==key);sections.hidden=false;document.documentElement.classList.add('section-open');sections.scrollTop=0;get('section-back').focus();}
 api.registerSection=register;api.openSection=open;api.closeSection=back;api.revealSection=key=>{let attempts=0;const wait=()=>{if(Hover.router.currentView?.id==='homeView')open(key);else if(++attempts<100)setTimeout(wait,30);};wait();};
 get('section-back').onclick=back;
 register('workshop',t('Eigene Schiffe','Custom crafts'),get('craft-workshop'));
 register('records',t('Persönliche Bestzeiten','Personal records'),get('hover-records'));
 register('backup',t('Sicherung & Wiederherstellung','Backup & restore'),get('backup-save')?.closest('details'));
 register('training',t('Training','Training'),document.querySelector('.practice-options'));
 register('multiplayer','Multiplayer',get('mp-panel'));
 const changes=[...document.querySelectorAll('.enhanced-changes')].find(el=>el.querySelector('summary')?.textContent===t('Was wurde erweitert?','What has changed?'));
 register('changes',t('Alle Erweiterungen','All enhancements'),changes);
 const craftPicker=document.createElement('label');craftPicker.textContent=t('Gespeichertes oder Sitzungsschiff','Saved or session craft');const craftSelect=document.createElement('select');craftSelect.id='workshop-craft';craftPicker.append(craftSelect);get('craft-workshop').prepend(craftPicker);
 function refreshCrafts(){const source=get('modern-craft');craftSelect.innerHTML=source.innerHTML;craftSelect.value=source.value;}
 craftSelect.onchange=()=>{const source=get('modern-craft');source.value=craftSelect.value;source.dispatchEvent(new Event('change'));};get('modern-craft').addEventListener('change',refreshCrafts);
 const retro=get('practice-retro');if(retro){const select=document.createElement('select');select.id='practice-mode';select.innerHTML='<option value="modern">Modern</option><option value="retro">Retro</option>';select.onchange=()=>retro.checked=select.value==='retro';retro.hidden=true;retro.parentElement.replaceChildren(document.createTextNode(t('Darstellung','Graphics')),select,retro);}
 const proto=Hover.views.HomeView.prototype,render=proto.render;
 proto.render=function(){const result=render.call(this);get('enhanced-multiplayer').onclick=()=>open('multiplayer');if(window.HoverMultiplayer?.room||new URLSearchParams(location.search).has('room'))open('multiplayer');return result;};
 const showHome=api.showHome;api.showHome=()=>{backWithoutHome();showHome();};
 function backWithoutHome(){sections.hidden=true;document.documentElement.classList.remove('section-open');current=null;api.sectionOpen=null;}
 const practiceStart=api.startPractice;api.startPractice=async(...args)=>{backWithoutHome();return practiceStart(...args);};
 const gameRender=Hover.views.GameView.prototype.render;
 Hover.views.GameView.prototype.render=function(){backWithoutHome();const result=gameRender.call(this);if(this.options.practice){const text=this.el.querySelector('#gameLoadingText');if(text)text.textContent=this.options.practice==='workshop'?t('Teststrecke wird geladen …','Loading test track …'):t('Trainingsstrecke wird geladen …','Loading training track …');}return result;};
 // The test drive return lives in settings, not permanently over the track.
 const returnButton=document.createElement('button');returnButton.id='practice-return';returnButton.textContent=t('Zurück zur Werkstatt','Return to workshop');returnButton.hidden=true;
 document.querySelector('#hover-settings .preference-buttons').append(returnButton);
 returnButton.onclick=()=>{api.showHome();api.revealSection('workshop');};
 const update=api.updateInput;api.updateInput=function(game,view){
  const playing=!!view?.game,workshop=view?.options?.practice==='workshop';returnButton.hidden=!workshop;
  for(const link of links)link.hidden=playing;
  const guide=get('practice-guide');if(guide&&workshop)guide.hidden=true;
  const preview=get('craft-preview'),options=get('enhanced-single-options');if(preview&&options&&preview.parentElement!==options.parentElement)options.after(preview);
  if(get('enhanced-multiplayer'))get('enhanced-multiplayer').onclick=()=>open('multiplayer');
  return update(game,view);
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&current&&!document.querySelector('dialog[open]')){back();e.preventDefault();}},true);
})();
