"""Generate a test's offline QR matrix (requires the Python qrcode package)."""
import argparse
import json
from pathlib import Path

import qrcode


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", help="Canonical public URL of this test, not the collection homepage")
    parser.add_argument("output", type=Path, help="Test-local share.js destination")
    args = parser.parse_args()
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=4)
    qr.add_data(args.url)
    qr.make(fit=True)
    rows = ["".join("1" if cell else "0" for cell in row) for row in qr.get_matrix()]
    content = (
        "/* Static QR for this test only. Includes the four-module quiet zone. */\n"
        "window.TEST_SHARE = Object.freeze({\n  url: " + json.dumps(args.url) + ",\n"
        "  modules: Object.freeze([\n" + ",\n".join("    " + json.dumps(row) for row in rows)
        + "\n  ])\n});\n"
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(content, encoding="utf-8", newline="\n")
    print(f"Saved {args.output}: {len(rows)} x {len(rows)} modules, including quiet zone.")


if __name__ == "__main__":
    main()
