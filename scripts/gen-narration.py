#!/usr/bin/env python3
# gen-narration.py — ساخت فایل‌های صوتی روایت با صدای نورال فارسی (edge-tts، رایگان و بدون کلید)
#
# پیش‌نیاز (روی کامپیوتری که اینترنت دارد):
#     python3 -m pip install edge-tts
# اجرا:
#     python3 scripts/gen-narration.py
#     # یا انتخاب صدا:  python3 scripts/gen-narration.py fa-IR-DilaraNeural
#
# خروجی: assets/audio/<key>.mp3  (مثلاً stage1-intro.mp3)
#
# صداهای فارسی موجود:
#   fa-IR-FaridNeural   (مرد)
#   fa-IR-DilaraNeural  (زن)

import asyncio
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "narration.json")
OUT = os.path.join(ROOT, "assets", "audio")


async def main():
    try:
        import edge_tts
    except ImportError:
        sys.exit("خطا: ابتدا نصب کنید →  python3 -m pip install edge-tts")

    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)

    voice = sys.argv[1] if len(sys.argv) > 1 else data.get("_voice", "fa-IR-FaridNeural")
    rate = "-8%"   # کمی آرام‌تر برای لحن روایی

    os.makedirs(OUT, exist_ok=True)
    keys = [k for k in data if not k.startswith("_")]
    print(f"صدا: {voice}  |  {len(keys)} بخش\n")

    for key in keys:
        text = data[key]
        path = os.path.join(OUT, key + ".mp3")
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        await communicate.save(path)
        print(f"  ✓ {key}.mp3")

    print("\nتمام شد — فایل‌های صوتی در assets/audio/ ساخته شدند.")
    print("حالا آن‌ها را commit کن تا در بازی و دموی آنلاین پخش شوند.")


if __name__ == "__main__":
    asyncio.run(main())
