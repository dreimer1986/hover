/* Optional chase camera; craft physics retain their original position reference. */
(function(){
 const de=hoverLocale.lang==='de',t=(a,b)=>de?a:b;let enabled=false;
 const button=document.createElement('button');button.id='modern-camera';button.type='button';button.textContent=t('Außenansicht','Chase view');button.setAttribute('aria-pressed','false');button.hidden=true;document.getElementById('modern-toolbar').appendChild(button);
 button.onclick=()=>{enabled=!enabled;button.setAttribute('aria-pressed',String(enabled));};
 const ready=Hover.views.GameView.prototype.onGameReady;
 Hover.views.GameView.prototype.onGameReady=function(){
  const result=ready.call(this),g=this.game,model=Hover.Editor.schemeLoader.models[g.craftProfile.modelName];
  if(!model?.geometry)return result;
  const material=new THREE.MeshLambertMaterial({map:model.redDiffuseTexture||model.diffuseTexture,transparent:true,alphaTest:.1}),mesh=new THREE.Mesh(model.geometry,material);g.scene.add(mesh);g.chaseMesh=mesh;mesh.visible=false;
  const draw=g.draw;
  g.draw=function(dt){
   g.chaseCameraEnabled=enabled;mesh.visible=enabled&&g.craft.cloakTime<=0;
   if(!enabled)return draw.call(this,dt);
   const craft=g.craft,pos=craft.position,front=g.camera.position,short=g.shortCamera.position,rx=g.camera.rotation.x,sx=g.shortCamera.rotation.x,light=g.spotLight.position,order=g.camera.rotation.order,shortOrder=g.shortCamera.rotation.order;
   let distance=430,camera=null;
   // Never push the camera inside the craft when a wall is immediately behind it.
   for(;distance>=240;distance-=40){const candidate=new THREE.Vector3(pos.x+Math.sin(craft.angle)*distance,pos.y+distance*.3,pos.z+Math.cos(craft.angle)*distance);if(!g.world.getCollisionXYZ(pos.x,pos.y,pos.z,candidate.x,candidate.y,candidate.z)){camera=candidate;break;}}
   if(!camera){mesh.visible=false;return draw.call(this,dt);}
   g.camera.position=camera;g.shortCamera.position=camera;g.spotLight.position=camera.clone();g.camera.rotation.order=g.shortCamera.rotation.order='YXZ';g.camera.rotation.x=g.shortCamera.rotation.x=-.18;
   mesh.position.copy(pos);mesh.position.y-=60;mesh.rotation.y=craft.angle;
   material.map=craft.team==='blue'?(model.blueDiffuseTexture||model.diffuseTexture):model.redDiffuseTexture||model.diffuseTexture;
   try{return draw.call(this,dt);}finally{g.spotLight.position=light;g.camera.position=front;g.shortCamera.position=short;g.camera.rotation.x=rx;g.shortCamera.rotation.x=sx;g.camera.rotation.order=order;g.shortCamera.rotation.order=shortOrder;}
  };
  return result;
 };
 const update=HoverEnhanced.updateMap;
 HoverEnhanced.updateMap=function(game,view){update?.(game,view);button.hidden=!view?.playing||!game?.chaseMesh;};
})();
