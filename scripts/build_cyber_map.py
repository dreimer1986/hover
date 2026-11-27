#!/usr/bin/env python3
"""Build the importable, two-storey Neon Causeway map from simple geometry."""
import base64,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
size=33792;upper=1536;walls=[];floors=[]
def point(x,z,y=0):return {'X':x,'Y':y,'Z':z}
def wall(x1,z1,x2,z2,y0=0,y1=768,step=False):walls.append({'A':point(x1,z1,y0),'B':point(x2,z2,y1),'Step':step})
def floor(x1,z1,x2,z2,y=0):floors.append({'Points':[point(x1,z1,y),point(x1,z2,y),point(x2,z2,y),point(x2,z1,y),point(x1,z1,y)]})
def block(x1,z1,x2,z2,y0=0,y1=1024):
 for a,b in [((x1,z1),(x1,z2)),((x1,z2),(x2,z2)),((x2,z2),(x2,z1)),((x2,z1),(x1,z1))]:wall(*a,*b,y0,y1)
 floor(x1,z1,x2,z2,y1)
def prism(points,y0,y1):
 for a,b in zip(points,points[1:]+points[:1]):wall(*a,*b,y0,y1)
 floors.append({'Points':[point(x,z,y1) for x,z in points+[points[0]]]})
def solidwall(x1,z1,x2,z2,y0=0,y1=1152):
 # 256-unit structural thickness, including top and end faces.
 if x1==x2:block(x1-128,min(z1,z2),x1+128,max(z1,z2),y0,y1)
 else:block(min(x1,x2),z1-128,max(x1,x2),z1+128,y0,y1)
# Three recessed courtyards with three walkable 64-unit steps.
pits=[(15360,2048,18432,5120),(15360,28672,18432,31744),(15360,15360,18432,18432)]
rectangles=[(0,0,size,size)]
for px,pz,qx,qz in pits:
 next_rectangles=[]
 for x,z,u,v in rectangles:
  a,b,c,d=max(x,px),max(z,pz),min(u,qx),min(v,qz)
  if a>=c or b>=d:next_rectangles.append((x,z,u,v));continue
  for box in [(x,z,a,v),(c,z,u,v),(a,z,c,b),(a,d,c,v)]:
   if box[0]<box[2] and box[1]<box[3]:next_rectangles.append(box)
 rectangles=next_rectangles
for box in rectangles:floor(*box)
for x,z,u,v in pits:
 for step in range(3):
  inset=step*256;a,b,c,d=x+inset,z+inset,u-inset,v-inset;y=-(step+1)*64
  for start,end in [((a,b),(a,d)),((a,d),(c,d)),((c,d),(c,b)),((c,b),(a,b))]:wall(*start,*end,y,y+64,step=True)
  if step==2:floor(a,b,c,d,y)
  else:
   for box in [(a,b,c,b+256),(a,d-256,c,d),(a,b+256,a+256,d-256),(c-256,b+256,c,d-256)]:floor(*box,y)
for a,b in [((0,0),(0,size)),((0,size),(size,size)),((size,size),(size,0)),((size,0),(0,0))]:wall(*a,*b,0,2560)
# A continuous upper ring with two cross-city bridges, not dead-end ledges.
floor(4096,4096,size-4096,8192,upper);floor(4096,size-8192,size-4096,size-4096,upper)
floor(4096,8192,8192,size-8192,upper);floor(size-8192,8192,size-4096,size-8192,upper)
floor(8192,15360,size-8192,18432,upper)
floor(15360,8192,18432,15360,upper);floor(15360,18432,18432,size-8192,upper)
# Four 24-step flights: 64-unit rises are below the craft's 96-unit hover clearance.
stairs=[]
for orientation in range(4):
 for i in range(24):
  low=8192+i*256;high=low+256;y=(i+1)*64
  if orientation==0:box=(12288,low,14336,high)
  elif orientation==1:box=(19456,size-high,21504,size-low)
  elif orientation==2:box=(low,19456,high,21504)
  else:box=(size-high,12288,size-low,14336)
  floor(*box,y)
  x1,z1,x2,z2=box
  bottom=0 if i<8 else 512
  if y>bottom:
   if orientation in [0,1]:
    wall(x1,z1,x1,z2,bottom,y);wall(x2,z1,x2,z2,bottom,y)
   else:
    wall(x1,z1,x2,z1,bottom,y);wall(x1,z2,x2,z2,bottom,y)
  if i==23:
   if orientation==0:wall(x1,z2,x2,z2,512,y)
   elif orientation==1:wall(x1,z1,x2,z1,512,y)
   elif orientation==2:wall(x2,z1,x2,z2,512,y)
   else:wall(x1,z1,x1,z2,512,y)
  if i>=8:floor(*box,512)
  # Step risers are drawn below hover height, like the stock staircases.
  if orientation==0:wall(x1,z1,x2,z1,y-64,y,step=True)
  elif orientation==1:wall(x1,z2,x2,z2,y-64,y,step=True)
  elif orientation==2:wall(x1,z1,x1,z2,y-64,y,step=True)
  else:wall(x2,z1,x2,z2,y-64,y,step=True)
 stairs.append(orientation)
# Wide upper landings connect the stairs to the cross and ring.
for box in [(12288,14336,15360,16384),(18432,17408,21504,19456),(14336,18432,16384,21504),(17408,12288,19456,15360)]:floor(*box,upper)
# Nine ground-floor districts. Doorways are offset and stair approaches stay clear.
ground_doors=[]
def partition(axis,at,gaps):
 gaps=sorted(gaps);merged=[]
 for lo,hi in gaps:
  if merged and lo<=merged[-1][1]:merged[-1]=(merged[-1][0],max(hi,merged[-1][1]))
  else:merged.append((lo,hi))
 cursor=0
 for lo,hi in merged+[(size,size)]:
  if lo>cursor:
   if axis=='x':solidwall(at,cursor,at,lo,0,1152)
   else:solidwall(cursor,at,lo,at,0,1152)
  if hi>lo:
   middle=(lo+hi)/2
   for delta in [-512,512]:ground_doors.append((at+delta,middle) if axis=='x' else (middle,at+delta))
  cursor=hi
partition('x',10240,[(5120,6912),(15616,17408),(26368,28160),(19072,21888)])
partition('x',23552,[(6656,8448),(18176,19968),(28416,30208),(11904,14720)])
partition('z',10240,[(5120,6912),(15872,17920),(26624,28416),(11904,14720)])
partition('z',23552,[(7168,8960),(11776,13568),(28672,30464),(19072,21888)])
# L-shaped cover in the corner districts breaks diagonal end-to-end views.
for x,z,dx,dz in [(3072,3072,4096,3072),(3072,30720,4096,-3072),(30720,3072,-4096,3072),(30720,30720,-4096,-3072)]:
 solidwall(x,z,x+dx,z,0,1152);solidwall(x,z,x,z+dz,0,1152)
# Alternating upper-floor partitions create connected rooms and winding corridors.
upper_doors=[]
for i,x in enumerate([10240,12544,14848,17664,20480,22528,24576,28160]):
 for z0 in [4096,25600]:
  if i%2==0:solidwall(x,z0,x,z0+2304,upper,upper+1024);door=z0+3200
  else:solidwall(x,z0+1792,x,z0+4096,upper,upper+1024);door=z0+896
  upper_doors.extend([(x-512,door),(x+512,door)])
for i,z in enumerate([10240,12544,14848,17664,20480,22528,24576,28160]):
 for x0 in [4096,25600]:
  if i%2==0:solidwall(x0,z,x0+2304,z,upper,upper+1024);door=x0+3200
  else:solidwall(x0+1792,z,x0+4096,z,upper,upper+1024);door=x0+896
  upper_doors.extend([(door,z-512),(door,z+512)])
for x,z0,z1,door in [(11264,15360,17152,17792),(22016,16640,18432,16000)]:
 solidwall(x,z0,x,z1,upper,upper+1024);upper_doors.extend([(x-512,door),(x+512,door)])
for z,x0,x1,door in [(11264,15360,17152,17792),(22016,16640,18432,16000)]:
 solidwall(x0,z,x1,z,upper,upper+1024);upper_doors.extend([(door,z-512),(door,z+512)])
# Upper railings leave all four stair approaches and bridge connections open.
for x in [4096,size-4096]:block(x-64,4096,x+64,size-4096,upper,upper+320)
for z in [4096,size-4096]:block(4096,z-64,size-4096,z+64,upper,upper+320)
red=[point(6144,10240,96),point(6144,12288,96),point(6144,20480,96),point(6144,22528,96)]
blue=[point(27648,z,96) for z in [9216,11264,13312,20480,22528,24576]]
flags=[]
for team,x in [('RED',6144),('BLUE',27648)]:
 for z in [6144,12288,21504,27648]:flags.append(dict(point(x,z,upper+1),Team=team))
 for z in [16384,19456]:flags.append(dict(point(x,z,1),Team=team))
pods=[point(x,z,96) for x,z in [(8192,5120),(5120,8704),(8192,26624),(26624,8192),(28672,17408),(18432,26624),(12288,17408),(21504,16384)]]+[point(x,z,upper+96) for x,z in [(8704,7168),(23040,7168),(8704,26624),(23040,27648),(7168,18432),(26624,17408),(16896,13312),(19456,16896)]]
beacons=[point(x,z) for x,z in [(6144,9216),(6144,16384),(6144,24576),(11264,6144),(22528,6144),(27648,9216),(27648,16384),(27648,24576),(11264,27648),(22528,27648),(13312,7680),(20480,26112),(7680,20480),(26112,13312)]]
# Upper-floor waypoints are retained for a future multi-storey navigation extension.
beacons += [point(x,z,upper) for x,z in [(6144,6144),(27648,6144),(6144,27648),(27648,27648),(6144,16896),(27648,16896),(16896,6144),(16896,27648),(16896,16896)]]
for x,z in [(13312,7936),(20480,25856),(7936,20480),(25856,13312)]:beacons.append(point(x,z))
# Nodes along each stair and around upper bridge junctions make height-aware routes explicit.
for orientation in range(4):
 for step in [0,3,6,9,12,15,18,21,23]:
  v=8192+step*256+128
  x,z=[(13312,v),(20480,size-v),(v,20480),(size-v,13312)][orientation]
  beacons.append(point(x,z,(step+1)*64))
for x,z in [(13312,14848),(20480,18944),(14848,20480),(18944,13312),(13312,16896),(20480,16896),(16896,20480),(16896,13312),(16896,9216),(16896,24576),(9216,16896),(24576,16896)]:beacons.append(point(x,z,upper))
# Additional navigation points cover doorways, rooms and stepped recesses.
beacons += [point(x,z) for x,z in ground_doors]
beacons += [point(x,z,upper) for x,z in upper_doors]
beacons += [point(x,z) for x,z in [(6144,8192),(6144,24576),(8192,16896),(16896,9216),(16896,24576),(24576,16896),(27648,8192),(27648,24576),(2048,8192),(2048,24576),(31744,8192),(31744,24576)]]
for x,z,u,v in pits:
 for step in range(3):
  inset=step*256+128;y=-(step+1)*64
  for px,pz in [((x+u)/2,z+inset),((x+u)/2,v-inset),(x+inset,(z+v)/2),(u-inset,(z+v)/2)]:beacons.append(point(px,pz,y))
# Solid chamfered service buildings narrow the large districts into streets.
# Positions avoid the established stair entrances, courtyard steps and flag/item pads.
buildings=[(1536,11264,3584,14336),(1536,18432,3584,22016),
 (30208,11264,32256,14848),(30208,19456,32256,22528),
 (7680,11264,9216,14336),(7680,17408,9216,18432),
 (24576,9216,26112,11776),(24576,20480,26112,23040),
 (11264,1536,14080,3584),(19456,1536,22528,3584),
 (11264,30208,14080,32256),(19456,30208,22528,32256),
 (11264,5120,13824,6400),(19456,5120,22528,6400),
 (11264,27392,13824,28672),(19456,27392,22528,28672),
 (15360,11264,17664,13824),(16128,19968,18432,22528)]
for x,z,u,v in buildings:
 bevel=384
 prism([(x+bevel,z),(u-bevel,z),(u,z+bevel),(u,v-bevel),
        (u-bevel,v),(x+bevel,v),(x,v-bevel),(x,z+bevel)],0,1152)
 for px,pz in [(x-512,z-512),(u+512,z-512),(u+512,v+512),(x-512,v+512)]:
  beacons.append(point(px,pz))
# Extra pickups reward the new side streets, separated from both teams' flags.
pods += [point(x,z,96) for x,z in [(4608,13824),(29184,22016),(13824,4096),(19968,29696)]]
# Remove old ground points inside recesses; add their actual supporting height.
for p in beacons:
 if p['Y']==0:
  for x,z,u,v in pits:
   if x<=p['X']<=u and z<=p['Z']<=v:
    inset=min(p['X']-x,u-p['X'],p['Z']-z,v-p['Z']);p['Y']=-64*min(3,int(inset//256)+1)
beacons=list({(p['X'],p['Y'],p['Z']):p for p in beacons}.values())
assert all(((p['X']-f['X'])**2+(p['Y']-f['Y'])**2+(p['Z']-f['Z'])**2)**.5>=1024 for p in pods for f in flags)
def image(name):return 'data:image/png;base64,'+base64.b64encode((ROOT/'modifications/maps/assets'/name).read_bytes()).decode()
result={'format':'hover-map','version':1,'name':'Neon Causeway','author':'Hover archive project','description':'33,792 × 33,792 units, 50% longer sides than a 22,528-unit stock arena. Solid service buildings and winding streets, thick partitions, four solid staircases with underpasses, three recessed courtyards. / Massive Gebäude, verwinkelte Straßen, dicke Trennwände, vier massive Treppen mit Unterführungen und drei abgesenkte Höfe.','assets':{'wall':image('cyber-panel.png'),'floor':image('cyber-panel.png'),'sky':image('city-panorama.png')},'maze':{'Walls':walls,'Floors':floors,'Spawns':[dict(p,Team='RED') for p in red]+[dict(p,Team='BLUE') for p in blue],'Flags':flags,'Pods':pods,'Beacons':beacons}}
out=ROOT/'modifications/maps/Neon-Causeway.hovermap.json';out.write_text(json.dumps(result,separators=(',',':')));print(out,len(walls),'walls',len(floors),'floors',out.stat().st_size,'bytes')

# Keep the bundled multiplayer arena's authoritative object locations in sync.
server_maps=ROOT/'server/maps.json'
maps=json.loads(server_maps.read_text())
maps['48']={key:result['maze'][key] for key in ['Spawns','Flags','Pods']}
server_maps.write_text(json.dumps(maps,indent=2)+'\n')
