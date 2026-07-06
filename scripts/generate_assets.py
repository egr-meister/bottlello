#!/usr/bin/env python3
"""Generate Bottlello icon, adaptive icon, splash, and favicon.

Draws a simple bottle silhouette with scale marks and a half-level water fill.
Run from the project root:  python3 scripts/generate_assets.py
"""

import os

from PIL import Image, ImageDraw, ImageFont

BG_AQUA = (228, 241, 239, 255)      # pale aqua
TEAL = (78, 141, 135, 255)          # muted teal
DEEP = (46, 64, 87, 255)            # deep blue-gray
SKY = (95, 170, 221, 255)           # sky blue fill
WHITE = (255, 255, 255, 255)
WARM_WHITE = (251, 248, 242, 255)

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets')


def rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def draw_bottle(draw, cx, top, bottom, body_w, outline_w, fill_level=0.5,
                outline=DEEP, water=SKY, marks=TEAL, inner_bg=WHITE):
    """Draw a bottle silhouette with scale marks and a water fill."""
    neck_w = int(body_w * 0.38)
    height = bottom - top
    cap_h = int(height * 0.075)
    neck_h = int(height * 0.09)
    shoulder_h = int(height * 0.14)
    body_top = top + cap_h + neck_h + shoulder_h
    radius = int(body_w * 0.18)

    # Cap
    rounded_rect(
        draw,
        (cx - neck_w // 2 - outline_w, top,
         cx + neck_w // 2 + outline_w, top + cap_h),
        radius=cap_h // 3,
        fill=marks,
    )
    # Neck
    draw.rectangle(
        (cx - neck_w // 2, top + cap_h, cx + neck_w // 2, top + cap_h + neck_h + 4),
        fill=outline,
    )
    # Shoulders (trapezoid)
    draw.polygon(
        [
            (cx - neck_w // 2, top + cap_h + neck_h),
            (cx + neck_w // 2, top + cap_h + neck_h),
            (cx + body_w // 2, body_top),
            (cx - body_w // 2, body_top),
        ],
        fill=outline,
    )
    # Body (outer)
    rounded_rect(
        draw,
        (cx - body_w // 2, body_top - radius, cx + body_w // 2, bottom),
        radius=radius,
        fill=outline,
    )
    # Body (inner)
    inner_l = cx - body_w // 2 + outline_w
    inner_r = cx + body_w // 2 - outline_w
    inner_t = body_top - radius + outline_w
    inner_b = bottom - outline_w
    rounded_rect(
        draw,
        (inner_l, inner_t, inner_r, inner_b),
        radius=max(2, radius - outline_w),
        fill=inner_bg,
    )
    # Water fill (clipped to inner area, simple rectangle from the bottom)
    water_top_limit = body_top + outline_w
    span = inner_b - water_top_limit
    water_y = inner_b - int(span * fill_level)
    rounded_rect(
        draw,
        (inner_l, water_y, inner_r, inner_b),
        radius=max(2, radius - outline_w),
        fill=water,
    )
    draw.rectangle((inner_l, water_y, inner_r, water_y + max(4, outline_w // 2)),
                   fill=tuple(min(255, int(c * 0.82)) for c in water[:3]) + (255,))

    # Scale marks at 1/4, 1/2, 3/4, full
    mark_len = int(body_w * 0.28)
    mark_w = max(4, outline_w // 2)
    for frac in (0.25, 0.5, 0.75, 1.0):
        y = inner_b - int(span * frac)
        draw.rectangle((inner_l, y - mark_w // 2, inner_l + mark_len, y + mark_w // 2),
                       fill=marks)


def make_icon():
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rounded_rect(d, (0, 0, size, size), radius=180, fill=BG_AQUA)
    draw_bottle(d, cx=size // 2, top=150, bottom=880, body_w=380, outline_w=34,
                fill_level=0.5)
    img.save(os.path.join(OUT_DIR, 'icon.png'))


def make_adaptive_icon():
    # Foreground layer: keep the bottle inside the central safe zone.
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_bottle(d, cx=size // 2, top=280, bottom=780, body_w=260, outline_w=24,
                fill_level=0.5)
    img.save(os.path.join(OUT_DIR, 'adaptive-icon.png'))


def load_font(px):
    for path in (
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, px)
    return ImageFont.load_default()


def make_splash():
    w, h = 1284, 2048
    img = Image.new('RGBA', (w, h), BG_AQUA)
    d = ImageDraw.Draw(img)
    draw_bottle(d, cx=w // 2, top=560, bottom=1280, body_w=330, outline_w=30,
                fill_level=0.5, inner_bg=WARM_WHITE)
    font = load_font(120)
    text = 'Bottlello'
    box = d.textbbox((0, 0), text, font=font)
    d.text(((w - (box[2] - box[0])) // 2, 1400), text, font=font, fill=DEEP)
    sub_font = load_font(44)
    sub = 'Manual bottle scale'
    sbox = d.textbbox((0, 0), sub, font=sub_font)
    d.text(((w - (sbox[2] - sbox[0])) // 2, 1560), sub, font=sub_font, fill=TEAL)
    img.save(os.path.join(OUT_DIR, 'splash.png'))


def make_favicon():
    icon = Image.open(os.path.join(OUT_DIR, 'icon.png'))
    icon.resize((48, 48), Image.LANCZOS).save(os.path.join(OUT_DIR, 'favicon.png'))


if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    make_icon()
    make_adaptive_icon()
    make_splash()
    make_favicon()
    print('Assets written to', os.path.abspath(OUT_DIR))
