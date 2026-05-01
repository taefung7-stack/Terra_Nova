"""
Crop + resize the 10 planet photos to a consistent square format suitable
for the orbit carousel. The page renders the largest planet (SUN) at most
~320 px on retina displays, so 800 px square is ample (~2.5x retina) while
shedding the multi-MB iPhone-wallpaper weight typical of source photos.

Usage:
    1. Save the 10 source photos at assets/3d/planets/ with filenames:
       moon.png, mercury.png, mars.png, venus.png, terra.png,
       neptune.png, uranus.png, saturn.png, jupiter.png, sun.png
       (extension can be .png, .jpg, or .jpeg — script auto-detects)
    2. Run: python scripts/optimize-planets.py
    3. Refresh landing.html in browser.

The script:
  - Reads any of {png, jpg, jpeg} for each planet name
  - Crops to a square centered on the image's central planet (most NASA-
    style photos place the body in the geometric center)
  - For SATURN and URANUS, uses the FULL frame (rings extend beyond the
    central disc — those two have border-radius:0 in CSS so the whole
    square shows; we keep aspect ratio padded if not square)
  - Resizes to 800x800 with high-quality LANCZOS resampling
  - Saves as PNG with optimize=True (alpha channel preserved if present)

Idempotent — re-running on already-processed files just re-encodes (no
visible quality loss because LANCZOS is good at near-1.0x scaling).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PLANETS_DIR = ROOT / "assets" / "3d" / "planets"

# Targets: (canonical_name, keeps_aspect_via_pad)
# Saturn + Uranus have prominent rings extending wider/taller than the planet
# disc — pad to square instead of cropping so we don't clip ring tips.
TARGETS = [
    ("moon",    False),
    ("mercury", False),
    ("mars",    False),
    ("venus",   False),
    ("terra",   False),
    ("neptune", False),
    ("uranus",  True),   # rings → pad
    ("saturn",  True),   # rings → pad
    ("jupiter", False),
    ("sun",     False),
]
EDGE = 800
EXTS = (".png", ".jpg", ".jpeg", ".webp")


def find_source(name: str) -> Path | None:
    for ext in EXTS:
        p = PLANETS_DIR / f"{name}{ext}"
        if p.exists():
            return p
    return None


def square_crop(img: Image.Image) -> Image.Image:
    """Center-crop to a square."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def square_pad(img: Image.Image, fill=(0, 0, 0, 0)) -> Image.Image:
    """Pad to square with transparent (or black) background — preserves rings."""
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), fill)
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img if img.mode == "RGBA" else None)
    return canvas


def process(name: str, pad: bool) -> None:
    src = find_source(name)
    if src is None:
        print(f"skip {name} (no source file in {PLANETS_DIR})")
        return
    before = src.stat().st_size
    img = Image.open(src).convert("RGB")

    if pad:
        # JPG can't carry alpha, so the pad fill must be opaque black —
        # blends into the page's dark background visually anyway.
        canvas = Image.new("RGB", (max(img.size),) * 2, (0, 0, 0))
        canvas.paste(img, ((max(img.size) - img.size[0]) // 2,
                           (max(img.size) - img.size[1]) // 2))
        img = canvas
    else:
        img = square_crop(img)

    img = img.resize((EDGE, EDGE), Image.LANCZOS)

    # Emit canonical .jpg (matches the CSS url() references — JPG is ~7-10x
    # smaller than PNG for photographic content like planet surfaces, and
    # the page never needs alpha for non-ringed bodies).
    out = PLANETS_DIR / f"{name}.jpg"
    img.save(out, quality=86, optimize=True, progressive=True)
    after = out.stat().st_size
    # Delete any stale duplicate file at a different extension so only one
    # canonical asset per planet sits next to it.
    for ext in (".png", ".jpeg", ".webp"):
        stale = PLANETS_DIR / f"{name}{ext}"
        if stale.exists() and stale != out:
            stale.unlink()
    print(f"{name}: {before/1024:.0f} KB → {after/1024:.0f} KB "
          f"(EDGE={EDGE}, mode={'pad' if pad else 'crop'})")


def main() -> None:
    PLANETS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Planet directory: {PLANETS_DIR}")
    for name, pad in TARGETS:
        process(name, pad)


if __name__ == "__main__":
    main()
