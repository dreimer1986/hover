/* Replacement multiplayer transport; loaded only in the optional edition. */
(function () {
  'use strict';
  const de = hoverLocale.lang === 'de';
  const t = (g, e) => de ? g : e;
  const $ = id => document.getElementById(id);
  const panel = document.createElement('details');
  panel.id = 'mp-panel';
  panel.innerHTML = `<summary>Multiplayer · ${t('Gemeinsam spielen', 'Play together')}</summary>
    <p>${t('Erstelle einen Raum und teile den Einladungslink. Der Gastgeber startet die Runde.', 'Create a room and share the invitation link. The host starts the round.')}</p>
    <label>${t('Server-Adresse', 'Server address')}<input id="mp-server" type="url" spellcheck="false" placeholder="https://hover.dreimer.de"></label>
    <div class="modern-options"><label>${t('Dein Name', 'Your name')}<input id="mp-name" maxlength="24" autocomplete="nickname" value="Player"></label>
    <label>${t('Spieler maximal', 'Player limit')}<select id="mp-size"><option>2</option><option>4</option><option>6</option><option>8</option></select></label></div>
    <button id="mp-create" type="button">${t('Raum erstellen', 'Create room')}</button>
    <div class="mp-join"><input id="mp-code" maxlength="6" aria-label="${t('Raumcode', 'Room code')}" placeholder="ABC123" spellcheck="false"><button id="mp-join" type="button">${t('Beitreten', 'Join')}</button></div>
    <div id="mp-lobby" hidden><p id="mp-room"></p><ul id="mp-players"></ul>
    <label>${t('Einladungslink', 'Invitation link')}<input id="mp-invite" readonly></label>
    <button id="mp-begin" type="button">${t('Runde starten', 'Start round')}</button><button id="mp-leave" type="button">${t('Raum verlassen', 'Leave room')}</button></div>
    <p id="mp-status" role="status" aria-live="polite"></p>`;
  $('modern-retro').after(panel);
  // Allow scrolling the expanded lobby on touch devices despite the archived
  // game's document-level touchmove preventDefault handler.
  $('modern-launcher').addEventListener('touchmove', event => event.stopPropagation(), {passive:true});
  const params = new URLSearchParams(location.search);
  const defaultServer = location.hostname.endsWith('github.io') ? 'https://hover.dreimer.de' : location.origin;
  $('mp-server').value = params.get('server') || localStorage.getItem('hover-mp-server') || defaultServer;
  $('mp-name').value = localStorage.getItem('hover-mp-name') || 'Player';
  if (params.has('room')) { $('mp-code').value = params.get('room').slice(0, 6).toUpperCase(); panel.open = true; }
  let socket = null, sequence = 0, game = null, room = null, playerId = null, intentional = false, busy = false;
  const pending = new Map();
  const status = text => { $('mp-status').textContent = text; };
  function endpoint() {
    const url = new URL($('mp-server').value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw Error(t('HTTP- oder HTTPS-Adresse erforderlich.', 'Use an HTTP or HTTPS address.'));
    if (location.protocol === 'https:' && url.protocol !== 'https:') throw Error(t('Diese HTTPS-Seite benötigt auch einen HTTPS-Spielserver.', 'This HTTPS page requires an HTTPS game server.'));
    url.pathname = '/ws'; url.search = ''; url.hash = ''; url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url;
  }
  async function connect() {
    if (socket && socket.readyState === WebSocket.OPEN) return;
    intentional = false;
    const ws = socket = new WebSocket(endpoint());
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (Object.hasOwn(message, 'id')) {
        const request = pending.get(message.id);
        if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(Error(message.error)) : request.resolve(message.result); }
      } else dispatch(message.event, message.args || []);
    };
    ws.onclose = () => {
      if (socket !== ws) return;
      socket = null;
      for (const request of pending.values()) { clearTimeout(request.timer); request.reject(Error(t('Verbindung getrennt.', 'Disconnected.'))); }
      pending.clear();
      const hadRoom = !!room;
      room = null; renderLobby();
      if (!intentional && hadRoom) abort(t('Verbindung verloren. Bitte einen neuen Raum erstellen.', 'Connection lost. Please create a new room.'));
    };
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { ws.close(); reject(Error(t('Server nicht erreichbar.', 'Server unavailable.'))); }, 10000);
      ws.onopen = () => { clearTimeout(timer); resolve(); };
      ws.onerror = () => { clearTimeout(timer); reject(Error(t('Verbindung fehlgeschlagen. Server-Adresse und HTTPS prüfen.', 'Connection failed. Check server address and HTTPS.'))); };
    });
    localStorage.setItem('hover-mp-server', $('mp-server').value);
  }
  function rpc(method, ...args) {
    return new Promise((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return reject(Error('Disconnected'));
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(Error('Server timeout')); }, 10000);
      pending.set(id, {resolve, reject, timer});
      socket.send(JSON.stringify({id, method, args}));
    });
  }
  // The preserved MPGame expects jQuery Deferreds. Adapt only that interface;
  // this is our JSON/WebSocket protocol, not an implementation of SignalR.
  const server = {};
  for (const method of ['spawnMe','setCraftState','capturedFlag','uncapturedFlag','hitPod','createTempWall','sendCollision','fireBullet','sendMyBulletHitCraft','sendBulletDestroyed']) {
    server[method] = (...args) => {
      const deferred = jQuery.Deferred();
      rpc(method, ...args).then(value => { deferred.resolve(value); }, error => { deferred.reject(error); });
      return deferred.promise();
    };
  }
  jQuery.connection.hoverHub = {server};
  function disconnect() {
    intentional = true;
    game = null; room = null; playerId = null;
    if (socket) socket.close();
    renderLobby();
  }
  Hover.signalr = {
    disconnect, stopGame: disconnect,
    attachGameInstance(instance) {
      game = instance;
      const spawnPod = instance.spawnPod;
      instance.spawnPod = function(data) {
        spawnPod.call(this, data);
        // The old modern Pod constructor hardcodes Y=20, discarding elevated
        // map positions. Keep visuals, collision and server coordinates aligned.
        this.world.pods[this.world.pods.length - 1].location.y = data.Y;
      };
      instance.onReady.register(() => patchWorld(instance));
    }
  };
  function renderLobby() {
    $('mp-lobby').hidden = !room;
    for (const id of ['mp-create','mp-join','mp-name','mp-server','mp-size']) $(id).disabled = !!room || busy;
    // Avoid replacing a lobby/connection with an unrelated single-player view.
    $('modern-play').disabled = $('modern-retro').disabled = !!room || busy;
    if (!room) return;
    $('mp-room').textContent = `${t('Raum', 'Room')} ${room.code} · ${room.players.length}/${room.capacity}`;
    $('mp-players').replaceChildren(...room.players.map(p => {
      const li = document.createElement('li'); li.textContent = `${p.name} · ${p.team === 'RED' ? t('Rot','Red') : t('Blau','Blue')}${p.id === room.host ? ' ★' : ''}`; return li;
    }));
    $('mp-begin').disabled = room.host !== playerId || room.phase !== 'waiting' || room.players.length < 2 || room.players.length % 2 !== 0;
    const link = new URL(location.href); link.hash = ''; link.search = '';
    link.searchParams.set('room', room.code); link.searchParams.set('server', $('mp-server').value);
    $('mp-invite').value = link.href;
  }
  async function guarded(action) {
    if (busy) return;
    busy = true; renderLobby(); status(t('Verbinde …', 'Connecting …'));
    try { await action(); }
    catch (error) { status(error.message); if (!room) disconnect(); }
    finally { busy = false; renderLobby(); }
  }
  async function join(code) {
    const name = $('mp-name').value.trim();
    if (!name) throw Error(t('Bitte einen Namen eingeben.', 'Please enter a name.'));
    Hover.retro = false;
    if (window.HoverAudio) await new Promise(resolve => Hover.audio.loadSounds(resolve));
    const result = await rpc('join', code, Hover.Profiles[$('modern-craft').value].id, name);
    playerId = result.id; room = result.room;
    localStorage.setItem('hover-mp-name', name);
    status(t('Warte auf Mitspieler und den Start durch den Gastgeber.', 'Waiting for players and the host to start.'));
  }
  $('mp-create').onclick = () => guarded(async () => {
    if (window.HoverAudio) HoverAudio.unlock();
    await connect();
    const code = await rpc('createGame', Number($('modern-arena').value), 4, Number($('mp-size').value) / 2);
    await join(code);
  });
  $('mp-join').onclick = () => guarded(async () => {
    if (window.HoverAudio) HoverAudio.unlock();
    await connect(); await join($('mp-code').value.trim().toUpperCase());
  });
  $('mp-begin').onclick = () => guarded(() => rpc('beginRoom'));
  $('mp-leave').onclick = () => { disconnect(); status(t('Raum verlassen.', 'Left room.')); };
  $('modern-menu').addEventListener('click', disconnect);
  window.addEventListener('pagehide', disconnect);
  function abort(message) {
    const current = game;
    if (current) {
      current.connected = false;
      const view = Hover.router.currentView;
      if (view && view.game === current) view.stopGame();
    }
    disconnect();
    Hover.router.navigate('', {trigger:false}); Hover.router.home();
    panel.open = true; status(message);
  }
  function dispatch(event, args) {
    if (event === 'lobby') { room = args[0]; renderLobby(); return; }
    if (event === 'roundAborted') { abort(t('Ein Spieler hat die Verbindung getrennt. Bitte einen neuen Raum erstellen.', args[0])); return; }
    if (event === 'launch') {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      Hover.retro = false;
      Hover.router.navigate('multiplayer-room', {trigger:false});
      Hover.router.setCurrentView(new Hover.views.GameView({gameId:room.code, mazeId:args[0], playerName:$('mp-name').value.trim(), craftProfile:Hover.Profiles[$('modern-craft').value]}));
      // Constructor must return and GameView must register its onReady listener.
      setTimeout(() => { if (game) game.useMazeId(args[0]); }, 0);
      return;
    }
    if (event === 'roundEnded') { if (game) game.connected = false; return; }
    if (event === 'awardPod' && game) {
      const pos = args[0], world = game.world;
      const pod = world.pods.find(p => Math.hypot(p.location.x-pos.X,p.location.y-pos.Y,p.location.z-pos.Z)<10);
      if (pod) { pod.onHit(game.craft); pod.remove(); world.pods.splice(world.pods.indexOf(pod),1); }
      return;
    }
    if (game && typeof game[event] === 'function') game[event](...args);
  }
  function patchWorld(instance) {
    const world = instance.world, requests = new Set();
    function request(method, position) {
      const key = method + ':' + position.x + ':' + position.z;
      if (requests.has(key)) return;
      requests.add(key);
      // Send the current position first; collision callbacks may precede the
      // regular 15 Hz update, especially just after a sharp turn/jump.
      rpc('setCraftState', instance.craft.getStateUpdate()).then(() => rpc(method, {X:position.x,Y:position.y,Z:position.z}))
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
  // Small public diagnostic surface used by integration tests; no credentials.
  window.HoverMultiplayer = {get room(){return room;}, get game(){return game;}, get playerId(){return playerId;}, disconnect};
})();
