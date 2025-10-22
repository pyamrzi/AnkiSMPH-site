#!/usr/bin/env python3
import http.server
import socketserver

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

handler = Handler
try:
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()
except OSError as e:
    if e.errno == 48:  # Port already in use
        print(f"Port {PORT} is already in use. Try a different port.")
    else:
        raise e