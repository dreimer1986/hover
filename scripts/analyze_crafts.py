"""Record original model dimensions and the derivation of custom-craft constraints."""
import json
import math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
policy=json.loads((root/'modifications/craft-policy.json').read_text())
profiles={
 'Chicago':dict(maxSpeed=3276800/65535,acceleration=90112/65535,turnSpeed=393216*math.pi/16777215,drag=3275,turnDrag=13107),
 'Wizard':dict(maxSpeed=4259840/65535,acceleration=196608/65535,turnSpeed=458752*math.pi/16777215,drag=654,turnDrag=19660),
 'Bambi':dict(maxSpeed=4915200/65535,acceleration=327680/65535,turnSpeed=983040*math.pi/16777215,drag=64,turnDrag=26214)}
report=[]
for name,letter in zip(profiles,'acb'):
 p=root/f'web/assets/3d/Models/hover_{letter}.js';m=json.loads(p.read_text());v=m['vertices'];points={k:10*(profiles[name][k]-lo)/(hi-lo) for k,(lo,hi) in policy['parameters'].items()}
 report.append({'name':name,'model':str(p.relative_to(root)),'vertices':len(v)//3,'source_faces':m['metadata']['faces'],'dimensions':[max(v[i::3])-min(v[i::3]) for i in range(3)],'profile':profiles[name],'normalized_points':points,'total_points':sum(points.values())})
assert math.ceil(max(r['total_points'] for r in report))==policy['budget']
assert [math.ceil(max(r['dimensions'][i] for r in report)) for i in range(3)]==policy['bounds']
(root/'verification/craft-policy-analysis.json').write_text(json.dumps({'originals':report,'policy':policy,'note':'Physics ranges/budget and size bounds derive from originals. Mesh complexity limits are conservative extension limits, not engine maxima. Original profiles remain unchanged.'},indent=2)+'\n')
print('Verified original bounds and 40-point budget')
