#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_IMG = os.path.join(BASE_DIR, "assets", "boardroom-photo.jpg")
SCREENS_DIR = os.path.join(BASE_DIR, "assets", "screens")
LAYERS_DIR = os.path.join(BASE_DIR, "assets", "layers")

os.makedirs(SCREENS_DIR, exist_ok=True)
os.makedirs(LAYERS_DIR, exist_ok=True)

img = Image.open(SRC_IMG).convert("RGBA")
W, H = img.size

def to_px(poly_1000):
    return [(x / 1000.0 * W, y / 562.5 * H) for (x, y) in poly_1000]

# Verified 4-corner perspective polygons in 1000x562.5 normalized coordinates
SCREENS = {
    "E1_market_overview": [(28, 35), (199, 77), (199, 134), (28, 102)],
    "E2_global_network": [(19, 128), (318, 159), (318, 276), (19, 287)],
    "E3_table_kpi": [(0, 382), (106, 365), (266, 479), (106, 508), (0, 446)],
    "E4_risk_analysis": [(287, 107), (386, 127), (386, 178), (287, 168)],
    "E5_project_horizon": [(488, 121), (607, 114), (607, 170), (488, 173)],
    "E6_sustainable_future": [(686, 106), (809, 98), (809, 173), (686, 175)],
    "E7_global_operations": [(628, 187), (773, 182), (773, 252), (628, 249)],
    "E8_ai_insights": [(854, 88), (986, 75), (986, 170), (854, 174)],
    "E9_project_portfolio": [(779, 233), (882, 232), (882, 297), (779, 291)],
}

# 1. Extract each of the 9 screens as its own transparent PNG asset
for name, poly in SCREENS.items():
    pts = to_px(poly)
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(pts, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=1.5))

    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    out_path = os.path.join(SCREENS_DIR, f"{name}.png")
    out.save(out_path)
    print(f"Extracted {name}.png")

# 2. Build outside sunset & city skyline background layer (expanded cleanly for parallax pan)
skyline = img.copy()
# Enhance slightly for crispness behind cut-out glass panes
skyline.save(os.path.join(LAYERS_DIR, "bg_skyline_outside.png"))
print("Saved bg_skyline_outside.png")

# 3. Cut out panoramic window panes from the base boardroom interior layer
# Keep vertical architectural mullions, ceiling, chairs, and obsidian table solid!
arr = np.array(img).copy()
# Panoramic window glass bays (normalized 1000x562.5 polygons between dark window mullions)
WINDOW_PANES = [
    # Bay 1 (left-mid between mullions)
    [(340, 82), (402, 76), (402, 278), (340, 278)],
    # Bay 2 (center-left)
    [(410, 74), (476, 68), (476, 282), (410, 282)],
    # Bay 3 (center)
    [(488, 66), (576, 56), (576, 286), (488, 286)],
    # Bay 4 (center-right)
    [(592, 54), (639, 48), (639, 292), (592, 292)],
    # Bay 5 (right-mid)
    [(668, 44), (748, 34), (748, 298), (668, 298)],
    # Bay 6 (right)
    [(762, 32), (831, 22), (831, 304), (762, 304)],
    # Bay 7 (far right sunset bay)
    [(845, 20), (956, 4), (956, 260), (845, 290)],
]

win_mask = Image.new("L", (W, H), 0)
wdraw = ImageDraw.Draw(win_mask)
for pane in WINDOW_PANES:
    wdraw.polygon(to_px(pane), fill=255)
win_mask = win_mask.filter(ImageFilter.GaussianBlur(radius=2.2))

# Punch alpha cutouts ONLY where pixels are bright sky/window glass (preserving dark mullions & furniture!)
win_alpha = np.array(win_mask, dtype=np.float32) / 255.0
rgb = arr[:, :, :3].astype(np.float32)
luma = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]

# Keep dark mullions/silhouettes (luma < 42) solid; cut out bright window glass (luma > 55)
glass_factor = np.clip((luma - 42.0) / 30.0, 0.0, 1.0)
cutout_strength = win_alpha * glass_factor

# Make window glass panes semi-transparent (keep 10% subtle glass reflection tint)
new_alpha = np.clip(255.0 * (1.0 - cutout_strength * 0.92), 0, 255).astype(np.uint8)
arr[:, :, 3] = new_alpha

boardroom_cutout = Image.fromarray(arr, mode="RGBA")
boardroom_cutout.save(os.path.join(LAYERS_DIR, "boardroom_cutout.png"))
print("Saved boardroom_cutout.png with panoramic window cutouts")
