#!/usr/bin/env zsh
set -euo pipefail

export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

PROJECT_DIR="/Users/krzysztofjarzyna/.gemini/antigravity/scratch/executive-holo-table"
RELEASE_DIR="$PROJECT_DIR/release"
APP_NAME="Executive Holo-Table 3D.app"
APP_DIR="$RELEASE_DIR/$APP_NAME"
DMG_STAGE="$RELEASE_DIR/.dmg_stage"
DMG_PATH="$RELEASE_DIR/Executive-Holo-Table-3D-Offline-macOS.dmg"
ZIP_PATH="$RELEASE_DIR/Executive-Holo-Table-3D-Offline-macOS.zip"
ICONSET_DIR="$RELEASE_DIR/.AppIcon.iconset"
ICON_PNG="$RELEASE_DIR/.icon_1024.png"

rm -rf "$APP_DIR" "$DMG_STAGE" "$ICONSET_DIR" "$ICON_PNG" "$DMG_PATH" "$ZIP_PATH"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources/web"

# 1. Copy complete static 3D web app + local Three.js vendor + segmented layers & screens
cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/styles.css" "$PROJECT_DIR/scene3d.js" "$APP_DIR/Contents/Resources/web/"
cp -R "$PROJECT_DIR/assets" "$APP_DIR/Contents/Resources/web/assets"
cp -R "$PROJECT_DIR/vendor" "$APP_DIR/Contents/Resources/web/vendor"

# 2. Generate crisp 1024x1024 Executive Holo-Table 3D AppIcon.icns
uv run --with pillow python3 - "$ICON_PNG" << 'PYICON'
import sys
from PIL import Image, ImageDraw

out_path = sys.argv[1]
S = 1024
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

pad = 64
d.rounded_rectangle([pad, pad, S - pad, S - pad], radius=210, fill=(9, 14, 28, 255), outline=(56, 189, 248, 235), width=16)
d.rounded_rectangle([pad + 26, pad + 26, S - pad - 26, S - pad - 26], radius=188, outline=(251, 191, 36, 95), width=5)

cx, cy = S // 2, S // 2 + 125

# Glass boardroom table ellipse
d.ellipse([cx - 330, cy - 95, cx + 330, cy + 125], fill=(15, 23, 42, 235), outline=(56, 189, 248, 230), width=12)
d.ellipse([cx - 260, cy - 68, cx + 260, cy + 92], fill=(2, 132, 199, 55), outline=(125, 211, 252, 160), width=6)

# Holographic vertical light beams
d.polygon([(cx - 190, cy - 10), (cx - 120, cy - 330), (cx + 120, cy - 330), (cx + 190, cy - 10)], fill=(34, 211, 238, 42))

# Floating holographic screens (left, center, right)
d.rounded_rectangle([cx - 300, cy - 330, cx - 125, cy - 170], radius=22, fill=(14, 165, 233, 85), outline=(103, 232, 249, 245), width=9)
d.rounded_rectangle([cx - 100, cy - 390, cx + 100, cy - 195], radius=24, fill=(56, 189, 248, 100), outline=(224, 242, 254, 255), width=10)
d.rounded_rectangle([cx + 125, cy - 330, cx + 300, cy - 170], radius=22, fill=(245, 158, 11, 75), outline=(251, 191, 36, 245), width=9)

# Center globe hologram
gcx, gcy, gr = cx, cy - 85, 92
d.ellipse([gcx - gr, gcy - gr, gcx + gr, gcy + gr], fill=(34, 211, 238, 90), outline=(165, 243, 252, 255), width=8)
d.ellipse([gcx - gr, gcy - 34, gcx + gr, gcy + 34], outline=(224, 242, 254, 210), width=6)
d.ellipse([gcx - 36, gcy - gr, gcx + 36, gcy + gr], outline=(224, 242, 254, 210), width=6)

img.save(out_path, "PNG")
PYICON

mkdir -p "$ICONSET_DIR"
sips -z 16 16     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16.png"      >/dev/null
sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"   >/dev/null
sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32.png"      >/dev/null
sips -z 64 64     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"   >/dev/null
sips -z 128 128   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128.png"    >/dev/null
sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null
sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256.png"    >/dev/null
sips -z 512 512   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null
sips -z 512 512   "$ICON_PNG" --out "$ICONSET_DIR/icon_512x512.png"    >/dev/null
cp "$ICON_PNG"                      "$ICONSET_DIR/icon_512x512@2x.png"
iconutil -c icns "$ICONSET_DIR" -o "$APP_DIR/Contents/Resources/AppIcon.icns"
rm -rf "$ICONSET_DIR" "$ICON_PNG"

# 3. Info.plist
cat > "$APP_DIR/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>pl</string>
  <key>CFBundleDisplayName</key>
  <string>Executive Holo-Table 3D</string>
  <key>CFBundleExecutable</key>
  <string>ExecutiveHoloTable3D</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>local.executive.holotable3d.offline</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>Executive Holo-Table 3D</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
PLIST

# 4. Zero-dependency Python 3 offline server
cat > "$APP_DIR/Contents/Resources/offline_server.py" << 'PYEOF'
#!/usr/bin/env python3
"""Executive Holo-Table 3D — 100% Offline Local Server."""

import http.server
import json
import mimetypes
import os
import socketserver
import sys
from urllib.parse import urlparse

PORT = int(os.environ.get("HOLOTABLE_PORT", "3023"))
HOST = "127.0.0.1"
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")


class HoloTableOfflineHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if urlparse(self.path).path == "/__health":
            body = json.dumps({"status": "ok", "app": "Executive Holo-Table 3D Offline", "port": PORT}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()


class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    try:
        with ReusableTCPServer((HOST, PORT), HoloTableOfflineHandler) as httpd:
            httpd.serve_forever()
    except OSError as exc:
        sys.stderr.write(f"Executive Holo-Table 3D server could not bind {HOST}:{PORT}: {exc}\n")
        sys.exit(1)
PYEOF
chmod +x "$APP_DIR/Contents/Resources/offline_server.py"

# 5. Native macOS executable launcher
cat > "$APP_DIR/Contents/MacOS/ExecutiveHoloTable3D" << 'LAUNCHER'
#!/usr/bin/env zsh
set -euo pipefail

APP_CONTENTS="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_SCRIPT="$APP_CONTENTS/Resources/offline_server.py"
DATA_DIR="$HOME/Library/Application Support/ExecutiveHoloTable3D"
LOG_FILE="$HOME/Library/Logs/ExecutiveHoloTable3D.log"
PID_FILE="$DATA_DIR/server.pid"
PORT="3023"
URL="http://127.0.0.1:${PORT}/"

mkdir -p "$DATA_DIR" "$HOME/Library/Logs"

if ! /usr/bin/curl -sf "http://127.0.0.1:${PORT}/__health" >/dev/null 2>&1; then
  nohup /usr/bin/python3 "$SERVER_SCRIPT" >>"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  for _ in {1..25}; do
    if /usr/bin/curl -sf "http://127.0.0.1:${PORT}/__health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done
fi

CHROME_PROFILE="$DATA_DIR/app-profile"
for BROWSER_BIN in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
  if [[ -x "$BROWSER_BIN" ]]; then
    nohup "$BROWSER_BIN" --app="$URL" --user-data-dir="$CHROME_PROFILE" --no-first-run >/dev/null 2>&1 &
    exit 0
  fi
done

/usr/bin/open "$URL"
LAUNCHER
chmod +x "$APP_DIR/Contents/MacOS/ExecutiveHoloTable3D"

# 6. Ad-hoc sign + ZIP + DMG
codesign --force --deep --sign - "$APP_DIR" >/dev/null 2>&1 || true
(cd "$RELEASE_DIR" && /usr/bin/zip -qry "$ZIP_PATH" "$APP_NAME")

mkdir -p "$DMG_STAGE"
cp -R "$APP_DIR" "$DMG_STAGE/"
ln -s /Applications "$DMG_STAGE/Applications"
cat > "$DMG_STAGE/INSTRUKCJA_INSTALACJI.txt" << 'TXT'
EXECUTIVE HOLO-TABLE 3D — NIEZALEŻNA APLIKACJA OFFLINE (macOS)
==============================================================

1. Przeciągnij "Executive Holo-Table 3D.app" na folder "Applications" (Aplikacje).
2. Uruchom z folderu Aplikacje lub przez Spotlight (Cmd + Spacja).

Działa w 100% lokalnie (offline) na porcie http://127.0.0.1:3023
bez internetu, bez Node.js i bez Antigravity.
TXT

hdiutil create -volname "Executive Holo-Table 3D" -srcfolder "$DMG_STAGE" -ov -format UDZO "$DMG_PATH" >/dev/null
rm -rf "$DMG_STAGE"

echo "HOLOTABLE_BUILD_COMPLETE"
ls -lh "$RELEASE_DIR"
