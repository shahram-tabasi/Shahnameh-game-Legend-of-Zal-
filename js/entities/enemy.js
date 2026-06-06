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
    } else if (type === 'cat') {
      this.w = 46; this.h = 30; this.speed = 95; this.hp = 1; this.dmg = 1;
    } else { // wolf
      this.w = 54; this.h = 34; this.speed = 70; this.hp = 1; this.dmg = 1;
    }
    this.maxHp = this.hp;
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

    // باس به سمت بازیکن حمله می‌کند، بقیه گشت می‌زنند
    if (this.type === 'boss') {
      this.dir = player.x < this.x ? -1 : 1;
      this.x += this.dir * this.speed * dt;
    } else {
      this.x += this.dir * this.speed * dt;
      if (this.x < this.spawnX - this.patrol) this.dir = 1;
      if (this.x > this.spawnX + this.patrol) this.dir = -1;
    }

    this._applyGravity(dt, level);
  }

  _applyGravity(dt, level) {
    this.y += 6;  // چسبیدن به زمین
    for (const p of level.platforms) {
      if (Utils.aabb(this.bounds, p) && this.y + this.h - p.y < 24) {
        this.y = p.y - this.h;
      }
    }
  }

  render(ctx) {
    if (!this.alive) return;
    const wobble = Math.sin(this.animT * 10) * 2;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y);
    ctx.scale(this.dir, 1);

    let body, accent;
    if (this.type === 'boss') { body = '#4a3b2a'; accent = '#8a1c1c'; }
    else if (this.type === 'cat') { body = '#b06a2c'; accent = '#3a2410'; }
    else { body = '#6b6b73'; accent = '#3a3a40'; }

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
    // چشم
    ctx.fillStyle = this.stunned > 0 ? '#ffd700' : '#ff4040';
    ctx.beginPath();
    ctx.arc(this.w / 2 - 6, 12, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // نوار جان باس
    if (this.type === 'boss') {
      ctx.scale(this.dir, 1); // بازگرداندن جهت برای متن
      ctx.fillStyle = '#400';
      ctx.fillRect(-this.w / 2, -16, this.w, 6);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-this.w / 2, -16, this.w * (this.hp / this.maxHp), 6);
    }

    // نشان سرگرم‌شدن با عقاب
    if (this.stunned > 0) {
      ctx.scale(this.dir, 1);
      Utils.text(ctx, '❗', 0, -22, 16, '#ffd700');
    }
    ctx.restore();
  }
}
