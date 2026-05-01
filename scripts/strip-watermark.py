"""
Strip the Gemini AI watermark (✦ sparkle in the bottom-right corner) from
each 2048x2048 icon PNG. The watermark sits in the empty corner outside the
centered icon's glow envelope, so a hard alpha-zero of the bottom-right
12% x 12% box (~245x245 px) safely removes it without clipping any icon
geometry. Re-run is idempotent (already-zeroed pixels stay zero).
"""
from pathlib import Path
from PIL import Image

ICON_DIR = Path(__file__).resolve().parent.parent / "assets" / "3d"
TARGETS = ["math.png", "science.png", "korean.png", "info-ai.png",
           "calendar.png", "english.png"]
CORNER_PCT = 0.12  # bottom-right 12% x 12% region


def strip(path: Path) -> tuple[int, int]:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cw = int(w * CORNER_PCT)
    ch = int(h * CORNER_PCT)
    x0, y0 = w - cw, h - ch
    pixels = img.load()
    cleared = 0
    for y in range(y0, h):
        for x in range(x0, w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (0, 0, 0, 0)
                cleared += 1
    img.save(path, optimize=True)
    return cleared, cw * ch


def main() -> None:
    for name in TARGETS:
        p = ICON_DIR / name
        if not p.exists():
            print(f"skip {name} (missing)")
            continue
        cleared, total = strip(p)
        pct = cleared * 100.0 / total
        print(f"{name}: {cleared}/{total} px → cleared ({pct:.1f}%)")


if __name__ == "__main__":
    main()
