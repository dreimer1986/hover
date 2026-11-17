/* A separate training/test arena: no archived map is edited. */
(function(){
 'use strict';
 const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
 const p=(X,Z,Y=0)=>({X,Y,Z}),corners=[p(0,0),p(0,6144),p(6144,6144),p(6144,0),p(0,0)];
 const wall=(a,b)=>({...Hover.json.mazes[44].Walls[0],A:a,B:{...b,Y:768}});
 Hover.json.mazes[9001]={MazeId:9001,Name:'Training',Scheme:'Maze1',Order:0,Walls:corners.slice(0,4).map((a,i)=>wall(a,corners[i+1])).concat([wall(p(2048,2048),p(2048,4096)),wall(p(4096,1024),p(4096,3072))]),Floors:[{Texture:'FBASE_01',Points:corners}],Spawns:[{...p(1024,5120,96),Team:'RED'},{...p(5120,1024,96),Team:'BLUE'}],Flags:['RED','BLUE'].flatMap((Team,i)=>[0,1,2].map(n=>({...p(i?5120:1024,2048+n*768,1),Team}))),Pods:[p(1024,4096,96),p(3072,4608,96),p(5120,4096,96)],Beacons:[]};
 const proto=Hover.views.GameView.prototype,init=proto.initialize,ready=proto.onSoundAndGameReady,won=proto.onGameWon,lost=proto.onGameLost;
 proto.initialize=function(){if(this.options.practice)this.mazeIds=[9001];const result=init.call(this);if(this.options.practice)this.game.spawnDrones=function(){};return result;};
 const banner=document.createElement('section');banner.id='practice-guide';banner.hidden=true;banner.innerHTML='<p role="status"></p><button type="button"></button>';document.body.append(banner);
 banner.querySelector('button').textContent=t('Zurück zur Werkstatt / Start','Return to workshop / home');
 function finish(){const workshop=Hover.router.currentView?.options.practice==='workshop';api.showHome();banner.hidden=true;if(workshop){const panel=document.getElementById('craft-workshop');panel.open=true;panel.scrollIntoView({block:'start'});}}
 banner.querySelector('button').onclick=finish;
 const texts=[t('Fahre los und lenke um die Wände. Das Radar zeigt deine Position und die Flaggen.','Drive around the walls. The radar shows your position and the flags.'),t('Springe! Die Sprunganzeige zeigt Höhe und Vorrat. Für das Training hast du drei Sprünge.','Jump! The jump indicator shows height and inventory. You have three practice jumps.'),t('Aktiviere die Tarnung. Die Anzeige läuft ab, solange du unsichtbar bist.','Activate cloak. Its gauge runs down while you are invisible.'),t('Platziere eine Wand hinter dir. Der Balken zeigt ihre verbleibende Dauer.','Place a wall behind you. The gauge shows its remaining lifetime.'),t('Sammle eines der schwebenden Extras ein. Beobachte danach Vorrat oder Effektanzeige.','Collect a floating pickup. Watch your inventory or effect indicator change.'),t('Sammle die drei blauen Flaggen. Deine roten Flaggen gehören deinem Team. Nutze die große Karte zur Orientierung.','Collect the three blue flags. The red flags belong to your team. Use the large map to find your way.')];
 proto.onSoundAndGameReady=function(){
  const result=ready.call(this);if(!this.options.practice)return result;
  const g=this.game,c=g.craft;g.world.drones.forEach(d=>{d.craft?.remove?.();});g.world.drones=[];c.springCount=c.cloakCount=c.wallCount=3;
  let step=0,distance=0,last=c.position.clone(),actions=new Set(),pickup=false;
  for(const name of ['jump','cloak','placeWall']){const fn=c[name];c[name]=function(){const before=name==='jump'?this.springCount:name==='cloak'?this.cloakCount:this.wallCount;const result=fn.apply(this,arguments);if(before>0)actions.add(name);return result;};}
  for(const pod of g.world.pods){const fn=pod.onHit;pod.onHit=function(craft){if(craft===c)pickup=true;return fn.call(this,craft);};}
  banner.hidden=false;
  const update=g.updatePhysics;g.updatePhysics=function(dt){const result=update.call(this,dt);distance+=c.position.distanceTo(last);last.copy(c.position);if(distance>700&&step===0)step=1;if(step===1&&actions.has('jump'))step=2;if(step===2&&actions.has('cloak'))step=3;if(step===3&&actions.has('placeWall'))step=4;if(step===4&&pickup)step=5;banner.querySelector('p').textContent=this===g&&(Hover.router.currentView.options.practice==='training')?`${step+1}/6 · ${texts[step]}`:t('Testfahrt: Prüfe Fahrverhalten, Drehung und Außenansicht. Änderungen bleiben in der Werkstatt erhalten.','Test drive: check handling, orientation and chase view. Your workshop edits are retained.');return result;};
  return result;
 };
 proto.onGameWon=function(){if(!this.options.practice)return won.call(this);this.stopGame();banner.querySelector('p').textContent=t('Training abgeschlossen! Zurück zum Start oder zur Werkstatt.','Training complete! Return to home or the workshop.');};
 proto.onGameLost=function(){if(!this.options.practice)return lost.call(this);finish();};
 const remove=proto.remove;proto.remove=function(){banner.hidden=true;return remove.call(this);};
 api.startPractice=async function(kind,retro){if(window.HoverMultiplayer?.room)throw Error(t('Bitte zuerst die Lobby verlassen.','Please leave the lobby first.'));await HoverCrafts.ready;HoverAudio.unlock();Hover.retro=retro;await new Promise(resolve=>Hover.audio.loadSounds(resolve));Hover.settings.setIntroMessageShown(true);Hover.router.navigate('practice',{trigger:false});Hover.router.setCurrentView(new Hover.views.GameView({practice:kind,retro,mazeId:9001,flagCount:3,craftProfile:Hover.Profiles[api.controls.get('modern-craft').value]}));};
 const home=document.createElement('div');home.className='practice-options';home.innerHTML=`<label><input type="checkbox" id="practice-retro"> Retro</label><button id="practice-training">${t('Training starten','Start training')}</button>`;api.controls.get('modern-launcher').querySelector('.modern-card').append(home);
 home.querySelector('button').onclick=()=>api.startPractice('training',home.querySelector('input').checked).catch(e=>alert(e.message));
})();
