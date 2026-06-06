#!/usr/bin/env python3
# gen-assets.py — ساخت آیکون و splash اندروید بدون وابستگی بیرونی
# نماد: «پر سیمرغ» نورانی روی پس‌زمینه شب‌رنگ. خروجی PNG با کتابخانه استاندارد پایتون.
import math, struct, zlib, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "resources")
os.makedirs(OUT, exist_ok=True)


def write_png(path, W, H, buf):
    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data +
                struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff))
    raw = bytearray()
    stride = W * 4
    for y in range(H):
        raw.append(0)                      # filter type 0
        raw += buf[y * stride:(y + 1) * stride]
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(lerp(c1[i], c2[i], t)) for i in range(3))


def blend(buf, W, x, y, r, g, b, a):
    if a <= 0:
        return
    x = int(x); y = int(y)
    i = (y * W + x) * 4
    if a >= 1:
        buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = 255
    else:
        buf[i]   = int(buf[i]   * (1 - a) + r * a)
        buf[i+1] = int(buf[i+1] * (1 - a) + g * a)
        buf[i+2] = int(buf[i+2] * (1 - a) + b * a)
        buf[i+3] = 255


def fill_vertical_gradient(buf, W, H, top, bottom):
    for y in range(H):
        c = mix(top, bottom, y / max(1, H - 1))
        row = bytes((c[0], c[1], c[2], 255)) * W
        buf[y * W * 4:(y + 1) * W * 4] = bytearray(row)


def draw_emblem(buf, W, H, cx, cy, size):
    """پر سیمرغ نورانی با هاله، در مرکز (cx, cy) و ارتفاع size."""
    fh = size
    maxw = fh * 0.30
    top = cy - fh / 2
    bbox = int(fh * 0.75)

    GOLD = (241, 196, 15)
    ORANGE = (230, 126, 34)
    RED = (192, 57, 43)
    GLOW = (255, 157, 58)

    for yy in range(int(cy - bbox), int(cy + bbox)):
        if yy < 0 or yy >= H:
            continue
        for xx in range(int(cx - bbox), int(cx + bbox)):
            if xx < 0 or xx >= W:
                continue
            dx = xx - cx
            dy = yy - cy
            dist = math.hypot(dx, dy)

            # هاله نرم پشت پر
            glow_a = max(0.0, 1 - dist / (bbox)) ** 2 * 0.45
            if glow_a > 0:
                blend(buf, W, xx, yy, *GLOW, glow_a)

            # شکل پر
            t = (yy - top) / fh
            if 0 <= t <= 1:
                hw = maxw * math.sin(math.pi * (t ** 0.85)) * (1 - 0.25 * t)
                if hw > 1 and abs(dx) <= hw:
                    col = GOLD if t < 0.4 else (ORANGE if t < 0.72 else RED)
                    nxt = ORANGE if t < 0.4 else (RED if t < 0.72 else RED)
                    seg = (t / 0.4) if t < 0.4 else ((t - 0.4) / 0.32 if t < 0.72 else 0)
                    color = mix(col, nxt, min(1, seg))
                    # بافت پرها: راه‌راه مورب
                    barb = 0.82 + 0.18 * abs(math.sin((abs(dx) - dy * 0.6) * 0.10))
                    edge = 1 - (abs(dx) / hw) ** 3      # نرمی لبه‌ها
                    color = tuple(int(c * barb) for c in color)
                    blend(buf, W, xx, yy, *color, min(1, edge + 0.15))

    # شاخه مرکزی روشن (rachis)
    for yy in range(int(top), int(top + fh)):
        if 0 <= yy < H:
            blend(buf, W, cx, yy, 255, 250, 220, 0.9)
            blend(buf, W, cx - 1, yy, 255, 240, 200, 0.5)


def make_icon():
    W = H = 1024
    buf = bytearray(W * H * 4)
    # پس‌زمینه گرد شب‌رنگ
    top = (26, 34, 56)      # #1a2238
    bot = (11, 16, 38)      # #0b1026
    fill_vertical_gradient(buf, W, H, top, bot)
    # حلقه طلایی تزئینی
    cx = cy = W / 2
    for ang in range(0, 3600):
        a = ang / 10 * math.pi / 180
        for rr in range(int(W * 0.46), int(W * 0.47)):
            x = cx + math.cos(a) * rr
            y = cy + math.sin(a) * rr
            if 0 <= x < W and 0 <= y < H:
                blend(buf, W, x, y, 217, 182, 90, 0.8)
    draw_emblem(buf, W, H, cx, cy * 1.02, H * 0.62)
    write_png(os.path.join(OUT, "icon.png"), W, H, buf)
    # نام مورد انتظار @capacitor/assets برای آیکون کامل
    write_png(os.path.join(OUT, "icon-only.png"), W, H, buf)
    # نسخه وب برای favicon (در پوشه assets که در دمو منتشر می‌شود)
    web = os.path.join(ROOT, "assets")
    os.makedirs(web, exist_ok=True)
    write_png(os.path.join(web, "icon.png"), W, H, buf)
    print("✓ resources/icon.png + icon-only.png + assets/icon.png")


def make_icon_background():
    # پس‌زمینه ساده برای آیکون تطبیقی اندروید
    W = H = 1024
    buf = bytearray(W * H * 4)
    fill_vertical_gradient(buf, W, H, (26, 34, 56), (11, 16, 38))
    write_png(os.path.join(OUT, "icon-background.png"), W, H, buf)
    print("✓ resources/icon-background.png")


def make_icon_foreground():
    # نسخه شفاف برای آیکون تطبیقی اندروید (فقط پر، بدون پس‌زمینه)
    W = H = 1024
    buf = bytearray(W * H * 4)  # شفاف
    draw_emblem(buf, W, H, W / 2, H / 2, H * 0.5)
    write_png(os.path.join(OUT, "icon-foreground.png"), W, H, buf)
    print("✓ resources/icon-foreground.png")


def make_splash():
    W = H = 2732
    buf = bytearray(W * H * 4)
    top = (43, 36, 56)
    bot = (26, 34, 56)
    fill_vertical_gradient(buf, W, H, top, bot)
    draw_emblem(buf, W, H, W / 2, H / 2, H * 0.42)
    write_png(os.path.join(OUT, "splash.png"), W, H, buf)
    write_png(os.path.join(OUT, "splash-dark.png"), W, H, buf)
    print("✓ resources/splash.png + splash-dark.png")


if __name__ == "__main__":
    make_icon()
    make_icon_foreground()
    make_icon_background()
    make_splash()
    print("تمام شد — تصاویر در پوشه resources/ ساخته شدند.")
