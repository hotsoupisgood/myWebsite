"""Elevation contour lines for the Bay Area map (visualizations/bay-area-transit-analysis.md).
Source: AWS Open Data Terrain Tiles (Mapzen Terrarium encoding), the same source as the LA Metro map.
Run: ~/ytpt/.venv/bin/python -I scripts/build_bay_contours.py
Writes visualizations/data/bay_area_contours.json: one GeoJSON MultiLineString per 150 m level."""
import io, json, math, sys, urllib.request
from datetime import date
from pathlib import Path

import numpy as np
from PIL import Image
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

sys.dont_write_bytecode = True
OUT = Path(__file__).resolve().parent.parent / "visualizations" / "data" / "bay_area_contours.json"
Z = 8
W_LON, E_LON, S_LAT, N_LAT = -123.65, -121.15, 36.85, 38.90   # the nine Bay Area counties with a margin
STEP = 150


def tile_xy(lon, lat):
    n = 2 ** Z
    return int((lon + 180) / 360 * n), int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)


def main():
    x0, y0 = tile_xy(W_LON, N_LAT)
    x1, y1 = tile_xy(E_LON, S_LAT)
    rows = []
    for y in range(y0, y1 + 1):
        row = []
        for x in range(x0, x1 + 1):
            url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png"
            img = np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=60).read())).convert("RGB"), float)
            row.append(img[..., 0] * 256 + img[..., 1] + img[..., 2] / 256 - 32768)
        rows.append(np.hstack(row))
    elev = np.vstack(rows)
    h, w = elev.shape
    n = 2 ** Z
    lons = (x0 + (np.arange(w) + 0.5) / 256) / n * 360 - 180
    lats = np.degrees(np.arctan(np.sinh(math.pi * (1 - 2 * (y0 + (np.arange(h) + 0.5) / 256) / n))))
    keep_x = (lons >= W_LON) & (lons <= E_LON); keep_y = (lats >= S_LAT) & (lats <= N_LAT)
    elev, lons, lats = elev[np.ix_(keep_y, keep_x)], lons[keep_x], lats[keep_y]   # tiles overhang the box
    elev = np.where(elev < 0, 0, elev)                     # sea and the Bay are 0
    levels = list(range(STEP, int(elev.max()) + 1, STEP))
    cs = plt.contour(lons, lats, elev, levels=levels)
    feats = []
    for lvl, segs in zip(cs.levels, cs.allsegs):
        lines = [[[round(float(a), 3), round(float(b), 3)] for a, b in s[:: 3 if len(s) > 60 else 2 if len(s) > 20 else 1]] for s in segs if len(s) >= 12]
        if lines:
            feats.append({"type": "Feature", "properties": {"elev": int(lvl)}, "geometry": {"type": "MultiLineString", "coordinates": lines}})
    out = {"type": "FeatureCollection",
           "source": f"AWS Open Data Terrain Tiles (Mapzen Terrarium, zoom {Z}), retrieved {date.today().isoformat()}; contours every {STEP} m",
           "features": feats}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(f"{len(feats)} levels, max {elev.max():.0f} m, {OUT.stat().st_size / 1e3:.0f} kB")


if __name__ == "__main__":
    main()
