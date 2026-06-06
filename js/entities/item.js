// item.js — آیتم‌های جمع‌آوری: میوه و آب
'use strict';

class Item {
  // kind: 'fruit' | 'water'
  constructor(x, y, kind) {
    this.x = x; this.y = y;
    this.w = 22; this.h = 22;
    this.kind = kind;
    this.collected = false;
    this.t = Math.random() * Math.PI * 2;
  }

  get bounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  update(dt) { this.t += dt * 3; }

  render(ctx) {
    if (this.collected) return;
    const float = Math.sin(this.t) * 4;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + float;

    // هاله
    ctx.fillStyle = this.kind === 'fruit' ? Utils.rgba(220, 80, 60, 0.25) : Utils.rgba(80, 160, 220, 0.25);
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();

    if (this.kind === 'fruit') {
      ctx.fillStyle = '#d8392f';
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a7d2c'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy - 9); ctx.lineTo(cx + 4, cy - 16); ctx.stroke();
    } else {
      // قطره آب
      ctx.fillStyle = '#4aa6dc';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 11);
      ctx.bezierCurveTo(cx + 9, cy - 2, cx + 7, cy + 9, cx, cy + 9);
      ctx.bezierCurveTo(cx - 7, cy + 9, cx - 9, cy - 2, cx, cy - 11);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(cx - 2, cy + 1, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
}
