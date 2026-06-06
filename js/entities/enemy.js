// enemy.js — دشمنان: گرگ، گربه کوهی و باس (گرگ پیر)
'use strict';

class Enemy {
  // type: 'wolf' | 'cat' | 'boss'
  constructor(x, y, type, patrol) {
    this.type = type;
    this.x = x; this.y = y;
    this.spawnX = x;
    this.patrol = patrol || 120;   // شعاع گشت‌زنی
    this.dir = -1;
    this.alive = true;
    this.animT = 0;

    if (type === 'boss') {
      this.w = 90; this.h = 64; this.speed = 130; this.hp = 6; this.dmg = 2;
    } else if (type === 'lion') {
      this.w = 100; this.h = 70; this.speed = 150; this.hp = 7; this.dmg = 2;
    } else if (type === 'hyena') {
      this.w = 96; this.h = 58; this.speed = 165; this.hp = 7; this.dmg = 2;
    } else if (type === 'div') {            // دیو
      this.w = 76; this.h = 96; this.speed = 110; this.hp = 9; this.dmg = 2;
    } else if (type === 'champion') {       // پهلوان دربار
      this.w = 40; this.h = 60; this.speed = 120; this.hp = 5; this.dmg = 2;
    } else if (type === 'guard') {
      this.w = 34; this.h = 50; this.speed = 60; this.hp = 2; this.dmg = 1;
    } else if (type === 'cat') {
      this.w = 46; this.h = 30; this.speed = 95; this.hp = 1; this.dmg = 1;
    } else { // wolf
      this.w = 54; this.h = 34; this.speed = 70; this.hp = 1; this.dmg = 1;
    }
    this.maxHp = this.hp;
    // باس‌ها و مینی‌باس‌ها بازیکن را تعقیب می‌کنند و نوار جان دارند
    this.isBoss = ['boss', 'lion', 'hyena', 'div', 'champion'].includes(type);
    this.stunned = 0;        // وقتی عقاب سرگرمش کرده
  }

  get bounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  // ضربه از بالا (پرش روی سر دشمن)
  stomp() {
    this.hp--;
    Sound.hit();
    if (this.hp <= 0) this.alive = false;
  }

  update(dt, level, player) {
    if (!this.alive) return;
    this.animT += dt;

    if (this.stunned > 0) {     // درگیر عقاب
      this.stunned -= dt;
      this._applyGravity(dt, level);
      return;
    }

    // باس‌ها بازیکن را تعقیب می‌کنند ولی در محدودهٔ میدان خود می‌مانند؛ بقیه گشت می‌زنند
    if (this.isBoss) {
      this.dir = player.x < this.x ? -1 : 1;
      this.x += this.dir * this.speed * dt;
      this.x = Utils.clamp(this.x, this.spawnX - this.patrol, this.spawnX + this.patrol);
    } else {
      this.x += this.dir * this.speed * dt;
      if (this.x < this.spawnX - this.patrol) this.dir = 1;
      if (this.x > this.spawnX + this.patrol) this.dir = -1;
    }

    this._applyGravity(dt, level);
  }

  // چسبیدن به بالای سکویی که زیر مرکز دشمن است (بدون فرورفتن در شکاف‌ها)
  _applyGravity(dt, level) {
    const cx = this.x + this.w / 2;
    let groundTop = null;
    for (const p of level.platforms) {
      if (cx >= p.x && cx <= p.x + p.w && p.y >= this.y + this.h - 24) {
        if (groundTop === null || p.y < groundTop) groundTop = p.y;
      }
    }
    if (groundTop !== null) this.y = groundTop - this.h;
  }

  render(ctx) {
    if (!this.alive) return;
    const wobble = Math.sin(this.animT * 10) * 2;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y);
    ctx.scale(this.dir, 1);

    // دشمنان انسان‌ریخت — ظاهر متفاوت
    if (this.type === 'guard' || this.type === 'champion') { this._renderGuard(ctx); this._bossBar(ctx); this._stunMark(ctx); ctx.restore(); return; }
    if (this.type === 'div') { this._renderDiv(ctx); this._bossBar(ctx); this._stunMark(ctx); ctx.restore(); return; }

    let body, accent;
    if (this.type === 'boss') { body = '#4a3b2a'; accent = '#8a1c1c'; }
    else if (this.type === 'lion') { body = '#c9912f'; accent = '#7a4a16'; }
    else if (this.type === 'hyena') { body = '#9a8259'; accent = '#5a4a2e'; }
    else if (this.type === 'cat') { body = '#b06a2c'; accent = '#3a2410'; }
    else { body = '#6b6b73'; accent = '#3a3a40'; }

    // یال شیر
    if (this.type === 'lion') {
      ctx.fillStyle = '#8a5a1e';
      ctx.beginPath(); ctx.arc(this.w / 2 - 8, 14, this.h * 0.5, 0, Math.PI * 2); ctx.fill();
    }

    // بدن
    ctx.fillStyle = body;
    Utils.roundRect(ctx, -this.w / 2, 6 + wobble * 0.3, this.w, this.h - 6, 8);
    ctx.fill();
    // سر
    ctx.beginPath();
    ctx.arc(this.w / 2 - 8, 14, this.h * 0.32, 0, Math.PI * 2);
    ctx.fill();
    // گوش
    ctx.beginPath();
    ctx.moveTo(this.w / 2 - 14, 2);
    ctx.lineTo(this.w / 2 - 6, -8);
    ctx.lineTo(this.w / 2, 4);
    ctx.fill();
    // پاها
    ctx.fillStyle = accent;
    for (let i = 0; i < 3; i++) {
      const lx = -this.w / 2 + 8 + i * (this.w / 3.5);
      const lift = Math.sin(this.animT * 12 + i) * 3;
      ctx.fillRect(lx, this.h - 4, 6, 8 + lift);
    }
    // خال‌های کفتار
    if (this.type === 'hyena') {
      ctx.fillStyle = accent;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-this.w / 4 + i * 16, 16 + (i % 2) * 8, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // چشم
    ctx.fillStyle = this.stunned > 0 ? '#ffd700' : '#ff4040';
    ctx.beginPath();
    ctx.arc(this.w / 2 - 6, 12, 2.4, 0, Math.PI * 2);
    ctx.fill();

    this._bossBar(ctx);
    this._stunMark(ctx);
    ctx.restore();
  }

  // نوار جان (برای باس‌ها و مینی‌باس‌ها)
  _bossBar(ctx) {
    if (!this.isBoss) return;
    ctx.save();
    ctx.scale(this.dir, 1); // خنثی‌کردن آینه‌ای برای ترسیم افقی
    ctx.fillStyle = '#400';
    ctx.fillRect(-this.w / 2, -18, this.w, 6);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-this.w / 2, -18, this.w * (this.hp / this.maxHp), 6);
    ctx.restore();
  }

  // نشان سرگرم‌شدن با عقاب
  _stunMark(ctx) {
    if (this.stunned <= 0) return;
    ctx.save();
    ctx.scale(this.dir, 1);
    Utils.text(ctx, '❗', 0, -26, 16, '#ffd700');
    ctx.restore();
  }

  // ترسیم انسان‌ریخت (نگهبان / پهلوان)
  _renderGuard(ctx) {
    const w = this.w, h = this.h;
    const champ = this.type === 'champion';
    // پاها
    ctx.fillStyle = '#3a2e22';
    const step = Math.sin(this.animT * 8) * 4;
    ctx.fillRect(-8, h - 16, 6, 16 + step);
    ctx.fillRect(2, h - 16, 6, 16 - step);
    // تن (قبای جنگی / زره پهلوان)
    ctx.fillStyle = champ ? '#5a4a8a' : '#7a3b2a';
    Utils.roundRect(ctx, -w / 2, 14, w, h - 28, 5); ctx.fill();
    // کمربند
    ctx.fillStyle = '#caa15a'; ctx.fillRect(-w / 2, 26, w, 4);
    // سر و کلاهخود
    ctx.fillStyle = '#e8c39a'; ctx.beginPath(); ctx.arc(0, 8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = champ ? '#caa15a' : '#9a9aa2';
    ctx.beginPath(); ctx.arc(0, 6, 8, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-8, 4, 16, 3);
    // پر کلاهخود پهلوان
    if (champ) {
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(6, -14, 2, -20); ctx.stroke();
    }
    // سلاح
    if (this.stunned <= 0) {
      if (champ) {                       // شمشیر پهلوان
        ctx.strokeStyle = '#dfe3ea'; ctx.lineWidth = 4;
        const sw = Math.sin(this.animT * 6) * 6;
        ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(20 + sw, 2); ctx.stroke();
        ctx.fillStyle = '#caa15a'; ctx.fillRect(6, 16, 6, 4);
      } else {                           // نیزه نگهبان
        ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(16, h); ctx.stroke();
        ctx.fillStyle = '#cfcfcf'; ctx.beginPath();
        ctx.moveTo(10, -4); ctx.lineTo(14, -12); ctx.lineTo(16, -2); ctx.fill();
      }
    } else {
      // وقتی عقاب سرگرمش کرده، دست‌ها بالا (دفع عقاب)
      ctx.strokeStyle = '#e8c39a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(10, 0); ctx.stroke();
    }
    // چشم
    ctx.fillStyle = this.stunned > 0 ? '#ffd700' : '#1a2238';
    ctx.beginPath(); ctx.arc(3, 8, 1.6, 0, Math.PI * 2); ctx.fill();
  }

  // ترسیم دیو (هیولای بزرگ)
  _renderDiv(ctx) {
    const w = this.w, h = this.h;
    const breathe = Math.sin(this.animT * 4) * 2;
    // پاها
    ctx.fillStyle = '#2e2438';
    ctx.fillRect(-w / 3, h - 20, 12, 20);
    ctx.fillRect(w / 3 - 12, h - 20, 12, 20);
    // تنه تیره
    ctx.fillStyle = '#46365a';
    Utils.roundRect(ctx, -w / 2, 18 + breathe, w, h - 36, 10); ctx.fill();
    // شکم روشن‌تر
    ctx.fillStyle = '#5a4670';
    Utils.roundRect(ctx, -w / 4, 30, w / 2, h - 54, 8); ctx.fill();
    // بازوها
    ctx.strokeStyle = '#46365a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    const sw = Math.sin(this.animT * 5) * 8;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 4, 28); ctx.lineTo(-w / 2 - 6, 54 + sw); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 4, 28); ctx.lineTo(w / 2 + 6, 54 - sw); ctx.stroke();
    ctx.lineCap = 'butt';
    // سر
    ctx.fillStyle = '#46365a'; ctx.beginPath(); ctx.arc(0, 8, 14, 0, Math.PI * 2); ctx.fill();
    // شاخ‌ها
    ctx.fillStyle = '#cfc2a0';
    ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(-20, -18); ctx.lineTo(-6, -8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(20, -18); ctx.lineTo(6, -8); ctx.fill();
    // چشمان درخشان
    ctx.fillStyle = this.stunned > 0 ? '#ffd700' : '#ff5a2a';
    ctx.shadowColor = '#ff5a2a'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(-5, 8, 3, 0, Math.PI * 2); ctx.arc(5, 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // دندان‌ها
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath(); ctx.moveTo(-5, 16); ctx.lineTo(-2, 22); ctx.lineTo(0, 16); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, 16); ctx.lineTo(2, 22); ctx.lineTo(0, 16); ctx.fill();
  }
}
