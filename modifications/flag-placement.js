/* Extended editions share flag locations between teams; never overlap flags. */
(function(root){
 function select(locations,count,random=Math.random){
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const unique=[...new Map(locations.map(p=>[[p.X,p.Y,p.Z].join(','),p])).values()],high=shuffle(unique.filter(p=>p.Y>32)),low=shuffle(unique.filter(p=>p.Y<=32)),result=[],counts={RED:0,BLUE:0};let team=random()<.5?'RED':'BLUE';
  function put(p,t){result.push({...p,Team:t});counts[t]++;}
  const elevated=high.splice(0,Math.min(high.length,2*(count-1)));
  for(const p of elevated){put(p,team);team=team==='RED'?'BLUE':'RED';}
  const remaining=shuffle(low.concat(high));for(const p of remaining){const next=counts[team]<count?team:team==='RED'?'BLUE':'RED';if(counts[next]>=count)break;put(p,next);team=next==='RED'?'BLUE':'RED';}
  return result;
 }
 const api={select};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HoverFlagPlacement=api;
})(typeof window==='undefined'?globalThis:window);
