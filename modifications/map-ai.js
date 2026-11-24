/* Height-aware routing throughout the extended edition; archived releases are untouched. */
(function(){
 'use strict';
 function install(world){
  const graph=world.beaconGraph,imported=world.map.MazeId===48||world.map.MazeId>=10000,margin=imported?260:196,nodes=[],seen=new Set();
  function add(x,y,z){const p=new THREE.Vector3(x,y+97,z),floor=world.getGroundHeightBelowPoint(p);if(floor<=-1000||Math.abs(floor-y)>64)return;p.y=floor+96;const key=[p.x,p.y,p.z].map(Math.round).join(',');if(!seen.has(key)){seen.add(key);nodes.push(p);}}
  for(const p of world.map.Beacons)add(p.X,p.Y,p.Z);
  if(!imported)for(const floor of world.map.Floors){const points=floor.Points.slice(0,-1),y=points[0].Y;if(y<10)continue;const x=points.reduce((s,p)=>s+p.X,0)/points.length,z=points.reduce((s,p)=>s+p.Z,0)/points.length;add(x,y,z);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],mx=(a.X+b.X)/2,mz=(a.Z+b.Z)/2,d=Math.hypot(x-mx,z-mz),f=Math.min(1,180/(d||1));add(mx+(x-mx)*f,y,mz+(z-mz)*f);add(mx-(x-mx)*f,y,mz-(z-mz)*f);}}
  for(const flag of world.map.Flags)add(flag.X,flag.Y,flag.Z);
  function walk(a,b){
   const distance=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(distance/96));if(steps>750)return false;
   let height=world.getGroundHeightBelowPoint(a),last=a.clone();if(Math.abs(a.y-height-96)>100)return false;
   const nx=distance?(b.z-a.z)/distance*margin:0,nz=distance?-(b.x-a.x)/distance*margin:0;
   for(let i=1;i<=steps;i++){
    const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps,p=new THREE.Vector3(x,height+96,z),floor=world.getGroundHeightBelowPoint(p);
    if(floor<height-96||floor>height+64||floor<=-1000)return false;if(imported&&floor!==height&&Math.min(Math.abs(b.x-a.x),Math.abs(b.z-a.z))>distance*.05)return false;
    p.y=floor+96;
    for(const sign of [-1,0,1]){const edge=new THREE.Vector3(x+nx*sign,p.y,z+nz*sign),support=world.getGroundHeightBelowPoint(edge);if(Math.abs(support-floor)>64||world.getCollisionXYZ(last.x+nx*sign,last.y,last.z+nz*sign,edge.x,edge.y,edge.z))return false;}
    height=floor;last=p;
   }
   return Math.abs(b.y-(height+96))<=100;
  }
  const edges=nodes.map(()=>[]);
  for(let i=0;i<nodes.length;i++){
   const nearest=nodes.map((p,j)=>({j,d:p.distanceTo(nodes[i])})).filter(p=>p.j!==i&&p.d<=12000).sort((a,b)=>a.d-b.d).slice(0,imported?24:48);
   for(const {j,d} of nearest)if(walk(nodes[i],nodes[j]))edges[i].push({j,d});
  }
  function route(start,goal){
   if(walk(start,goal))return [goal.clone()];
   const distance=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),pending=new Set();
   nodes.map((p,i)=>({i,d:p.distanceTo(start)})).sort((a,b)=>a.d-b.d).slice(0,imported?16:32).forEach(({i,d})=>{if(walk(start,nodes[i])){distance[i]=d;pending.add(i);}});
   const ends=new Set(nodes.map((p,i)=>({i,d:p.distanceTo(goal)})).sort((a,b)=>a.d-b.d).slice(0,imported?16:32).filter(({i})=>walk(nodes[i],goal)).map(({i})=>i));
   let found=-1;
   while(pending.size){let at=-1;for(const i of pending)if(at<0||distance[i]<distance[at])at=i;pending.delete(at);if(ends.has(at)){found=at;break;}for(const {j,d} of edges[at])if(distance[at]+d<distance[j]){distance[j]=distance[at]+d;previous[j]=at;pending.add(j);}}
   if(found<0)return null;const path=[goal.clone()];for(let i=found;i>=0;i=previous[i])path.unshift(nodes[i].clone());return path;
  }
  function jumpRoute(start,goal){
   const direct=route(start,goal);if(direct)return direct;
   for(const floor of world.map.Floors){
    const points=floor.Points.slice(0,-1),height=points[0].Y;if(Math.abs(height+96-goal.y)>2)continue;
    const cx=points.reduce((sum,p)=>sum+p.X,0)/points.length,cz=points.reduce((sum,p)=>sum+p.Z,0)/points.length;
    for(let i=0;i<points.length;i++){
     const a=points[i],b=points[(i+1)%points.length],mx=(a.X+b.X)/2,mz=(a.Z+b.Z)/2,length=Math.hypot(cx-mx,cz-mz);if(length<350)continue;
     const nx=(cx-mx)/length,nz=(cz-mz)/length,launch=new THREE.Vector3(mx-nx*320,height+96,mz-nz*320),landing=new THREE.Vector3(mx+nx*320,height+96,mz+nz*320);
     launch.y=world.getGroundHeightBelowPoint(launch)+96;const rise=landing.y-launch.y;if(rise<65||rise>384||!walk(landing,goal))continue;
     let clear=true,last=launch.clone();for(let n=1;n<=24;n++){const fraction=n/24,time=640*fraction/300,point=new THREE.Vector3(launch.x+(landing.x-launch.x)*fraction,launch.y+800*time-320*time*time,launch.z+(landing.z-launch.z)*fraction);if(world.getCollision(last,point)){clear=false;break;}last=point;}if(!clear)continue;
     const approach=route(start,launch);if(!approach)continue;approach.at(-1).jumpTo=landing;return [...approach,landing,goal.clone()];
    }
   }
   return null;
  }
  // The legacy constructor asks for a patrol path before flags have spawned.
  graph.beacons=nodes;graph.getUniquePath=position=>{for(const goal of nodes){const path=route(position,goal);if(path?.length)return [position.clone(),...path,position.clone()];}return [position.clone(),position.clone()];};
  world.customNavigation={walk,route,jumpRoute,nodes,edges};
 }
 function drive(world){
  for(const drone of world.drones){const craft=drone.craft,chaser=!!drone.target;let target=null,path=[],index=0,replan=0,last=craft.position.clone(),stuck=0;
   drone.update=function(dt){
    const nav=world.customNavigation;replan-=dt;
    if(!target||target.captured||(target.pod&&!world.pods.includes(target.pod))||replan<=0){
     const flags=chaser?(drone.target.isVisible()?[{location:drone.target.position}]:[]):world.flags.filter(f=>f.team!==craft.team&&!f.captured).sort((a,b)=>a.location.distanceTo(craft.position)-b.location.distanceTo(craft.position));
     let next=null;
     for(const flag of flags){const goal=flag.location.clone(),probe=goal.clone();probe.y=(flag.initialArgs?.location?.Y??goal.y)+2;goal.y=world.getGroundHeightBelowPoint(probe)+96;const candidate=craft.springCount>0?nav.jumpRoute(craft.position,goal):nav.route(craft.position,goal);if(candidate){target=flag;next=candidate;break;}}
     if(!next&&!chaser&&craft.springCount===0)for(const pod of world.pods.filter(p=>p.sound==='OBT_JUMP').sort((a,b)=>a.location.distanceTo(craft.position)-b.location.distanceTo(craft.position))){const goal=pod.location.clone();goal.y=world.getGroundHeightBelowPoint(goal.clone().add(new THREE.Vector3(0,2,0)))+96;const candidate=nav.route(craft.position,goal);if(candidate){target={pod,location:pod.location};next=candidate;break;}}
     path=next||[];index=0;replan=next?(chaser?2:Infinity):5;
    }
    while(index<path.length-1&&!path[index].jumpTo&&craft.position.distanceTo(path[index])<((world.map.MazeId===48||world.map.MazeId>=10000)?300:120))index++;
    let waypoint=path[index];if(!waypoint){craft.update(dt,0,0);return;}
    if(target?.pod&&craft.position.distanceTo(target.pod.location)<128){const pod=target.pod;if(world.pods.includes(pod)){craft.addSpring();pod.afterHit.call(pod);pod.remove();world.pods.splice(world.pods.indexOf(pod),1);}target=null;replan=0;craft.update(dt,0,0);return;}
    if(waypoint.jumpTo&&craft.position.distanceTo(waypoint)<160){const landing=waypoint.jumpTo,angle=Math.atan2(-(landing.x-craft.position.x),-(landing.z-craft.position.z)),delta=Math.atan2(Math.sin(angle-craft.angle),Math.cos(angle-craft.angle));if(Math.abs(delta)<.12&&craft.onGround&&craft.springCount>0){craft.jump();index++;waypoint=path[index];}else{craft.update(dt,Math.max(-1,Math.min(1,-(delta-craft.turnRate*5)*2)),0);return;}}
    const dx=waypoint.x-craft.position.x,dz=waypoint.z-craft.position.z,distance=Math.hypot(dx,dz),desired=Math.atan2(-(dx-craft.velocity.x*.35),-(dz-craft.velocity.z*.35));let delta=desired-craft.angle;delta=Math.atan2(Math.sin(delta),Math.cos(delta));
    // Anticipate existing rotational inertia; use normal physics, never teleport.
    const error=delta-craft.turnRate*5,turn=Math.max(-1,Math.min(1,-error*2)),speed=Math.hypot(craft.velocity.x,craft.velocity.z);
    const targetSpeed=Math.abs(delta)>.7?80:Math.min(300,Math.max(60,distance*.5));
    const throttle=Math.abs(delta)>1.1?0:speed<targetSpeed?.4:0;drone.navigationState={target:target?.location,path,index,delta,speed,targetSpeed,turn};
    craft.update(dt,turn,throttle);
    if(craft.position.distanceTo(last)<dt*5)stuck+=dt;else stuck=0;last.copy(craft.position);
    if(stuck>3){replan=0;stuck=0;}
   };
  }
 }
 window.HoverMapAI={install,drive};
})();
