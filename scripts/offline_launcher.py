#!/usr/bin/env python3
"""Serve this archive locally without external Python packages. Ctrl+C stops it."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(('127.0.0.1', 8088), handler) as server:
        url = f'http://127.0.0.1:{server.server_port}/'
        print(f'Hover offline: {url}\nStop: Ctrl+C / Beenden: Strg+C', flush=True)
        threading.Timer(.5, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
