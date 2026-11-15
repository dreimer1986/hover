/* Optional modern UI. The preserved game and its assets are not edited. */
(function () {
  'use strict';
  const mobile = window.hoverMobile;
  const t = window.hoverLocale.t;
  const root = document.documentElement;
  let wide = mobile, touch = mobile, currentGame = null, originalDimensions = null;
  let controller = null, view = null, lastSize = '', fullWasWide = null;
  const pointers = new Map();
  const directions = ['forward', 'reverse', 'left', 'right'];
  const actions = ['fire', 'jump', 'placeWall', 'cloak'];
  const ui = document.createElement('div');
  ui.id = 'modern-ui';
  ui.innerHTML = `
    <nav id="modern-toolbar" aria-label="Spielansicht">
      <a href="../../?view=archive">← Archiv</a>
      <button id="modern-menu" type="button">Menü</button>
      <button id="modern-wide" type="button">Großansicht</button>
      <button id="modern-touch" type="button">Touch</button>
      <button id="modern-sound" type="button" aria-label="Ton an" title="Ton an">♪</button>
      <button id="modern-full" type="button">⛶ Vollbild</button>
    </nav>
    <section id="modern-launcher" aria-label="Hover starten">
      <div class="modern-card">
        <p class="enhanced-edition">Erweiterte Fassung</p>
        <div id="enhanced-single-options" class="modern-options">
          <label id="enhanced-level-control" hidden>Arena<select id="modern-arena"><option value="44">1 · Stadt</option><option value="46">2 · Kanalisation</option><option value="47">3 · Burg</option></select></label>
          <label>Hovercraft<select id="modern-craft"><option value="Easy">Einfach</option><option value="Normal">Normal</option><option value="Hard">Schwer</option></select></label>
          <label>Flaggen pro Team<select id="modern-flags"><option>3</option><option>4</option><option>5</option><option>6</option></select></label>
        </div>
        <button id="modern-play" class="homeButton" type="button">Einzelspieler</button>
        <button id="enhanced-multiplayer" class="homeButton" type="button">Multiplayer</button>
        <button id="modern-retro" class="homeButton" type="button">Retro</button>
        <p id="enhanced-unlock-message" role="status" aria-live="polite"></p>
      </div>
    </section>
    <div id="modern-readout" aria-label="Spielstatus" hidden></div>
    <div id="modern-retro-hud" hidden aria-label="Retro-Status">
      <div class="retro-inventory">
        <div class="retro-meter" data-meter="height"><span class="retro-meter-label">Sprunghöhe</span><div class="retro-track"><i></i></div><span class="retro-count">A · <b>0</b></span></div>
        <div class="retro-meter" data-meter="wall"><span class="retro-meter-label">Wanddauer</span><div class="retro-track"><i></i></div><span class="retro-count">S · <b>0</b></span></div>
        <div class="retro-meter" data-meter="cloak"><span class="retro-meter-label">Tarnung</span><div class="retro-track"><i></i></div><span class="retro-count">D · <b>0</b></span></div>
      </div>
      <div class="retro-radar-space" aria-hidden="true"></div>
      <div class="retro-durations">
        <div class="retro-meter" data-meter="shield"><span>Schilddauer</span><div class="retro-track"><i></i></div></div>
        <div class="retro-meter" data-meter="boost"><span>Tempo-Effekt</span><div class="retro-track"><i></i></div></div>
      </div>
    </div>
    <div id="modern-controls" hidden>
      <div id="modern-pad" role="group" aria-label="Steuerkreuz: ziehen zum Fahren und Lenken">
        <span class="pad-up">▲</span><span class="pad-left">◀</span><span class="pad-center">✦</span><span class="pad-right">▶</span><span class="pad-down">▼</span>
      </div>
      <div id="modern-actions" role="group" aria-label="Extras">
        <button type="button" data-action="jump">Sprung <small>A</small></button>
        <button type="button" data-action="placeWall">Wand <small>S</small></button>
        <button type="button" data-action="cloak">Tarnung <small>D</small></button>
        <button type="button" data-action="fire" title="Leertastenfunktion: wirkt nur mit ausgerüsteter Waffe">Feuern <small>␣</small></button>
      </div>
    </div>
    <p id="modern-status" role="status" aria-live="polite"></p>`;
  window.hoverLocale.translate(ui);
  document.body.appendChild(ui);
  const controls = new Map([...ui.querySelectorAll('[id]')].map(el => [el.id, el]));
  const $ = id => document.getElementById(id) || controls.get(id);
  function release() {
    pointers.clear();
    if (controller) [...directions, ...actions].forEach(key => { controller[key] = false; });
    ui.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed'));
  }
  function sync() {
    root.classList.toggle('modern-wide', wide);
    root.classList.toggle('modern-touch', touch);
    $('modern-wide').setAttribute('aria-pressed', wide);
    $('modern-touch').setAttribute('aria-pressed', touch);
    lastSize = '';
  }
  $('modern-wide').onclick = () => { wide = !wide; sync(); };
  HoverEnhanced.setTouch=value=>{release();touch=value;sync();};
  $('modern-touch').onclick = () => { release(); touch = !touch; sync(); };
  function status(text) { $('modern-status').textContent = t(text); }
  function fullscreenChanged() {
    const full = !!(document.fullscreenElement || document.webkitFullscreenElement);
    $('modern-full').textContent = t(full ? '⛶ Beenden' : '⛶ Vollbild');
    if (!full && fullWasWide !== null) { wide = fullWasWide; fullWasWide = null; sync(); }
    lastSize = '';
  }
  $('modern-full').onclick = async () => {
    release();
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
      } else {
        fullWasWide = wide; wide = true; sync();
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!request) { fullWasWide = null; status('Browser-Vollbild ist hier nicht verfügbar. Die Großansicht nutzt den verfügbaren Bildschirm.'); return; }
        await request.call(root);
        status('');
      }
    } catch (_) { fullWasWide = null; status('Vollbild wurde nicht zugelassen. Die Großansicht bleibt verfügbar.'); }
  };
  document.addEventListener('fullscreenchange', fullscreenChanged);
  document.addEventListener('webkitfullscreenchange', fullscreenChanged);
  $('modern-sound').onclick = () => {
    const enabled = !Hover.settings.getSoundEnabled();
    if (window.HoverAudio) HoverAudio.unlock();
    Hover.settings.setSoundEnabled(enabled); Hover.audio.setEnabled(enabled);
    const game = Hover.router.currentView && Hover.router.currentView.game;
    if (game) game.toggleSound(enabled);
  };
  window.addEventListener('hover-audio-error', () => status('Einige Töne konnten nicht geladen werden. Bitte die Seite neu laden.'));
  $('modern-menu').onclick = () => { release(); Hover.router.home(); };
  let starting = false;
  async function start(retro) {
    if (starting) return;
    starting = true;
    release();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (window.HoverAudio) HoverAudio.unlock();
    Hover.retro = retro;
    // Craft objects capture their sound references during construction. Select
    // and decode the correct bank first, including on modern/retro switches.
    if (window.HoverAudio) await new Promise(resolve => Hover.audio.loadSounds(resolve));
    starting = false;
    Hover.router.navigate(retro ? 'retro' : 'single-player/play', {trigger: false});
    Hover.router.setCurrentView(new Hover.views.GameView({
      retro, mazeId: window.HoverEnhanced.levelUnlocked ? Number($('modern-arena').value) : 44,
      flagCount: Number($('modern-flags').value), craftProfile: Hover.Profiles[$('modern-craft').value]
    }));
  }
  window.HoverEnhanced.start = start;
  window.HoverEnhanced.controls = controls;
  window.HoverEnhanced.ui = ui;
  $('modern-play').onclick = () => start(false);
  $('modern-retro').onclick = () => start(true);
  function active() { return !HoverEnhanced.mapOpen && touch && view && view.playing && controller && !document.hidden; }
  function applyDirections() {
    if (!controller) return;
    directions.forEach(key => { controller[key] = [...pointers.values()].some(p => p.keys.includes(key)); });
  }
  const pad = $('modern-pad');
  function padMove(e) {
    if (!pointers.has(e.pointerId)) return;
    const box = pad.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width * 2 - 1;
    const y = (e.clientY - box.top) / box.height * 2 - 1;
    const keys = [];
    if (y < -.24) keys.push('forward');
    if (y > .24) keys.push('reverse');
    if (x < -.24) keys.push('left');
    if (x > .24) keys.push('right');
    pointers.set(e.pointerId, {element: pad, keys}); applyDirections();
  }
  pad.addEventListener('pointerdown', e => {
    if (!active()) return;
    e.preventDefault(); pad.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, {element: pad, keys: []});
    pad.classList.add('pressed'); padMove(e);
  });
  pad.addEventListener('pointermove', padMove);
  ui.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('pointerdown', e => {
      if (!active()) return;
      e.preventDefault(); button.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, {element: button, keys: [button.dataset.action]});
      controller[button.dataset.action] = true; button.classList.add('pressed');
    });
    // Keyboard and assistive-technology activation of an action button.
    button.addEventListener('click', e => {
      if (!e.pointerType && e.isTrusted && e.detail === 0 && active()) {
        controller[button.dataset.action] = true;
        if (button.dataset.action === 'fire') setTimeout(() => { if (controller) controller.fire = false; }, 150);
      }
    });
  });
  function endPointer(e) {
    const entry = pointers.get(e.pointerId);
    if (!entry) return;
    pointers.delete(e.pointerId);
    if (![...pointers.values()].some(p => p.element === entry.element)) {
      entry.element.classList.remove('pressed');
      if (entry.element.dataset.action && controller) controller[entry.element.dataset.action] = false;
    }
    applyDirections();
  }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => ui.addEventListener(type, endPointer));
  ui.addEventListener('contextmenu', e => e.preventDefault());
  $('modern-toolbar').addEventListener('click', e => { if (e.detail || e.pointerType) e.target.blur(); });
  // Keep the game's global key handler from swallowing toolbar/select key presses.
  ['keydown', 'keyup'].forEach(type => ui.addEventListener(type, e => {
    if ((!$('modern-launcher').hidden && $('modern-launcher').contains(e.target)) || ['Tab', 'Enter', ' '].includes(e.key)) e.stopPropagation();
  }));
  window.addEventListener('blur', release);
  window.addEventListener('pagehide', release);
  document.addEventListener('visibilitychange', release);
  window.addEventListener('resize', () => { release(); lastSize = ''; });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { lastSize = ''; });
  function resizeGame(game) {
    const w = Math.round(root.clientWidth), h = Math.round(root.clientHeight);
    const key = [w, h, wide].join(':');
    if (lastSize === key) return;
    lastSize = key;
    root.style.setProperty('--hud-scale', Math.min(w / 1220, .85));
    root.style.setProperty('--flags-scale', Math.min((w - 20) / 480, 1));
    root.style.setProperty('--message-scale', Math.min((w - 24) / 1080, (h - 70) / 575, 1));
    root.style.setProperty('--retro-scale', Math.min(w / 800, (h - 44) / 600, 1));
    const width = wide ? w : originalDimensions.WIDTH;
    const height = wide ? h : originalDimensions.HEIGHT;
    // Keep rendering cost bounded on high-DPI phones. CSS size and camera aspect
    // follow the viewport; glow's original normalized full-screen quad is retained.
    const scale = Math.min(1, 1440 / width, 1080 / height);
    game.dimensions = Object.assign({}, originalDimensions, {
      WIDTH: Math.round(width * scale), HEIGHT: Math.round(height * scale), ASPECT: width / height
    });
    // This old Three.js multiplies setSize() by DPR, but the game passes raw
    // pixel dimensions to setViewport(). Keep both in the same pixel space.
    game.renderer.devicePixelRatio = 1;
    game.renderer.setSize(game.dimensions.WIDTH, game.dimensions.HEIGHT);
    [game.camera, game.shortCamera].forEach(camera => { camera.aspect = width / height; camera.updateProjectionMatrix(); });
    game.renderer.domElement.style.width = width + 'px';
    game.renderer.domElement.style.height = height + 'px';
  }
  function prepareRetro(game) {
    if (!Hover.retro || game.modernRetroPrepared) return;
    game.modernRetroPrepared = true;
    const stop = game.stop;
    game.stop = function () {
      // A win may stop/dispose the world during the physics update, before the
      // final draw. Preserve a complete frame instead of rendering the torn-down
      // scene (sky and black floor). This is local to this derivative's instance.
      if (wide && !game.modernFrozen && game.renderer) {
        game.draw(0);
        const source = game.renderer.domElement;
        const frozen = document.createElement('canvas');
        frozen.className = 'modern-frozen-scene';
        frozen.width = source.width; frozen.height = source.height;
        frozen.getContext('2d').drawImage(source, 0, 0);
        source.after(frozen); game.modernFrozen = frozen;
      }
      return stop.apply(this, arguments);
    };
    const button = game.domElement.querySelector('.msgButton');
    button.setAttribute('role', 'button'); button.tabIndex = 0;
    button.setAttribute('aria-label', t('Fortsetzen'));
    button.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); button.click(); }
    });
  }
  function updateRetroHud(game, shown) {
    const panel = $('modern-retro-hud');
    panel.hidden = !shown;
    if (!shown || !game.craft) return;
    const craft = game.craft, walls = craft.world.tempWalls;
    const values = {
      height: [craft.position.y / 768, craft.getSpringCount()],
      wall: [(walls.length ? walls[walls.length - 1].life : 0) / 10, craft.getWallCount()],
      cloak: [craft.cloakTime * 1.1 / 10, craft.getCloakCount()],
      shield: [craft.protectionTime / 20], boost: [craft.maxSpeedModifierTime / 20]
    };
    for (const [name, [fraction, count]] of Object.entries(values)) {
      const meter = panel.querySelector('[data-meter=' + name + ']');
      meter.querySelector('i').style.setProperty('--fill', Math.max(0, Math.min(1, fraction)) * 100 + '%');
      if (count !== undefined) meter.querySelector('b').textContent = count;
    }
    panel.querySelector('[data-meter=boost] i').style.background = craft.maxSpeedModifier < 1 ? '#ff5555' : '#5cff73';
  }
  function tick() {
    const next = window.Hover && Hover.router && Hover.router.currentView;
    const game = next && next.game;
    if (next !== view) { release(); view = next; }
    if (game !== currentGame) {
      release(); currentGame = game; controller = null; originalDimensions = null; lastSize = '';
    }
    if (window.Hover && Hover.settings) {
      const sound = Hover.settings.getSoundEnabled();
      $('modern-sound').setAttribute('aria-pressed', sound);
      $('modern-sound').setAttribute('aria-label', t(sound ? 'Ton an' : 'Ton aus'));
      $('modern-sound').title = t(sound ? 'Ton an' : 'Ton aus');
      $('modern-sound').textContent = sound ? '♪' : '♪̸';
    }
    const inGame = !!document.getElementById('gameView');
    root.classList.toggle('modern-in-game', inGame);
    $('modern-launcher').hidden = inGame || !document.getElementById('homeView');
    $('modern-menu').hidden = !inGame && (!next || next.id === 'homeView');
    if (game && game.renderer && game.camera && game.shortCamera) {
      if (!originalDimensions) originalDimensions = Object.assign({}, game.dimensions);
      // Reuse the game's independent touch controller, leaving physical keys intact.
      controller = game.craftControllers.find(c => typeof c.dpadStart === 'function');
      resizeGame(game);
      prepareRetro(game);
      if (window.HoverEnhanced) HoverEnhanced.fitRetroFlags(game, wide);
    }
    updateRetroHud(game, inGame && wide && !!Hover.retro && !!game);
    const readout = $('modern-readout');
    readout.hidden = !inGame || !wide || Hover.retro;
    if (!readout.hidden) {
      const value = id => { const el = $(id); return el ? el.textContent : '0'; };
      const text = t('Sprung') + ' ' + value('dash-bounce-number') + ' · ' + t('Wand') + ' ' + value('dash-wall-number') +
        ' · ' + t('Tarnung') + ' ' + value('dash-cloak-number') + ' · ' + t('Schild') + ' ' + value('dash-shields-number-big') +
        ' · Booster ' + value('dash-boost-number-big');
      if (readout.textContent !== text) readout.textContent = text;
    }
    HoverEnhanced.updateInput?.(game,next);
    HoverEnhanced.updateMap?.(game,next);
    const controls = !HoverEnhanced.mapOpen && inGame && !!(next && next.playing) && touch;
    if (!controls && !$('modern-controls').hidden) release();
    $('modern-controls').hidden = !controls;
    requestAnimationFrame(tick);
  }
  sync(); tick();
})();
