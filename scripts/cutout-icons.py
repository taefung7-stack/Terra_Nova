"""
Strip the solid-black background from neon-on-black 3D icon PNGs and emit
RGBA versions where each pixel's alpha = max(R, G, B). This:
  - drops pure black to alpha 0 (fully transparent),
  - keeps mint-green core fully opaque,
  - turns the green glow halo into a smooth alpha falloff (free for the card
    backdrop to show through), so the cards no longer look like black squares.

Inputs are overwritten in place (dest = src) — the originals were saved by
the user expressly for this purpose, so there's no separate "raw" copy to
preserve. Re-run is idempotent on already-cutout PNGs (alpha just becomes
self-consistent).
"""
from pathlib import Path
from PIL import Image

ICON_DIR = Path(__file__).resolve().parent.parent / "assets" / "3d"
TARGETS = ["math.png", "science.png", "korean.png", "info-ai.png",
           "calendar.png", "english.png"]
NOISE_THRESHOLD = 8  # below this, treat pixel as pure black (alpha=0)


def cutout(path: Path) -> tuple[int, int]:
    img = Image.open(path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
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
    img.save(path, optimize=True)
    return cleared, w * h


def main() -> None:
    for name in TARGETS:
        p = ICON_DIR / name
        if not p.exists():
            print(f"skip {name} (missing)")
            continue
        cleared, total = cutout(p)
        pct = cleared * 100.0 / total
        print(f"{name}: {cleared}/{total} px → transparent ({pct:.1f}%)")


if __name__ == "__main__":
    main()
