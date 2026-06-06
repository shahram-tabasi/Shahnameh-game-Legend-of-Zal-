# ساخت اپ اندروید (APK) با Capacitor

این بازی یک وب‌اپ استاتیک است و با **Capacitor** به اپ بومی اندروید تبدیل می‌شود.

## پیش‌نیازها (روی کامپیوتر خودت)
- **Node.js** نسخه ۱۸ یا بالاتر
- **Android Studio** (شامل Android SDK و JDK 17)

## مراحل ساخت

```bash
# ۱) نصب وابستگی‌ها
npm install

# ۲) ساخت پوشه www/ و افزودن پلتفرم اندروید (فقط بار اول)
npm run android:add

# ۳) همگام‌سازی (هر بار که کد بازی را تغییر دادی این را اجرا کن)
npm run android:sync

# ۴) باز کردن پروژه در Android Studio
npm run android:open
```

سپس در Android Studio:
- برای تست روی گوشی/شبیه‌ساز: دکمه **Run ▶** را بزن.
- برای ساخت فایل نصبی: منوی **Build → Build Bundle(s)/APK(s) → Build APK(s)**.
  فایل خروجی در `android/app/build/outputs/apk/` ساخته می‌شود.

## ساخت APK از خط فرمان (اختیاری)

```bash
npm run android:sync
cd android
./gradlew assembleDebug
# خروجی: android/app/build/outputs/apk/debug/app-debug.apk
```

## نکات
- شناسه اپ و نام در `capacitor.config.json` تنظیم شده است
  (`ir.shahnameh.legendofzal` / «افسانه زال»).
- آیکون و صفحه راه‌انداز (splash) را بعداً می‌توان با پلاگین
  `@capacitor/assets` از یک تصویر منبع ساخت.
- پوشه‌های `www/` و `android/` تولیدشده‌اند و در `.gitignore` قرار دارند
  (به مخزن کامیت نمی‌شوند).
