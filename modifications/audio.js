/* Optional edition only: one gesture-unlocked Web Audio context for every sound.
   The archived scripts and audio files remain unchanged. */
(function () {
  'use strict';
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext || !window.Hover || !Hover.audio) return;
  const player = Hover.audio;
  const buffers = new Map(), banks = new Map(), allSounds = new Set();
  const errors = [];
  let context, master, analyser;
  const api = window.HoverAudio = {errors, unlock, get context() { return context; }, get analyser() { return analyser; }};
  function ensureContext() {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      analyser = context.createAnalyser(); analyser.fftSize = 256;
      master.connect(analyser); analyser.connect(context.destination);
      master.gain.value = player.volume;
    }
    return context;
  }
  function unlock() {
    const ctx = ensureContext();
    if (!document.hidden && ctx.state !== 'running') {
      // Called synchronously from trusted pointer/key/click handlers, including
      // after iOS interrupts audio while the page is in the background.
      return ctx.resume().catch(() => { /* A later user gesture can retry. */ });
    }
    return Promise.resolve();
  }
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(type => {
    document.addEventListener(type, e => { if (e.isTrusted) unlock(); }, {capture:true, passive:true});
  });
  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    if (document.hidden) context.suspend().catch(() => {});
    else unlock();
  });
  let volume = player.volume;
  Object.defineProperty(player, 'volume', {
    get() { return volume; },
    set(value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); if (master) master.gain.value = volume; }
  });
  function decode(url) {
    if (!buffers.has(url)) buffers.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error(response.status + ' ' + url);
      return response.arrayBuffer();
    }).then(data => ensureContext().decodeAudioData(data)));
    return buffers.get(url);
  }
  class Sound {
    constructor(name, urls) {
      this.name = name; this.urls = urls; this.file = urls[0] || '';
      this.loop = name.startsWith('ENG_') || name === 'MUSIC';
      this.loopStart = name.startsWith('ENG_') ? .174 : 0;
      this.playing = false; this.loaded = !this.file; this.buffer = null; this.source = null;
      allSounds.add(this);
    }
    async load() {
      for (const url of this.urls) {
        try {
          this.buffer = await decode(url); this.file = url;
          // Prepared PCM loops already contain a blended wrap. Starting at zero
          // avoids the old AAC skip offset and repeats without a per-cycle fade.
          if (url.endsWith('.pcm-v1.wav')) this.loopStart = 0;
          this.loaded = true; return;
        }
        catch (_) { /* Try the archived alternate format before reporting failure. */ }
      }
      this.loaded = true;
      errors.push({name:this.name, urls:this.urls});
      window.dispatchEvent(new CustomEvent('hover-audio-error'));
    }
    play(menuCue = false) {
      // The original game has delayed music timers. A timer from a departed
      // game must not start music on the launch screen or in the next game.
      const view = Hover.router && Hover.router.currentView;
      if (!player.enabled || !this.buffer || document.hidden || !view || (!view.game && !menuCue) || this.playing) return;
      if (player.sounds[this.name] !== this) return;
      const ctx = ensureContext(), source = ctx.createBufferSource(), gain = ctx.createGain();
      source.buffer = this.buffer; source.loop = this.loop;
      source.loopStart = Math.min(this.loopStart, this.buffer.duration / 2);
      source.loopEnd = this.buffer.duration;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + .008);
      source.connect(gain); gain.connect(master);
      this.source = source; this.gain = gain; this.playing = true;
      source.onended = () => {
        source.disconnect(); gain.disconnect();
        if (this.source === source) { this.source = null; this.playing = false; }
      };
      source.start(0, this.loop ? source.loopStart : 0);
    }
    stop() {
      if (this.source) {
        this.source.onended = null;
        this.source.stop(); this.source.disconnect(); this.gain.disconnect(); this.source = null;
      }
      this.playing = false;
    }
    setLoop(enabled, offset) { this.loop = enabled; this.loopStart = offset || 0; }
    setBasicLoop(enabled) { this.loop = enabled; }
    fadeIn() { this.play(); }
    isLoaded() { return this.loaded; }
  }
  api.playCue = name => { if (['WINLEVEL','GAMEOVR'].includes(name)) player.getSound(name).play(true); };
  player.stopAll();
  player.modernSounds = null; player.retroSounds = null; player.sounds = {};
  player.nonsound = new Sound('', []);
  player.stopAll = () => allSounds.forEach(sound => sound.stop());
  player.loadSounds = function (completed) {
    const retro = !!Hover.retro, key = retro ? 'retro' : 'modern';
    const property = retro ? 'retroSounds' : 'modernSounds';
    if (!banks.has(key)) {
      const files = retro ? Hover.retroSoundFiles : Hover.modernSoundFiles;
      const names = new Set([...Object.keys(files.m4a), ...Object.keys(files.ogg)]);
      // Modern's original manifest has no engine sounds. Reuse the preserved
      // retro engines for this optional edition; provenance is documented.
      ['ENG_IDLE','ENG_NORM','ENG_LOW','ENG_HIGH'].forEach(name => names.add(name));
      const sounds = {};
      for (const name of names) {
        const source = name.startsWith('ENG_') && !files.m4a[name] && !files.ogg[name] ? Hover.retroSoundFiles : files;
        const urls = [source.m4a[name], source.ogg[name]].filter(Boolean).map(file => Hover.cdn.getSoundUrl(file));
        if (name.startsWith('ENG_')) urls.unshift('engine-loops/' + name + '.pcm-v1.wav');
        sounds[name] = new Sound(name, [...new Set(urls)]);
      }
      const bank = {sounds, ready:null};
      banks.set(key, bank); this[property] = this.sounds = sounds;
      let loaded = 0;
      bank.ready = Promise.all(Object.values(sounds).map(sound => sound.load().then(() => {
        Hover.events.trigger('soundLoadProgress', ++loaded, names.size);
      })));
    }
    const bank = banks.get(key);
    this[property] = this.sounds = bank.sounds;
    bank.ready.then(() => { if (typeof completed === 'function') completed(); });
  };
})();
