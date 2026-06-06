// player.js — زال (شخصیت قابل کنترل)
'use strict';

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 28; this.h = 44;
    this.vx = 0; this.vy = 0;
    this.speed = 220;
    this.jumpPower = 560;
    this.onGround = false;
    this.facing = 1;          // ۱ راست، ۱- چپ
    this.maxHp = 5;
    this.hp = this.maxHp;
    this.invuln = 0;          // زمان بی‌آسیبی پس از ضربه
    this.animT = 0;
    this.climbing = false;
    this.alive = true;
  }

  get bounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  hurt(dmg, knockX) {
    if (this.invuln > 0 || !this.alive) return;
    this.hp -= dmg;
    this.invuln = 1.0;
    this.vy = -260;
    this.vx = knockX * 180;
    Sound.hurt();
    if (this.hp <= 0) { this.hp = 0; this.alive = false; }
  }

  update(dt, level, gravity) {
    if (!this.alive) {
      this.vy += gravity * dt;
      this.y += this.vy * dt;
      this.animT += dt;
      return;
    }

    // حرکت افقی
    let move = 0;
    if (Input.down('left')) move -= 1;
    if (Input.down('right')) move += 1;
    if (move !== 0) { this.facing = move; this.animT += dt * 8; }
    this.vx = Utils.lerp(this.vx, move * this.speed, 0.25);

    // پرش
    if (Input.just('jump') && this.onGround) {
      this.vy = -this.jumpPower;
      this.onGround = false;
      Sound.jump();
    }
    // پرش کوتاه‌تر اگر دکمه رها شد
    if (!Input.down('jump') && this.vy < -200) this.vy = -200;

    // جاذبه
    this.vy += gravity * dt;
    if (this.vy > 900) this.vy = 900;

    // حرکت + برخورد محوری
    this._moveAxis('x', this.vx * dt, level);
    this.onGround = false;
    this._moveAxis('y', this.vy * dt, level);

    if (this.invuln > 0) this.invuln -= dt;

    // سقوط از نقشه
    if (this.y > level.height + 200) this.hurt(this.maxHp, 0);
  }

  _moveAxis(axis, amount, level) {
    if (axis === 'x') this.x += amount; else this.y += amount;
    for (const p of level.platforms) {
      if (!Utils.aabb(this.bounds, p)) continue;
      if (axis === 'x') {
        if (amount > 0) this.x = p.x - this.w;
        else if (amount < 0) this.x = p.x + p.w;
        this.vx = 0;
      } else {
        if (amount > 0) { this.y = p.y - this.h; this.onGround = true; this.vy = 0; }
        else if (amount < 0) { this.y = p.y + p.h; this.vy = 0; }
      }
    }
  }

  render(ctx) {
    const blink = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.4;

    const cx = this.x + this.w / 2;
    const bob = this.onGround ? Math.sin(this.animT * 2) * 1.5 : 0;
    const y = this.y + bob;

    ctx.save();
    ctx.translate(cx, 0);
    ctx.scale(this.facing, 1);

    if (!this.alive) ctx.rotate(Math.PI / 2);

    // بدن (ردای آبی-فیروزه‌ای)
    ctx.fillStyle = '#2f6f8f';
    Utils.roundRect(ctx, -this.w / 2, y + 16, this.w, this.h - 16, 6);
    ctx.fill();
    // کمربند طلایی
    ctx.fillStyle = '#d9b65a';
    ctx.fillRect(-this.w / 2, y + 26, this.w, 4);

    // سر
    ctx.fillStyle = '#e8c39a';
    ctx.beginPath();
    ctx.arc(0, y + 8, 9, 0, Math.PI * 2);
    ctx.fill();
    // موی سپید (نشان زال)
    ctx.fillStyle = '#f4f4f8';
    ctx.beginPath();
    ctx.arc(0, y + 4, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-9, y + 4, 4, 8);
    ctx.fillRect(5, y + 4, 4, 8);
    // چشم
    if (this.alive) {
      ctx.fillStyle = '#1a2238';
      ctx.beginPath();
      ctx.arc(4, y + 9, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
