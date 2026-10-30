"""Preview docs under the same URL prefix as a GitHub project site."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8736)
    parser.add_argument("--base-path", default="/mini-tests/", help="URL prefix, e.g. /mini-tests/ or /")
    args = parser.parse_args()
    base = "/" + args.base_path.strip("/") + "/" if args.base_path.strip("/") else "/"
    if any(char in base for char in "?#\\") or any(part in (".", "..") for part in base.split("/")) or "//" in base:
        parser.error("--base-path must be a URL path such as /mini-tests/")
    root = Path(__file__).resolve().parents[1] / "docs"

    class Handler(SimpleHTTPRequestHandler):
        def translate_path(self, path):
            return super().translate_path("/" + path[len(base):])

        def handle_request(self, head=False):
            path = urlsplit(self.path).path
            if base != "/" and path in ("/", base.rstrip("/")):
                self.send_response(302)
                self.send_header("Location", base)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            if not path.startswith(base):
                self.send_error(404)
                return
            if head:
                super().do_HEAD()
            else:
                super().do_GET()

        def do_GET(self):
            self.handle_request()

        def do_HEAD(self):
            self.handle_request(head=True)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(root)))
    print(f"Local: http://127.0.0.1:{server.server_port}{base}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
