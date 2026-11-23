# Executive Holo-Table 3D — Dokumentacja Odtworzenia Projektu

## Szybkie uruchomienie (1 klik)
- Dwukrotnie kliknij: `/Users/krzysztofjarzyna/.gemini/antigravity/scratch/executive-holo-table/start-offline.command`
- Lub w terminalu:
  ```bash
  cd /Users/krzysztofjarzyna/.gemini/antigravity/scratch/executive-holo-table
  python3 server.py
  ```
- Adres lokalny: `http://localhost:3004` (sieć Wi-Fi: `http://10.226.120.163:3004`)

## Struktura warstw i zasobów (100% lokalnie offline)
- `index.html`, `styles.css`, `scene3d.js`, `server.py` — aplikacja i serwer HTTP.
- `vendor/three.module.js`, `vendor/three.core.js` — lokalny Three.js (bez CDN).
- `assets/boardroom-photo.jpg` — bazowe zdjęcie sali narad.
- `assets/layers/bg_skyline_outside.png` — warstwa 0 (panorama za oknami, paralaksa `0.28x`).
- `assets/layers/boardroom_cutout.png` — warstwa 1 (wnętrze sali z wyciętymi oknami, paralaksa `0.90x`).
- `assets/screens/E1_market_overview.png` … `E9_project_portfolio.png` — 9 wydzielonych ekranów PNG z niezależną paralaksą (`0.92x`–`1.85x`).
- `scripts/segment_layers.py` — skrypt Python (`uv run --with pillow --with numpy`) odtwarzający wszystkie 11 warstw PNG z bazowej grafiki.
