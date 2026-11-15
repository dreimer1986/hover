/* Extended edition integration. Preserved release scripts are never rewritten. */
(function () {
  'use strict';
  const de = hoverLocale.lang === 'de', t = (a,b) => de ? a : b;
  const api = window.HoverEnhanced = {levelUnlocked:sessionStorage.getItem('hover-levels')==='1'};
  const $ = id => document.getElementById(id) || (api.controls && api.controls.get(id));
  api.showHome = () => { Hover.router.navigate('',{trigger:false}); if(Hover.router.currentView?.id!=='homeView')Hover.router.home(); };
  async function unlock() {
    api.levelUnlocked = !api.levelUnlocked;
    const enabled=api.levelUnlocked;sessionStorage.setItem('hover-levels',enabled?'1':'0');
    $('enhanced-level-control').hidden = !enabled;
    if(!enabled)$('modern-arena').value='44';
    $('enhanced-unlock-message').textContent = enabled?t('Levelauswahl freigeschaltet!','Level select unlocked!'):t('Levelauswahl gesperrt. Start bei Karte 1.','Level select locked. Start on map 1.');
    if (window.HoverAudio) {
      HoverAudio.unlock();
      Hover.retro = false;
      await new Promise(resolve => Hover.audio.loadSounds(resolve));
      Hover.audio.getSound(enabled?'GAMEOVR':'WINLEVEL').stop();
      HoverAudio.playCue(enabled?'WINLEVEL':'GAMEOVR');
    }
  }
  const home = Hover.views.HomeView.prototype, render = home.render, remove = home.remove;
  home.render = function () {
    render.call(this);
    const content=this.el.querySelector('#homeContent'), title=this.el.querySelector('#homeTitle');
    const hole=document.createElement('button');hole.id='enhanced-unlock';hole.type='button';
    hole.setAttribute('aria-label',t('Geheime Stelle im Hover-Logo','Secret spot in the Hover logo'));
    hole.addEventListener('click',unlock);title.appendChild(hole);
    const buttons=this.el.querySelector('#homeButtons');buttons.replaceChildren();
    for(const id of ['modern-play','enhanced-multiplayer','modern-retro'])buttons.appendChild($(id));
    content.appendChild($('modern-launcher'));
    api.installPreview?.();
    $('modern-launcher').hidden=false;
    $('enhanced-level-control').hidden=!api.levelUnlocked;
    this.el.querySelector('#homeIE').setAttribute('aria-hidden','true');
    $('enhanced-multiplayer').onclick=()=>{
      const panel=$('mp-panel'); panel.hidden=!panel.hidden;
      if(!panel.hidden){panel.open=true;panel.scrollIntoView({block:'nearest'});}
    };
    content.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
    content.addEventListener('keydown', e=>{if(e.target.matches('input,select'))e.stopPropagation();});
    if (new URLSearchParams(location.search).has('room') || window.HoverMultiplayer?.room) {
      const panel=$('mp-panel');if(panel){panel.hidden=false;panel.open=true;}
    }
    api.installHome?.(this.el);
    return this;
  };
  home.remove=function(){
    // Keep reusable controls alive when the archived router removes this view.
    for(const id of ['modern-play','enhanced-multiplayer','modern-retro','modern-launcher']) {
      const el=$(id); if(el&&this.el.contains(el))api.ui.appendChild(el);
    }
    return remove.call(this);
  };
  // Preserve the original secret keyboard entry as an alternative to the button.
  Hover.Router.prototype.retro=function(){api.start(true);};
  const view=Hover.views.GameView.prototype, ready=view.onSoundAndGameReady, dispose=view.remove;
  view.onSoundAndGameReady=function(){
    if(!this.options.gameId&&!this.enhancedFlagsPrepared){
      this.enhancedFlagsPrepared=true;
      const count=Math.max(3,Math.min(6,Number(this.options.flagCount)||3)),world=this.game.world;
      for(const flag of world.flags)flag.remove();world.flags=[];
      for(const team of ['RED','BLUE']) {
        const locations=world.getFlagLocations().filter(f=>f.Team===team).slice();
        for(let i=locations.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[locations[i],locations[j]]=[locations[j],locations[i]];}
        locations.slice(0,count).forEach(f=>world.spawnFlag(f));
      }
    }
    ready.call(this);
  };
  view.onGameWon=function(){
    if(this.options.gameId)return; // The server owns multiplayer round outcomes.
    this.stopGame();
    const next=this.mazeIndex+1, last=next>=this.mazeIds.length;
    let advanced=false;
    const advance=()=>{
      if(advanced||Hover.router.currentView!==this)return;advanced=true;clearTimeout(this.enhancedAdvance);
      if(last)api.showHome();
      else Hover.router.setCurrentView(new Hover.views.GameView(Object.assign({},this.options,{mazeId:this.mazeIds[next]})));
    };
    this.gameMessageView.showMessage(last?this.gameMessageView.messageTypes.GAME_WON:this.gameMessageView.messageTypes.LEVEL_WON,advance);
    if(!last){
      const hint=document.createElement('p');hint.className='enhanced-next';hint.textContent=t('Nächste Karte startet in 4 Sekunden …','Next map starts in 4 seconds …');this.el.appendChild(hint);
      this.enhancedAdvance=setTimeout(advance,4000);
    }
  };
  const lost=view.onGameLost;
  view.onGameLost=function(){
    if(this.options.gameId)return;
    if(!this.options.retro)return lost.call(this);
    this.stopGame();
    this.gameMessageView.showMessage(this.gameMessageView.messageTypes.LEVEL_LOST,()=>Hover.router.setCurrentView(new Hover.views.GameView(Object.assign({},this.options))));
  };
  view.remove=function(){clearTimeout(this.enhancedAdvance);return dispose.call(this);};
  api.fitRetroFlags=function(game,wide){
    if(!Hover.retro||!game.craft?.hud||!game.world.flags.length)return;
    const hud=game.craft.hud,canvas=hud.flagCounts;if(!canvas)return;
    const count=Math.max(...['red','blue'].map(team=>game.world.flags.filter(f=>f.team===team).length));
    if(!hud.enhancedFlagDraw){
      hud.enhancedFlagDraw=true;
      hud.drawFlags=function(color,captured,total){
        const tex=Hover.Editor.schemeLoader.getTexture('flags').image,ctx=canvas.getContext('2d');
        const pos={redfalse:.75,redtrue:0,bluefalse:.5,bluetrue:.25},w=25,h=25;
        for(let i=0;i<total;i++)ctx.drawImage(tex,pos[color+(i<captured)]*tex.width,0,tex.width/4,tex.height,i*w,color==='blue'?0:h,w,h);
      };
    }
    if(canvas.width!==count*25||canvas.height!==50){canvas.width=count*25;canvas.height=50;}
    canvas.style.setProperty('width',count*25+'px','important');canvas.style.setProperty('height','50px','important');
  };
})();
