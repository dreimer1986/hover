/* Original craft assets and a modal radar for the extended edition only. */
(function(){
  'use strict';
  const api=HoverEnhanced,de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;
  const select=api.controls.get('modern-craft'),cache=new Map();
  let preview=null,scene,camera,renderer,previewGeneration=0;
  const crafts={Easy:['Chicago','a','A_YELLOW'],Normal:['Wizard','c','C_YELLOW'],Hard:['Bambi','b','B_RED']};
  function loadCraft(key){
    if(window.HoverCrafts?.entry(key))return HoverCrafts.preview(key);
    if(!cache.has(key))cache.set(key,new Promise((resolve,reject)=>{
      const data=crafts[key];
      new THREE.JSONLoader().load('../../assets/3d/Models/hover_'+data[1]+'.js',geometry=>{
        THREE.ImageUtils.loadTexture('../../assets/3d/Textures/HOVER_'+data[2]+'.jpg',undefined,texture=>{
          const mesh=new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({map:texture,shading:THREE.SmoothShading}));
          geometry.computeBoundingBox();const box=geometry.boundingBox;
          const center=box.min.clone().add(box.max).multiplyScalar(.5);
          mesh.position.copy(center.multiplyScalar(-1));
          const group=new THREE.Object3D();group.add(mesh);group.rotation.y=Math.PI+Math.PI/6;
          resolve({group,radius:box.max.clone().sub(box.min).length()/2});
        },reject);
      });
    }));
    return cache.get(key);
  }
  async function showCraft(){
    const generation=++previewGeneration,key=select.value;
    preview.querySelector('figcaption').textContent=window.HoverCrafts?.entry(key)?.name||crafts[key][0];
    if(!window.HoverCrafts)return;
    await HoverCrafts.ready;if(generation!==previewGeneration)return;
    const custom=HoverCrafts.entry(key),stats=custom?HoverCrafts.stats(custom):HoverCrafts.profileStats(Hover.Profiles[key]);
    const number=value=>new Intl.NumberFormat(de?'de-DE':'en-US',{maximumFractionDigits:1}).format(value);
    preview.querySelector('.craft-stats-caption').textContent=(custom?t('Fahrpunkte: ','Handling points: '):t('Vergleichspunkte (umgerechnet): ','Equivalent handling points: '))+number(stats.reduce((sum,s)=>sum+s.value,0))+' / '+HoverCrafts.pointBudget();
    preview.querySelector('dl').replaceChildren(...stats.flatMap(stat=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=stat.label;dd.textContent=number(stat.value)+' / 10';dd.dataset.parameter=stat.key;return [dt,dd];}));
    try{
      const craft=await loadCraft(key);if(generation!==previewGeneration){if(craft.group.userData.customPreview)HoverCrafts.disposePreview(craft.group);return;}
      for(const child of scene.children.slice())if(child.userData?.previewCraft){scene.remove(child);if(child.userData.customPreview)HoverCrafts.disposePreview(child);}
      craft.group.userData.previewCraft=true;scene.add(craft.group);
      const distance=craft.radius/Math.sin(THREE.Math.degToRad(camera.fov/2))*.75;
      camera.position.set(0,distance*.38,distance);camera.lookAt(new THREE.Vector3());
      renderer.render(scene,camera);preview.dataset.craft=key;
    }catch(e){preview.querySelector('figcaption').textContent=t('Vorschau nicht verfügbar','Preview unavailable');}
  }
  api.installPreview=function(){
    if(preview)return;
    preview=document.createElement('figure');preview.id='craft-preview';
    preview.innerHTML='<figcaption></figcaption><p class="craft-stats-caption"></p><dl></dl>';
    select.parentElement.appendChild(preview);
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setSize(480,270);
    renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',t('Vorschau des gewählten Hovercrafts','Selected hovercraft preview'));
    preview.prepend(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,480/270,.1,10000);
    scene.add(new THREE.AmbientLight(0xaaaaaa));const light=new THREE.PointLight(0xffffff,.9);light.position.set(200,400,600);scene.add(light);
    select.addEventListener('change',showCraft);showCraft();
  };
  const button=document.createElement('button');button.id='modern-map';button.type='button';button.hidden=true;
  button.textContent=t('Karte · M','Map · M');button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','large-map');
  document.getElementById('modern-toolbar').appendChild(button);
  const overlay=document.createElement('section');overlay.id='large-map';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','large-map-title');
  overlay.innerHTML=`<header><h2 id="large-map-title">${t('Karte','Map')}</h2><button type="button" id="large-map-close">${t('Zurück zum Spiel · M / Esc','Back to game · M / Esc')}</button></header><canvas aria-label="${t('Radarübersicht','Radar overview')}"></canvas><p>${t('Gelb: erkundete Wände / Extras · Rot / Blau: Teams und Flaggen. Die Partie läuft weiter.','Yellow: explored walls / items · Red / blue: teams and flags. The game continues.')}</p>`;
  document.body.appendChild(overlay);const canvas=overlay.querySelector('canvas'),close=overlay.querySelector('button');
  let mapGame=null,mapView=null,focusBefore=null,resumeControllers=false;
  api.mapOpen=false;
  function clearInputs(game){
    for(const c of game.craftControllers||[]){for(const key of ['forward','reverse','left','right','jump','placeWall','cloak','fire','hudZoomIn','hudZoomOut'])c[key]=false;c.engine=c.turn=0;}
    window.dispatchEvent(new Event('blur')); // Also release Pointer Events held by the touch UI.
  }
  function setOpen(open){
    if(open===api.mapOpen)return;
    const view=Hover.router.currentView,game=view?.game;
    if(open&&(!view.playing||!game?.craft?.hud))return;
    api.mapOpen=open;overlay.hidden=!open;button.setAttribute('aria-pressed',String(open));
    document.documentElement.classList.toggle('map-open',open);
    if(open){
      mapGame=game;mapView=view;focusBefore=document.activeElement;resumeControllers=game.controllersStarted;
      clearInputs(game);game.stopControllers();
      for(const controller of game.craftControllers){
        if(controller.largeMapWrapped)continue;controller.largeMapWrapped=true;const update=controller.update;
        controller.update=function(dt,passive){if(api.mapOpen&&mapGame===game){if(!passive)this.craft.update(dt,0,0);return false;}return update.apply(this,arguments);};
      }
      close.focus();drawMap();
    }else{
      if(mapGame){clearInputs(mapGame);if(resumeControllers&&view===mapView&&view.playing)mapGame.startControllers();}
      mapGame=mapView=null;if(focusBefore?.isConnected)focusBefore.focus();
    }
  }
  api.toggleMap=()=>setOpen(!api.mapOpen);
  button.onclick=api.toggleMap;close.onclick=()=>setOpen(false);
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{
    if(!api.mapOpen&&e.target.matches?.('input,select,textarea,[contenteditable="true"]'))return;
    if(e.code==='KeyM'||(api.mapOpen&&e.key==='Escape')){
      if(type==='keydown'&&!e.repeat)setOpen(!api.mapOpen);e.preventDefault();e.stopImmediatePropagation();return;
    }
    if(api.mapOpen){
      e.stopImmediatePropagation();
      if(e.key==='Tab'){e.preventDefault();close.focus();}
      else if(!['Enter',' '].includes(e.key))e.preventDefault();
    }
  },true);
  function drawMap(){
    const g=mapGame,c=g.craft,hud=c.hud,w=g.world,rect=canvas.getBoundingClientRect();
    const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,width,height);
    const points=w.radarWalls.flatMap(wall=>wall.wall);
    points.push(c.position,...w.flags.map(f=>f.location));
    let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
    for(const p of points){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);}
    const scale=Math.max(.00001,Math.min((width-40)/Math.max(1,x1-x0),(height-40)/Math.max(1,z1-z0)));
    ctx.save();ctx.translate(width/2,height/2);ctx.scale(scale,scale);ctx.translate(-(x0+x1)/2,-(z0+z1)/2);ctx.lineWidth=1.5/scale;
    hud.drawWalls(ctx,c.radarWalls);hud.drawSpots(ctx,hud.colors.pods,2/scale,w.pods);
    for(const team of ['red','blue'])hud.drawSpots(ctx,team==='red'?'#ff6262':'#62aaff',4/scale,w.flags.filter(f=>!f.captured&&f.team===team));
    hud.drawCraft(ctx,c,Math.max(1,12/(320*scale)));
    for(const drone of w.drones)hud.drawCraft(ctx,drone.craft,Math.max(1,10/(320*scale)));
    ctx.restore();
  }
  api.updateMap=function(game,view){
    button.hidden=!view?.playing||!game?.craft;
    if(api.mapOpen){if(game!==mapGame||!view.playing)setOpen(false);else drawMap();}
  };
})();
