"""
Crop the green infinity (∞) symbol from logo.png and emit a transparent-
background PNG suitable for the navigation. The source logo (2000x2000)
contains the ∞ in the upper half + "TERRA NOVA / ENGLISH" text below;
this script extracts a tight bounding box around the ∞, alpha-keys the
solid black background away (alpha = max(R,G,B)), and saves the result
as assets/3d/logo-mark.png.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "logo.png"
DST = ROOT / "assets" / "3d" / "logo-mark.png"

# Bounding box around the infinity symbol — roughly y 540..1180,
# x 540..1460 in the 2000x2000 source. Slightly generous to keep the
# soft outer rim without clipping any highlight.
CROP_BOX = (540, 540, 1460, 1180)
NOISE_THRESHOLD = 8


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    crop = img.crop(CROP_BOX)
    pixels = crop.load()
    w, h = crop.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            m = max(r, g, b)
            if m <= NOISE_THRESHOLD:
                pixels[x, y] = (0, 0, 0, 0)
                cleared += 1
            else:
                pixels[x, y] = (r, g, b, m)
    DST.parent.mkdir(parents=True, exist_ok=True)
    crop.save(DST, optimize=True)
    pct = cleared * 100.0 / (w * h)
    print(f"{DST.name}: {w}x{h} | {cleared}/{w*h} px → transparent ({pct:.1f}%)")


if __name__ == "__main__":
    main()
