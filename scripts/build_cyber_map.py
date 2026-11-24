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
floor(0,0,size,size)
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
  # Step risers are drawn below hover height, like the stock staircases.
  if orientation==0:wall(x1,z1,x2,z1,y-64,y,step=True)
  elif orientation==1:wall(x1,z2,x2,z2,y-64,y,step=True)
  elif orientation==2:wall(x1,z1,x1,z2,y-64,y,step=True)
  else:wall(x2,z1,x2,z2,y-64,y,step=True)
 stairs.append(orientation)
# Wide upper landings connect the stairs to the cross and ring.
for box in [(12288,14336,15360,16384),(18432,17408,21504,19456),(14336,18432,16384,21504),(17408,12288,19456,15360)]:floor(*box,upper)
# Lower-level blocks establish routes, cover and distinct districts.
for x,z in [(2048,11264),(2048,22528),(28672,11264),(28672,22528),(10240,2048),(22528,2048),(10240,28672),(22528,28672),(10240,24576),(24576,10240)]:block(x,z,x+2048,z+2048,0,1024)
# Upper railings leave all four stair approaches and bridge connections open.
for x in [4096,size-4096]:wall(x,4096,x,size-4096,upper,upper+320)
for z in [4096,size-4096]:wall(4096,z,size-4096,z,upper,upper+320)
red=[point(6144,10240,96),point(6144,12288,96),point(6144,20480,96),point(6144,22528,96)]
blue=[point(27648,z,96) for z in [9216,11264,13312,20480,22528,24576]]
flags=[]
for team,x in [('RED',6144),('BLUE',27648)]:
 for z in [6144,12288,21504,27648]:flags.append(dict(point(x,z,upper+1),Team=team))
 for z in [16384,19456]:flags.append(dict(point(x,z,1),Team=team))
pods=[point(x,z,96) for x,z in [(10240,10240),(23552,23552),(12288,24576),(24576,12288),(6144,16384),(27648,19456)]]+[point(x,z,upper+96) for x,z in [(6144,6144),(27648,6144),(6144,27648),(27648,27648),(16896,16896)]]
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
def image(name):return 'data:image/png;base64,'+base64.b64encode((ROOT/'modifications/maps/assets'/name).read_bytes()).decode()
result={'format':'hover-map','version':1,'name':'Neon Causeway','author':'Hover archive project','description':'33,792 × 33,792 units, 50% longer sides than a 22,528-unit stock arena. Four stair flights connect the ground city to a continuous upper ring and cross-bridges at 1,536 units. / Vier Treppen verbinden die untere Stadt mit Ring und Brücken im zweiten Stock.','assets':{'wall':image('cyber-panel.png'),'floor':image('cyber-panel.png'),'sky':image('city-panorama.png')},'maze':{'Walls':walls,'Floors':floors,'Spawns':[dict(p,Team='RED') for p in red]+[dict(p,Team='BLUE') for p in blue],'Flags':flags,'Pods':pods,'Beacons':beacons}}
out=ROOT/'modifications/maps/Neon-Causeway.hovermap.json';out.write_text(json.dumps(result,separators=(',',':')));print(out,len(walls),'walls',len(floors),'floors',out.stat().st_size,'bytes')

# Keep the bundled multiplayer arena's authoritative object locations in sync.
server_maps=ROOT/'server/maps.json'
maps=json.loads(server_maps.read_text())
maps['48']={key:result['maze'][key] for key in ['Spawns','Flags','Pods']}
server_maps.write_text(json.dumps(maps,indent=2)+'\n')
