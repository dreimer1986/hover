#!/usr/bin/env python3
"""Serve the restored Hover web versions locally (Python standard library only)."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port', type=int, default=8000)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'web'
server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SimpleHTTPRequestHandler, directory=str(root)))
for version in ['2013-10-02', '2019-03-11']:
    print(f'http://127.0.0.1:{args.port}/{version}/', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
