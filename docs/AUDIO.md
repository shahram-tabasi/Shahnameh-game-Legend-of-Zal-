# روایت صوتی با هوش مصنوعی

داستان اول و آخر هر مرحله با **صدای نورال فارسی** خوانده می‌شود. چون این محیط به اینترنت
دسترسی ندارد، فایل‌های صوتی باید **یک‌بار روی کامپیوتر خودت** (که اینترنت دارد) ساخته شوند.

از ابزار رایگان **edge-tts** (صداهای نورال مایکروسافت، بدون کلید API) استفاده می‌کنیم.

## ساخت فایل‌های صوتی

```bash
# ۱) نصب ابزار (یک‌بار)
python3 -m pip install edge-tts

# ۲) ساخت همهٔ روایت‌ها
npm run narration
#   یا با صدای زن:
python3 scripts/gen-narration.py fa-IR-DilaraNeural
```

خروجی در `assets/audio/` ساخته می‌شود: `stage1-intro.mp3` تا `stage8-win.mp3`.

```bash
# ۳) فایل‌ها را در مخزن ثبت کن تا در بازی و دموی آنلاین پخش شوند
git add assets/audio/*.mp3 && git commit -m "افزودن فایل‌های صوتی روایت"
```

## چطور کار می‌کند
- متنِ همهٔ روایت‌ها در `assets/narration.json` است (منبع واحد).
- `npm run narration` ابتدا `js/narrationData.js` را از این JSON می‌سازد و سپس فایل‌های صوتی را تولید می‌کند.
- هنگام بازی، `js/narrator.js` ابتدا `assets/audio/<بخش>.mp3` را پخش می‌کند؛
  اگر فایل نبود، به صدای مرورگر (`speechSynthesis`) برمی‌گردد.
- ویرایش متن‌ها: فقط `assets/narration.json` را تغییر بده و دوباره `npm run narration` بزن.

## صداهای فارسی موجود
- `fa-IR-FaridNeural` (مرد) — پیش‌فرض
- `fa-IR-DilaraNeural` (زن)

## جایگزین‌ها
اگر `edge-tts` در دسترس نبود، می‌توانی از سرویس‌های دیگر (مثلاً Google Cloud TTS،
ElevenLabs یا صدای ضبط‌شدهٔ یک گوینده) استفاده کنی؛ فقط کافی است فایل‌ها با همان نام‌ها
(`stage<شماره>-intro.mp3` / `stage<شماره>-win.mp3`) در `assets/audio/` قرار گیرند.
