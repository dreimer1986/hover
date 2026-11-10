#!/usr/bin/env python3
"""Restore the two original Internet Archive ZIPs and verify their SHA-256."""
import argparse
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=root / 'downloads')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for item in json.loads((root / 'archive/windows/manifest.json').read_text()):
    destination = args.output / item['original_filename']
    if destination.exists():
        if hashlib.sha256(destination.read_bytes()).hexdigest() != item['sha256']:
            raise SystemExit(f'Refusing to overwrite a different file: {destination}')
        print(f'Already verified: {destination}')
        continue
    temporary = destination.with_suffix(destination.suffix + '.partial')
    digest = hashlib.sha256()
    with temporary.open('wb') as output:
        for part in item['parts']:
            data = (root / 'archive/windows' / part['file']).read_bytes()
            if hashlib.sha256(data).hexdigest() != part['sha256']:
                raise SystemExit(f'Corrupt part: {part["file"]}')
            digest.update(data)
            output.write(data)
    if digest.hexdigest() != item['sha256']:
        raise SystemExit(f'ZIP checksum mismatch: {temporary}')
    temporary.rename(destination)
    print(f'Restored and verified: {destination}')
