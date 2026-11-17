/* Extended edition preferences and real single-player pause. */
(function () {
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
 const defaults={music:1,engine:1,effects:1,hud:1,camera:430,touchSize:1,touchOpacity:.85,deadzone:.18,sensitivity:1};
 let values;try{values=JSON.parse(localStorage.getItem('hover-preferences')||'{}');}catch(_){values={};}
 const ranges={music:[0,1],engine:[0,1],effects:[0,1],hud:[.65,1.4],camera:[240,900],touchSize:[.7,1.3],touchOpacity:[.25,1],deadzone:[.05,.5],sensitivity:[.5,2]};
 function validate(raw){const result={};for(const [key,value]of Object.entries(defaults)){const n=Number(raw?.[key]);result[key]=Number.isFinite(n)?Math.max(ranges[key][0],Math.min(ranges[key][1],n)):value;}return result;}
 values=validate(values);
 const prefs=window.HoverPreferences={get values(){return values;},defaults,validate,replace(raw){values=validate(raw);save();render();}};
 const dialog=document.createElement('dialog');dialog.id='hover-settings';dialog.className='hover-dialog';
 dialog.innerHTML=`<h2>${t('Pause & Einstellungen','Pause & settings')}</h2><p id="pause-explanation"></p><div class="preference-fields"></div><div class="preference-buttons"><button data-command="resume">${t('Zurück','Back')}</button><button data-command="reset">${t('Standardwerte','Restore defaults')}</button><button data-command="home">${t('Partie verlassen','Leave match')}</button></div>`;
 document.body.appendChild(dialog);
 const labels={music:t('Musik','Music'),engine:t('Motor','Engine'),effects:t('Effekte','Effects'),hud:t('HUD-Größe','HUD size'),camera:t('Außenkamera-Abstand','Chase camera distance'),touchSize:t('Touch-Größe','Touch size'),touchOpacity:t('Touch-Deckkraft','Touch opacity'),deadzone:t('Stick-Totzone','Stick dead zone'),sensitivity:t('Stick-Empfindlichkeit','Stick sensitivity')};
 for(const key of Object.keys(defaults)){const label=document.createElement('label');const title=document.createElement('span');title.textContent=labels[key];label.append(title);const input=document.createElement('input');input.type='range';input.min=ranges[key][0];input.max=ranges[key][1];input.step=key==='camera'?10:.01;input.dataset.preference=key;const output=document.createElement('output');input.oninput=()=>{values[key]=Number(input.value);output.value=input.value;save();};label.append(input,output);dialog.querySelector('.preference-fields').append(label);}
 function apply(){const s=document.documentElement.style;s.setProperty('--preference-hud',values.hud);s.setProperty('--touch-size',values.touchSize);s.setProperty('--touch-opacity',values.touchOpacity);window.HoverAudio?.setVolumes?.(values);window.dispatchEvent(new Event('resize'));}
 function save(){localStorage.setItem('hover-preferences',JSON.stringify(values));apply();}
 function render(){dialog.querySelectorAll('[data-preference]').forEach(el=>{el.value=values[el.dataset.preference];el.nextElementSibling.value=el.value;});apply();}
 let pausedView=null,previousFocus=null;
 function clearControls(game){for(const c of game?.craftControllers||[]){for(const k of ['forward','reverse','left','right','fire','jump','cloak','placeWall','hudZoomIn','hudZoomOut'])c[k]=false;c.turn=c.engine=0;}}
 function close(){if(!dialog.open)return;dialog.close();api.menuOpen=false;document.documentElement.classList.remove('settings-open');if(pausedView?.game){pausedView.game.clock.getDelta();clearControls(pausedView.game);}pausedView=null;api.resetInput?.();window.HoverAudio?.setPaused?.(false);previousFocus?.focus?.();}
 function open(){if(dialog.open)return;previousFocus=document.activeElement;const v=Hover.router.currentView;clearControls(v?.game);api.menuOpen=true;pausedView=v?.playing&&!v.options.gameId?v:null;document.getElementById('pause-explanation').textContent=v?.playing?(pausedView?t('Spiel pausiert.','Game paused.'):t('Multiplayer läuft weiter.','Multiplayer continues running.')):t('Einstellungen werden auf diesem Gerät gespeichert.','Settings are saved on this device.');document.documentElement.classList.add('settings-open');HoverAudio?.setPaused?.(!!pausedView);dialog.showModal();dialog.querySelector('[data-command=resume]').focus();}
 api.toggleSettings=()=>dialog.open?close():open();api.isPaused=game=>!!pausedView&&pausedView.game===game;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.querySelector('[data-command=resume]').onclick=close;
 dialog.querySelector('[data-command=reset]').onclick=()=>prefs.replace(defaults);
 dialog.querySelector('[data-command=home]').onclick=async()=>{close();if(window.HoverMultiplayer?.room)await HoverMultiplayer.leave();api.showHome();};
 const button=document.createElement('button');button.id='modern-settings';button.textContent=t('Einstellungen','Settings');button.onclick=open;document.getElementById('modern-toolbar').append(button);
 document.getElementById('modern-menu').onclick=open;
 window.addEventListener('keydown',e=>{if(e.code===(window.HoverBindings?.values.keys.pause||'Escape')&&!api.mapOpen&&!dialog.open&&Hover.router.currentView?.playing){e.preventDefault();e.stopImmediatePropagation();open();}},true);
 const ready=Hover.views.GameView.prototype.onSoundAndGameReady;
 Hover.views.GameView.prototype.onSoundAndGameReady=function(){const game=this.game,frame=game.runFrame;game.runFrame=function(){if(api.isPaused(this)){this.clock.getDelta();return;}return frame.call(this);};return ready.call(this);};
 const remove=Hover.views.GameView.prototype.remove;Hover.views.GameView.prototype.remove=function(){close();return remove.call(this);};
 document.addEventListener('visibilitychange',()=>{const v=Hover.router.currentView;if(document.hidden&&v?.playing&&!v.options.gameId)open();});
 render();
})();
