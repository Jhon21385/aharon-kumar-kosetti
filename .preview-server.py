#!/usr/bin/env python3
"""Tiny static server for local preview — sends no-cache headers so edits
always show up on reload (python's http.server lets browsers cache HTML)."""
import functools
import http.server
import socketserver

PORT = 3000
DIRECTORY = "/home/user/aharon-kumar-kosetti"


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the log tail short
        pass


Handler.extensions_map.update({".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml"})

with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), functools.partial(Handler, directory=DIRECTORY)) as httpd:
    httpd.allow_reuse_address = True
    print(f"serving {DIRECTORY} on http://0.0.0.0:{PORT} (no-cache)", flush=True)
    httpd.serve_forever()
