/* Extended edition multiplayer protocol v3. Archived clients remain unchanged. */
(function () {
  'use strict';
  const de=hoverLocale.lang==='de', t=(a,b)=>de?a:b;
  // The archived multiplayer spawn path assumes the modern HUD hook.
  // Retro shares the network engine but has no team-change hook of its own.
  Hover.RetroHud.prototype.onTeamUpdate=function(){
    const hud=this.world.game.getElementById('hud');
    hud.classList.toggle('team-red',this.craft.team==='red');
    hud.classList.toggle('team-blue',this.craft.team==='blue');
  };
  const panel=document.createElement('section');panel.id='mp-panel';panel.hidden=true;
  panel.innerHTML=`<h2>Multiplayer</h2>
    <div id="mp-connect">
      <label>${t('Server-Adresse','Server address')}<input id="mp-server" type="url" spellcheck="false" placeholder="https://hover.dreimer.de"></label>
      <div class="modern-options"><label>${t('Dein Name','Your name')}<input id="mp-name" maxlength="24" autocomplete="nickname" value="Player"></label>
      <label>${t('Spieler maximal','Player limit')}<select id="mp-size"><option>2</option><option>4</option><option>6</option><option>8</option></select></label></div>
      <label>${t('Lobbyname','Lobby name')}<input id="mp-lobby-name" maxlength="40" value="Hover lobby"></label>
      <label class="mp-checkbox"><input id="mp-public" type="checkbox">${t('Öffentlich in der Lobbyliste anzeigen','Show publicly in the lobby list')}</label>
      <button id="mp-list" type="button">${t('Öffentliche Lobbys suchen','Find public lobbies')}</button><ul id="mp-directory"></ul>
      <button id="mp-create" type="button">${t('Lobby erstellen','Create lobby')}</button>
      <div class="mp-join"><input id="mp-code" maxlength="6" aria-label="${t('Raumcode','Room code')}" placeholder="ABC123" spellcheck="false"><button id="mp-join" type="button">${t('Beitreten','Join')}</button></div>
    </div>
    <div id="mp-lobby" hidden><p id="mp-room"></p><ul id="mp-players"></ul>
      <div class="modern-options"><label>Team<select id="mp-team"><option value="RED">${t('Rot','Red')}</option><option value="BLUE">${t('Blau','Blue')}</option></select></label>
      <label>Arena<select id="mp-arena"><option value="44">1 · ${t('Stadt','City')}</option><option value="46">2 · ${t('Kanalisation','Sewer')}</option><option value="47">3 · ${t('Burg','Castle')}</option></select></label>
      <label>${t('Grafik','Graphics')}<select id="mp-mode"><option value="modern">Modern</option><option value="retro">Retro</option></select></label>
      <label>${t('Flaggen pro Team','Flags per team')}<select id="mp-flags"><option>3</option><option selected>4</option><option>5</option><option>6</option></select></label></div>
      <label>Hovercraft<select id="mp-craft"></select></label>
      <div id="mp-host-settings"><label>${t('Lobbyname','Lobby name')}<input id="mp-edit-name" maxlength="40"></label><label class="mp-checkbox"><input id="mp-edit-public" type="checkbox">${t('Öffentlich','Public')}</label><button id="mp-update-name" type="button">${t('Lobbydaten speichern','Save lobby settings')}</button><button id="mp-share" type="button">${t('Eigene Schiffe teilen / aktualisieren','Share / refresh custom crafts')}</button></div>
      <label>${t('Einladungslink','Invitation link')}<input id="mp-invite" readonly></label>
      <button id="mp-begin" type="button">${t('Runde starten','Start round')}</button>
      <button id="mp-finish" type="button">${t('Lobby beenden · Punkte','End lobby · Scores')}</button>
      <button id="mp-leave" type="button">${t('Lobby verlassen','Leave lobby')}</button>
    </div>
    <section id="mp-scores" hidden><h3>${t('Endergebnis','Final scores')}</h3><p id="mp-team-scores"></p><table><thead><tr><th>${t('Spieler','Player')}</th><th>${t('Flaggenpunkte','Flag points')}</th><th>${t('Siege','Wins')}</th></tr></thead><tbody></tbody></table></section>
    <p id="mp-status" role="status" aria-live="polite"></p>`;
  const $=id=>panel.querySelector('#'+id)||document.getElementById(id)||HoverEnhanced.controls.get(id);
  $('modern-launcher').querySelector('.modern-card').appendChild(panel);
  const params=new URLSearchParams(location.search);
  const local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const defaultServer=location.hostname.endsWith('github.io')?'https://hover.dreimer.de':location.origin;
  $('mp-server').value=params.get('server')||localStorage.getItem('hover-mp-server')||defaultServer;
  $('mp-name').value=localStorage.getItem('hover-mp-name')||'Player';
  if(params.has('room')){$('mp-code').value=params.get('room').slice(0,6).toUpperCase();panel.hidden=false;}
  let socket=null,sequence=0,game=null,room=null,playerId=null,intentional=false,busy=false,launchGeneration=0;
  const downloads=new Map();
  const pending=new Map(),status=text=>{$('mp-status').textContent=text;};
  function endpoint(){
    const url=new URL($('mp-server').value);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error(t('HTTPS-Serveradresse erforderlich.','An HTTPS server address is required.'));
    const loopback=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
    if(url.protocol!=='https:'&&!(local&&loopback&&location.protocol==='http:'))throw Error(t('Bitte den HTTPS-Endpunkt des Reverse Proxys verwenden.','Please use the HTTPS endpoint of the reverse proxy.'));
    url.pathname='/ws';url.search='';url.hash='';url.protocol=url.protocol==='https:'?'wss:':'ws:';return url;
  }
  async function connect(){
    if(socket?.readyState===WebSocket.OPEN&&socket.url===endpoint().href)return;
    if(socket){intentional=true;socket.close();socket=null;}
    intentional=false;const ws=socket=new WebSocket(endpoint());
    ws.onmessage=event=>{
      const message=JSON.parse(event.data);
      if(Object.hasOwn(message,'id')){const request=pending.get(message.id);if(request){clearTimeout(request.timer);pending.delete(message.id);message.error?request.reject(Error(message.error)):request.resolve(message.result);}}
      else dispatch(message.event,message.args||[]).catch(error=>abort(error.message));
    };
    ws.onclose=()=>{
      if(socket!==ws)return;socket=null;
      for(const request of pending.values()){clearTimeout(request.timer);request.reject(Error(t('Verbindung getrennt.','Disconnected.')));}pending.clear();
      if(!intentional&&room)abort(t('Verbindung verloren. Erneut über den Raumcode beitreten.','Connection lost. Rejoin using the room code.'));
    };
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{ws.close();reject(Error(t('Server nicht erreichbar.','Server unavailable.')));},10000);
      ws.onopen=()=>{clearTimeout(timer);resolve();};ws.onerror=()=>{clearTimeout(timer);reject(Error(t('Verbindung fehlgeschlagen. HTTPS-Adresse prüfen.','Connection failed. Check the HTTPS address.')));};
    });
    localStorage.setItem('hover-mp-server',$('mp-server').value);
  }
  function rpc(method,...args){return new Promise((resolve,reject)=>{
    if(socket?.readyState!==WebSocket.OPEN)return reject(Error('Disconnected'));
    const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('Server timeout'));},10000);
    pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,args,round:room?.round}));
  });}
  const server={};
  for(const method of ['spawnMe','setCraftState','capturedFlag','uncapturedFlag','hitPod','createTempWall','sendCollision','fireBullet','sendMyBulletHitCraft','sendBulletDestroyed'])server[method]=(...args)=>{
    const deferred=jQuery.Deferred();rpc(method,...args).then(v=>{deferred.resolve(v);},e=>{deferred.reject(e);});return deferred.promise();
  };
  jQuery.connection.hoverHub={server};
  function stopScene(){
    ++launchGeneration;
    const view=Hover.router.currentView;
    if(game)game.connected=false;
    if(view?.game&&view.playing)view.stopGame();
    game=null;
  }
  function disconnect(){
    intentional=true;stopScene();room=null;playerId=null;
    if(socket)socket.close();renderLobby();
  }
  Hover.signalr={
    // The old GameView calls disconnect on scene removal. A scene is now only
    // one round; explicit Leave/End/pagehide owns the actual lobby connection.
    disconnect(){},stopGame(){},
    attachGameInstance(instance){
      game=instance;
      const spawnPod=instance.spawnPod;
      instance.spawnPod=function(data){spawnPod.call(this,data);this.world.pods[this.world.pods.length-1].location.y=data.Y;};
      const placeFlag=instance.placeFlagAt;
      instance.placeFlagAt=function(data){placeFlag.call(this,data);this.world.flags[this.world.flags.length-1].networkLocation={X:data.X,Y:data.Y,Z:data.Z};};
      instance.onReady.register(()=>patchWorld(instance));
    }
  };
  function renderLobby(){
    $('mp-connect').hidden=!!room;$('mp-lobby').hidden=!room;
    for(const id of ['mp-create','mp-join'])$(id).disabled=busy;
    $('modern-play').disabled=$('modern-retro').disabled=!!room||busy;
    $('enhanced-single-options').hidden=!!room;
    if(!room)return;
    panel.hidden=false;
    $('mp-room').textContent=`${room.name||t('Lobby','Lobby')} · ${room.code} · ${room.players.length}/${room.capacity} · ${t('Runde','Round')} ${room.round+1}`;
    $('mp-players').replaceChildren(...room.players.map(p=>{const li=document.createElement('li');li.textContent=`${p.name} · ${p.team==='RED'?t('Rot','Red'):t('Blau','Blue')}${p.id===room.host?' ★':''}`;return li;}));
    const waiting=room.phase==='waiting',host=room.host===playerId;
    $('mp-host-settings').hidden=!host;
    $('mp-edit-name').value=room.name||'';$('mp-edit-public').checked=!!room.public;
    $('mp-share').disabled=$('mp-update-name').disabled=!waiting||busy;
    $('mp-team').disabled=!waiting||busy;
    const own=room.players.find(p=>p.id===playerId);if(own)$('mp-team').value=own.team;
    const craftOptions=[[0,'Chicago'],[1,'Wizard'],[2,'Bambi'],...(room.crafts||[]).map(m=>[m.id,m.name])];
    $('mp-craft').replaceChildren(...craftOptions.map(([id,name])=>{const o=document.createElement('option');o.value=id;o.textContent=name;return o;}));
    if(own)$('mp-craft').value=own.profile;$('mp-craft').disabled=!waiting||busy;
    for(const id of ['mp-arena','mp-flags','mp-mode'])$(id).disabled=!host||!waiting||busy;
    $('mp-arena').value=String(room.maze);$('mp-flags').value=String(room.flagCount);$('mp-mode').value=room.retro?'retro':'modern';
    $('mp-begin').disabled=!host||!waiting||busy||new Set(room.players.map(p=>p.team)).size!==2;
    $('mp-finish').hidden=!host;$('mp-finish').disabled=!waiting||busy;
    const link=new URL(location.href);link.hash='';link.search='';link.searchParams.set('room',room.code);link.searchParams.set('server',$('mp-server').value);$('mp-invite').value=link.href;
  }
  async function guarded(action){if(busy)return;busy=true;renderLobby();try{await action();}catch(error){if(!intentional)status(error.message);if(!room)disconnect();}finally{busy=false;renderLobby();}}
  async function join(code){
    const name=$('mp-name').value.trim();if(!name)throw Error(t('Bitte einen Namen eingeben.','Please enter a name.'));
    await HoverCrafts.ready;const chosen=Hover.Profiles[$('modern-craft').value].id;
    const result=await rpc('join',code,chosen<=2?chosen:0,name);playerId=result.id;room=result.room;
    await syncCrafts(room);if(room.host===playerId)await shareCrafts();
    if((room.crafts||[]).some(c=>c.id===chosen))await rpc('selectCraft',chosen);
    $('mp-scores').hidden=true;localStorage.setItem('hover-mp-name',name);status(t('Team wählen. Der Gastgeber startet die Runde.','Choose a team. The host starts the round.'));
  }
  $('mp-create').onclick=()=>guarded(async()=>{window.HoverAudio?.unlock();await connect();const code=await rpc('createGame',44,4,Number($('mp-size').value)/2,{name:$('mp-lobby-name').value.trim(),public:$('mp-public').checked});await join(code);});
  $('mp-join').onclick=()=>guarded(async()=>{window.HoverAudio?.unlock();await connect();await join($('mp-code').value.trim().toUpperCase());});
  async function syncCrafts(snapshot){
    await HoverCrafts.ready;
    if((snapshot.crafts||[]).length>8)throw Error('Too many shared crafts');
    for(const offered of snapshot.crafts||[]){
      if(HoverCrafts.list().some(e=>e.hash===offered.hash))continue;
      if(!downloads.has(offered.hash))downloads.set(offered.hash,(async()=>{const raw=await rpc('getCraft',offered.hash);const entry=await HoverCraftFormat.validate(raw);if(entry.hash!==offered.hash||entry.id!==offered.id)throw Error('Craft checksum mismatch');return HoverCrafts.add(raw);})().catch(e=>{downloads.delete(offered.hash);throw e;}));
      await downloads.get(offered.hash);
    }
  }
  async function shareCrafts(){
    const policy=await HoverCraftFormat.policyReady,local=HoverCrafts.list().filter(e=>e.persistent),selected=HoverCrafts.selected();
    if(selected){const i=local.indexOf(selected);if(i>=0)local.splice(i,1);local.unshift(selected);}
    for(const e of local.slice(0,policy.maxShared))if(!(room.crafts||[]).some(m=>m.hash===e.hash))await rpc('shareCraft',e.json);
    if(local.length>policy.maxShared)status(t('Die ersten acht Schiffe wurden geteilt.','The first eight crafts were shared.'));
  }
  $('mp-share').onclick=()=>guarded(shareCrafts);
  $('mp-update-name').onclick=()=>{const values=[$('mp-edit-name').value.trim(),$('mp-edit-public').checked];guarded(()=>rpc('renameLobby',...values));};
  $('mp-craft').onchange=()=>{const id=Number($('mp-craft').value);guarded(async()=>{await rpc('selectCraft',id);const e=HoverCrafts.list().find(e=>e.id===id);$('modern-craft').value=e?'custom_'+e.hash:['Easy','Normal','Hard'][id];$('modern-craft').dispatchEvent(new Event('change'));});};
  $('mp-list').onclick=()=>guarded(async()=>{await connect();const rooms=await rpc('listRooms');$('mp-directory').replaceChildren(...rooms.map(r=>{const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=`${r.name} · ${r.players}/${r.capacity} · ${r.retro?'Retro':'Modern'} · ${r.flagCount}`;button.onclick=()=>guarded(()=>join(r.code));li.appendChild(button);return li;}));status(rooms.length?t('Lobby zum Beitreten auswählen.','Select a lobby to join.'):t('Keine öffentliche Lobby verfügbar.','No public lobby available.'));});
  $('mp-team').onchange=()=>{const team=$('mp-team').value;guarded(()=>rpc('chooseTeam',team));};
  for(const id of ['mp-arena','mp-flags','mp-mode'])$(id).onchange=()=>{
    const settings=[Number($('mp-arena').value),Number($('mp-flags').value),$('mp-mode').value==='retro'];guarded(()=>rpc('configureRoom',...settings));
  };
  $('mp-begin').onclick=()=>guarded(()=>rpc('beginRoom'));
  $('mp-finish').onclick=()=>guarded(()=>rpc('closeLobby'));
  $('mp-leave').onclick=()=>guarded(async()=>{await rpc('leave');disconnect();status(t('Lobby verlassen.','Left lobby.'));});
  $('modern-menu').addEventListener('click',()=>{
    if(room&&game)guarded(()=>rpc('leave').finally(()=>{disconnect();HoverEnhanced.showHome();panel.hidden=false;}));
  });
  window.addEventListener('pagehide',disconnect);
  function abort(message){disconnect();HoverEnhanced.showHome();panel.hidden=false;status(message);}
  function showLobby(message){stopScene();HoverEnhanced.showHome();panel.hidden=false;renderLobby();status(message);}
  async function dispatch(event,args){
    if(event==='lobby'){room=args[0];renderLobby();await syncCrafts(room);return;}
    if(event==='roundAborted'){room=args[0];showLobby(t('Runde abgebrochen: Ein Spieler hat die Verbindung getrennt. Die Lobby bleibt offen.','Round aborted: a player disconnected. The lobby remains open.'));return;}
    if(event==='launch'){
      room=args[0];renderLobby();const generation=++launchGeneration;
      await syncCrafts(room);
      if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
      Hover.retro=room.retro;window.HoverAudio?.unlock();
      if(window.HoverAudio)await new Promise(resolve=>Hover.audio.loadSounds(resolve));
      if(generation!==launchGeneration||!room)return;
      Hover.router.navigate('multiplayer-room',{trigger:false});
      Hover.router.setCurrentView(new Hover.views.GameView({gameId:room.code,mazeId:room.maze,retro:room.retro,playerName:$('mp-name').value.trim(),craftProfile:Hover.Profiles.fromId(room.players.find(p=>p.id===playerId).profile)}));
      setTimeout(()=>{if(game&&generation===launchGeneration)game.useMazeId(room.maze);},0);return;
    }
    if(event==='roundEnded'){
      room=args[0];const winner=room.lastResult==='RED'?t('Rot','Red'):t('Blau','Blue');
      showLobby(t('Runde beendet. Team ','Round finished. Team ')+winner+t(' gewinnt. Nächste Runde wählen oder Lobby beenden.',' wins. Choose the next round or end the lobby.'));return;
    }
    if(event==='lobbyClosed'){
      const result=args[0];disconnect();HoverEnhanced.showHome();panel.hidden=false;$('mp-scores').hidden=false;
      $('mp-team-scores').textContent=`${t('Rundensiege','Round wins')}: ${t('Rot','Red')} ${result.teamWins.RED} · ${t('Blau','Blue')} ${result.teamWins.BLUE}`;
      panel.querySelector('tbody').replaceChildren(...result.players.sort((a,b)=>b.flags-a.flags).map(p=>{const tr=document.createElement('tr');for(const value of [p.name,p.flags,p.wins]){const td=document.createElement('td');td.textContent=value;tr.appendChild(td);}return tr;}));
      status(t('Lobby beendet. Danke fürs Spielen!','Lobby ended. Thanks for playing!'));return;
    }
    if(event==='awardPod'&&game){const pos=args[0],world=game.world,pod=world.pods.find(p=>Math.hypot(p.location.x-pos.X,p.location.y-pos.Y,p.location.z-pos.Z)<10);if(pod){pod.onHit(game.craft);pod.remove();world.pods.splice(world.pods.indexOf(pod),1);}return;}
    if(game&&typeof game[event]==='function')game[event](...args);
  }
  function patchWorld(instance) {
    const world = instance.world, requests = new Set();
    function request(method, position) {
      const key = method + ':' + position.x + ':' + position.z;
      if (requests.has(key)) return;
      requests.add(key);
      // Send the current position first; collision callbacks may precede the
      // regular 15 Hz update, especially just after a sharp turn/jump.
      rpc('setCraftState', instance.craft.getStateUpdate()).then(() => {
        if (instance !== game || !instance.connected) return;
        const flag = world.flags.find(f => f.location === position);
        return rpc(method, flag?.networkLocation || {X:position.x,Y:position.y,Z:position.z});
      })
        .catch(() => {}).finally(() => { setTimeout(() => requests.delete(key), 200); });
    }
    world.checkForFlagCaptures = (craft, enemyTeam) => {
      if (!craft.player || !instance.connected) return;
      const flag = world.findFlag(craft.position, 192, false, enemyTeam);
      if (flag) request('capturedFlag', flag.location);
      const own = world.findFlag(craft.position, 192, false, craft.team);
      if (own && own.location.clone().sub(craft.position).normalize().dot(craft.velocity.clone().normalize())>.5) craft.velocity.multiplyScalar(-.6);
    };
    const checkPods = world.checkForPodHits;
    world.checkForPodHits = function(craft, suppress) {
      if (suppress) return checkPods.call(world, craft, true);
      if (!craft.player || !instance.connected) return;
      for (const pod of world.pods) if (pod.location.distanceTo(craft.position)<128) request('hitPod', pod.location);
    };
    // Flag-return pads also affect remote extrapolated crafts in the old engine.
    // Only a local player's pad contact may request a shared flag restoration.
    for (const pad of world.pads) {
      if (!pad.onAbove || !String(pad.onAbove).includes('uncapture')) continue;
      const original = pad.onAbove;
      pad.onAbove = function(craft) {
        if (!craft.player) return;
        const flags = world.flags.filter(f => f.captured && f.team !== craft.team);
        const saved = flags.map(f => f.uncapture);
        flags.forEach(f => { f.uncapture = () => request('uncapturedFlag', f.location); });
        try { original.call(this, craft); } finally { flags.forEach((f,i) => { f.uncapture = saved[i]; }); }
      };
    }
  }
  window.HoverMultiplayer={get room(){return room;},get game(){return game;},get playerId(){return playerId;},disconnect};
})();
