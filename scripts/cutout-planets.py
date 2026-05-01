"""
Strip the black background from each planet photo so the body sits cleanly
on the page's dark gradient instead of a hard rectangle.

Naive `alpha = max(R,G,B)` would punch holes through the moon's craters and
the dark bands of Jupiter — those interior dark patches read as "dark" too.
Instead we flood-fill from the four corners: only pixels actually connected
to a corner via a dark-enough chain are turned transparent. Interior
dark spots stay opaque because the planet's bright disc edge blocks the
flood.

After flood-fill, the alpha channel gets a 1.5px Gaussian blur to soften
the silhouette edge so it doesn't look digitally clipped.

Inputs : assets/3d/planets/*.jpg (auto-detected, also accepts .png)
Outputs: assets/3d/planets/*.png  (RGBA, idempotent)
"""
from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PLANETS_DIR = ROOT / "assets" / "3d" / "planets"

PLANETS = ["moon", "mercury", "mars", "venus", "terra",
           "neptune", "uranus", "saturn", "jupiter", "sun"]
# Saturn + Uranus need their full bounding rectangle preserved (rings
# extend beyond the planet disc) — pad to square instead of cropping.
PAD_PLANETS = {"saturn", "uranus"}

# Pixels with max(R,G,B) <= THRESHOLD are considered "dark enough" to be
# absorbed by the flood. 28 catches the soft black halo around most planet
# photos without eating the disc edge (which jumps to 60+ brightness fast).
THRESHOLD = 28
EDGE_BLUR_PX = 1.5
# Final canonical edge size for all planet PNGs. Largest displayed planet
# is SUN at ~496px on retina (~992 effective px), so 800px gives ~1.6x
# headroom while keeping file size sane after alpha-key.
EDGE = 800


def find_source(name: str) -> Path | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = PLANETS_DIR / f"{name}{ext}"
        if p.exists():
            return p
    return None


def flood_alpha(img: Image.Image, threshold: int) -> Image.Image:
    """Return img with alpha=0 on every pixel reachable from a corner via
    a chain of pixels each having max(R,G,B) <= threshold."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    # bytearray-backed visited mask for speed (1 byte per pixel = ~640KB at 800×800)
    visited = bytearray(w * h)
    q = deque()
    for cx, cy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        q.append((cx, cy))

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        r, g, b, _ = px[x, y]
        if max(r, g, b) > threshold:
            continue
        # Background pixel — make fully transparent
        px[x, y] = (r, g, b, 0)
        q.append((x + 1, y))
        q.append((x - 1, y))
        q.append((x, y + 1))
        q.append((x, y - 1))
    return img


def soften_edges(img: Image.Image, blur_px: float) -> Image.Image:
    """Blur ONLY the alpha channel so the silhouette has anti-aliased edges
    without smearing the planet's surface texture."""
    r, g, b, a = img.split()
    a_blurred = a.filter(ImageFilter.GaussianBlur(blur_px))
    return Image.merge("RGBA", (r, g, b, a_blurred))


def square_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    return img.crop(((w - side) // 2, (h - side) // 2,
                     (w - side) // 2 + side, (h - side) // 2 + side))


def square_pad(img: Image.Image) -> Image.Image:
    """Pad to square with TRANSPARENT fill — alpha-key happens after, but
    starting transparent means the padded margins never need fill cleanup."""
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2))
    return canvas


def process(name: str) -> None:
    src = find_source(name)
    if src is None:
        print(f"skip {name} (no source file)")
        return
    before = src.stat().st_size
    img = Image.open(src).convert("RGBA")
    # 1. Square: pad for ringed planets (preserve ring tips), crop otherwise
    img = square_pad(img) if name in PAD_PLANETS else square_crop(img)
    # 2. Resize to canonical edge
    if img.size[0] != EDGE:
        img = img.resize((EDGE, EDGE), Image.LANCZOS)
    # 3. Alpha-key the black background via flood-fill from corners
    img = flood_alpha(img, THRESHOLD)
    # 4. Anti-alias the silhouette edge
    img = soften_edges(img, EDGE_BLUR_PX)

    out = PLANETS_DIR / f"{name}.png"
    img.save(out, optimize=True)
    after = out.stat().st_size
    if src != out and src.exists():
        src.unlink()
    print(f"{name}: {before/1024:.0f} KB → {after/1024:.0f} KB (cutout, {EDGE}px)")


def main() -> None:
    for n in PLANETS:
        process(n)


if __name__ == "__main__":
    main()
