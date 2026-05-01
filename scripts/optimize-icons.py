"""
Resize the 4 in-use solution-card icons from 2048x2048 down to 800x800
(plus the logo-mark) and re-compress with optimize=True. The icons render
at clamp(124, 16vw, 208)px max on the page, so 800px gives ~4x retina
headroom while shedding the 1.6-1.9 MB-per-icon weight that was crushing
load time. Also runs the same pipeline for english.png / calendar.png so
they're ready if reused later. Idempotent — re-running on already-small
files just re-encodes (no further size loss).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "assets" / "3d"

# Icons used in landing.html solution cards (max display ~208px)
SOLUTION_ICONS = ["math.png", "science.png", "korean.png", "info-ai.png",
                  "english.png", "calendar.png"]
SOLUTION_TARGET = 800  # square edge

# Logo mark used in nav (max display 46px desktop)
LOGO_MARK = "logo-mark.png"
LOGO_TARGET_W = 360  # keep aspect ratio


def resize_square(name: str, target: int) -> None:
    p = ICON_DIR / name
    if not p.exists():
        print(f"skip {name} (missing)")
        return
    before = p.stat().st_size
    img = Image.open(p).convert("RGBA")
    if img.size[0] > target:
        img = img.resize((target, target), Image.LANCZOS)
    img.save(p, optimize=True)
    after = p.stat().st_size
    print(f"{name}: {before/1024:.0f} KB → {after/1024:.0f} KB "
          f"({(1 - after/before)*100:.1f}% smaller)")


def resize_logo(name: str, target_w: int) -> None:
    p = ICON_DIR / name
    if not p.exists():
        print(f"skip {name} (missing)")
        return
    before = p.stat().st_size
    img = Image.open(p).convert("RGBA")
    if img.size[0] > target_w:
        ratio = target_w / img.size[0]
        new_h = int(img.size[1] * ratio)
        img = img.resize((target_w, new_h), Image.LANCZOS)
    img.save(p, optimize=True)
    after = p.stat().st_size
    print(f"{name}: {before/1024:.0f} KB → {after/1024:.0f} KB "
          f"({(1 - after/before)*100:.1f}% smaller)")


def main() -> None:
    for name in SOLUTION_ICONS:
        resize_square(name, SOLUTION_TARGET)
    resize_logo(LOGO_MARK, LOGO_TARGET_W)


if __name__ == "__main__":
    main()
