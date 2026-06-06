// utils.js — توابع کمکی عمومی
'use strict';

const Utils = {
  clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); },

  lerp(a, b, t) { return a + (b - a) * t; },

  rand(min, max) { return min + Math.random() * (max - min); },

  randInt(min, max) { return Math.floor(Utils.rand(min, max + 1)); },

  // برخورد مستطیلی (AABB)
  aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  },

  // رنگ با شفافیت
  rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; },

  // متن فارسی وسط‌چین
  text(ctx, str, x, y, size, color, align = 'center', font = 'Tahoma') {
    ctx.fillStyle = color;
    ctx.font = `${size}px ${font}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  },

  // مستطیل گرد
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
};

// اطلاعات همه مراحل بازی — منبع واحد حقیقت برای منو و انتخاب مرحله
const STAGES = [
  { id: 1, title: 'کودک رهاشده',     env: 'کوه البرز',   boss: 'گرگ پیر کوهستان',     playable: true,
    desc: 'سام نوزاد سپیدمو را در کوه رها می‌کند؛ زال باید تا سکوی مقدس سیمرغ بالا برود.' },
  { id: 2, title: 'پرواز سیمرغ',      env: 'آسمان البرز',  boss: 'طوفان بزرگ البرز',     playable: true,
    desc: 'سوار بر سیمرغ، جاخالی از صاعقه و عبور از طوفان و تنگه‌های سنگی.' },
  { id: 3, title: 'نجات بچه عقاب',    env: 'کوه البرز',   boss: 'شیر کوهستان',          playable: true,
    desc: 'نجات بچه عقاب از چنگال شیر؛ پاداش: همراهی عقاب ایرانی.' },
  { id: 4, title: 'بازگشت به ایران',  env: 'دربار شاه',   boss: 'پهلوان نامدار دربار',  playable: true,
    desc: 'آموزش کشتی، شمشیرزنی و تیراندازی؛ دریافت لقب پهلوان زابل.' },
  { id: 5, title: 'کفتار دشت زابل',   env: 'زابلستان',    boss: 'کفتار غول‌پیکر زابل',  playable: true,
    desc: 'تعقیب ردپا و شکار هیولایی که روستاها را نابود می‌کند.' },
  { id: 6, title: 'عشق رودابه',       env: 'شهر کابل',    boss: 'فرمانده محافظان مهراب',playable: true,
    desc: 'نفوذ مخفیانه، بالا رفتن از دیوار قصر و دیدار با رودابه.' },
  { id: 7, title: 'فرمانروای زابل',   env: 'نقشه جهان',   boss: 'دیو کوهستان / سردار شورشی', playable: true,
    desc: 'دفاع از مرزها، سرکوب شورش‌ها و نبرد با دیوان.' },
  { id: 8, title: 'تولد رستم',        env: 'پر سیمرغ',    boss: 'غول صحرا',             playable: true,
    desc: 'فرار سواره با تایمر برای رسیدن به پر سیمرغ و تولد رستم.' }
];
