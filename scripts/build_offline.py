#!/usr/bin/env python3
"""Build a playable offline ZIP including both preserved Windows packages."""
import argparse
import hashlib
import html
from pathlib import Path
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--output', type=Path, required=True)
a = p.parse_args()
a.output.mkdir(parents=True, exist_ok=True)
staging = a.output / 'hover-offline'
subprocess.run([sys.executable, str(ROOT/'scripts/restore_windows.py')], cwd=ROOT, check=True)
subprocess.run([sys.executable, str(ROOT/'scripts/build_site.py'), '--include-downloads', '--output', str(staging)], cwd=ROOT, check=True)
shutil.copy(ROOT/'scripts/offline_launcher.py', staging/'start.py')
(staging/'start.cmd').write_text('@echo off\r\ncd /d "%~dp0"\r\nwhere py >nul 2>nul\r\nif %errorlevel%==0 (py -3 start.py) else (python start.py)\r\npause\r\n')
(staging/'start.sh').write_text('#!/bin/sh\ncd "$(dirname "$0")" || exit 1\nexec python3 start.py\n')
(staging/'start.sh').chmod(0o755)
for name in ['RESTORATION.md','RESTORATION.en.md','CRAFTS.md','CRAFTS.en.md','SERVER.md','SERVER.en.md','FEATURES.md','FEATURES.en.md']:
    shutil.copy(ROOT/name, staging/name)
    (staging/(name+'.html')).write_text('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+html.escape(name)+'</title><style>body{background:#15121f;color:#eee;font:16px/1.6 sans-serif;margin:24px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><pre>'+html.escape((ROOT/name).read_text())+'</pre>')
index=staging/'index.html'
index.write_text(index.read_text().replace('https://github.com/dreimer1986/hover/blob/master/RESTORATION.md','RESTORATION.md.html').replace('https://github.com/dreimer1986/hover/blob/master/RESTORATION.en.md','RESTORATION.en.md.html'))
(staging/'START-HERE.txt').write_text('HOVER OFFLINE / HOVER OFFLINE\n\nDE: ZIP komplett entpacken. Python 3 installieren. Windows: start.cmd. Linux/macOS: sh start.sh. Alternativ: python3 start.py. Das Fenster zum Spielen offen lassen. Internet ist nur fuer Multiplayer erforderlich. Die Store-Pakete sind Archivdownloads, keine automatische Installation.\n\nEN: Extract the entire ZIP. Install Python 3. Windows: start.cmd. Linux/macOS: sh start.sh. Alternatively: python3 start.py. Keep the terminal open while playing. Only multiplayer requires internet access. The Store packages are preservation downloads, not automatic installations.\n\nBrowser storage belongs to a local URL. Export your library and settings before changing host or port. / Browserdaten gehoeren zur lokalen URL. Vor Host- oder Portwechsel Bibliothek und Einstellungen exportieren.\n')
archive = a.output/'Hover-offline.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for path in sorted(staging.rglob('*')):
        if path.is_file(): z.write(path,Path('hover-offline')/path.relative_to(staging))
sha=hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()
(archive.with_suffix('.zip.sha256')).write_text(f'{sha}  {archive.name}\n')
print(archive)
