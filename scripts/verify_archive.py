#!/usr/bin/env python3
"""Check original ZIP parts, original Wayback files, and restored asset provenance."""
import base64
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]
errors = []
checks = 0
for package in json.loads((root / 'archive/windows/manifest.json').read_text()):
    sha256, sha1 = hashlib.sha256(), hashlib.sha1()
    for part in package['parts']:
        data = (root / 'archive/windows' / part['file']).read_bytes()
        checks += 1
        if hashlib.sha256(data).hexdigest() != part['sha256']:
            errors.append(part['file'])
        sha256.update(data)
        sha1.update(data)
    checks += 2
    if sha256.hexdigest() != package['sha256'] or sha1.hexdigest() != package['archive_sha1']:
        errors.append(package['original_filename'])
rows = []
for name in ['cdn-index', 'azure-index', 'root-captures', 'root-distinct.json']:
    rows.extend(json.loads((root / 'archive/metadata' / name).read_text())[1:])
for version in (root / 'archive/web').iterdir():
    for file in version.rglob('*'):
        if not file.is_file():
            continue
        relative = str(file.relative_to(version))
        candidates = [r[5] for r in rows if urlsplit(r[2]).path.lstrip('/') == ('' if relative == 'index.html' else relative)]
        digest = base64.b32encode(hashlib.sha1(file.read_bytes()).digest()).decode().rstrip('=')
        checks += 1
        if digest not in candidates:
            errors.append(str(file.relative_to(root)))
for filename in ['assets.json', 'additional-assets.json', 'texture-restoration.json', 'local-restoration.json']:
    for entry in json.loads((root / 'archive/metadata' / filename).read_text()):
        if 'sha256' not in entry:
            continue
        file = root / 'web/assets' / entry['path']
        checks += 1
        if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != entry['sha256']:
            errors.append(str(file.relative_to(root)))
if errors:
    raise SystemExit('Checksum failures:\n' + '\n'.join(sorted(set(errors))))
print(f'{checks} integrity checks passed.')
