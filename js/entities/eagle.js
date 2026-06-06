// eagle.js — عقاب همراه (مکانیک امضای بازی)
// از مرحله ۳ آزاد می‌شود: با نگه‌داشتن دکمه، عقاب یک دشمن را برای مدت محدود سرگرم می‌کند.
'use strict';

class Eagle {
  constructor() {
    this.active = false;
    this.x = 0; this.y = 0;
    this.target = null;
    this.timer = 0;           // مدت‌زمان باقیمانده سرگرم‌سازی
    this.maxTime = 3.0;       // عقاب فقط چند ثانیه می‌تواند نگه دارد
    this.cooldown = 0;
    this.t = 0;
  }

  // فراخوانی عقاب به سمت نزدیک‌ترین دشمن جلوی بازیکن
  dispatch(player, enemies) {
    if (this.active || this.cooldown > 0) return false;
    let best = null, bestD = 480;          // بُرد فراخوانی
    for (const e of enemies) {
      if (!e.alive || e.stunned > 0) continue;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (!best) return false;
    this.active = true;
    this.target = best;
    this.timer = this.maxTime;
    this.x = player.x; this.y = player.y - 40;
    Sound.eagle();
    return true;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (!this.active) return;
    this.t += dt;

    if (!this.target || !this.target.alive) { this._end(false); return; }

    // پرواز به سمت هدف و سرگرم‌نگه‌داشتن آن
    this.x = Utils.lerp(this.x, this.target.x + this.target.w / 2, 0.2);
    this.y = Utils.lerp(this.y, this.target.y - 24, 0.2);
    this.target.stunned = 0.15;   // تا وقتی عقاب بالای سر اوست

    this.timer -= dt;
    if (this.timer <= 0) this._end(true);  // عقاب خسته شد و شکست خورد
  }

  _end(failed) {
    this.active = false;
    this.target = null;
    this.cooldown = failed ? 2.5 : 1.0;    // اگر دیر کنی، انتظار بیشتری دارد
  }

  render(ctx) {
    if (!this.active) return;
    const flap = Math.sin(this.t * 18) * 10;
    ctx.save();
    ctx.translate(this.x, this.y);

    // بدن عقاب
    ctx.fillStyle = '#5a3a1e';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
    // سر سفید (عقاب ایرانی)
    ctx.fillStyle = '#f0ead6';
    ctx.beginPath(); ctx.arc(8, -3, 5, 0, Math.PI * 2); ctx.fill();
    // منقار
    ctx.fillStyle = '#e0a020';
    ctx.beginPath(); ctx.moveTo(13, -3); ctx.lineTo(19, -1); ctx.lineTo(13, 1); ctx.fill();
    // بال‌ها
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-18, -flap, -26, 4 - flap * 0.3);
    ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-18, flap, -26, -4 + flap * 0.3);
    ctx.stroke();

    // نوار زمان باقیمانده عقاب
    ctx.fillStyle = '#000'; ctx.fillRect(-14, -22, 28, 4);
    ctx.fillStyle = this.timer < 1 ? '#e74c3c' : '#f1c40f';
    ctx.fillRect(-14, -22, 28 * (this.timer / this.maxTime), 4);

    ctx.restore();
  }
}
