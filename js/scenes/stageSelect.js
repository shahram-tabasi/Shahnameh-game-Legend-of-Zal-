// stageSelect.js — انتخاب مرحله روی نقشهٔ بازی (با گره‌های کلیک‌پذیر)
'use strict';

class StageSelectScene extends Scene {
  enter() {
    this.t = 0;
    this.loaded = false;
    this.failed = false;
    this.img = new Image();
    this.img.onload = () => { this.loaded = true; };
    this.img.onerror = () => { this.failed = true; };
    this.img.src = 'assets/map.png';

    // موقعیت گره‌ها به‌صورت کسری از تصویر نقشه (۰..۱) — مطابق چیدمان نقشه
    // در صورت نیاز به جابه‌جایی، فقط همین u/v را تغییر بده.
    this.nodes = [
      { id: 1, u: 0.410, v: 0.165 },
      { id: 2, u: 0.575, v: 0.285 },
      { id: 3, u: 0.823, v: 0.290 },
      { id: 4, u: 0.726, v: 0.560 },
      { id: 5, u: 0.546, v: 0.550 },
      { id: 6, u: 0.345, v: 0.668 },
      { id: 7, u: 0.542, v: 0.800 },
      { id: 8, u: 0.708, v: 0.835 }
    ];
    this.faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸'];

    this.backBtn = new UIButton(14, 16, 96, 38, '‹ بازگشت', { size: 16 });
    this.hover = -1;

    // چیدمان جایگزین (اگر نقشه بارگذاری نشد): فهرست ساده
    this._fallbackCards();
  }

  _fallbackCards() {
    const W = this.game.width;
    this.cards = [];
    const cols = 4, cw = 200, ch = 120, gap = 18;
    const totalW = cols * cw + (cols - 1) * gap;
    const startX = (W - totalW) / 2;
    STAGES.forEach((st, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      this.cards.push({ st, x: startX + col * (cw + gap), y: 150 + row * (ch + gap), w: cw, h: ch });
    });
  }

  // مستطیل ترسیم نقشه (حالت contain) و کمک برای موقعیت گره‌ها
  _rect() {
    const W = this.game.width, H = this.game.height;
    const iw = this.img.width || 1535, ih = this.img.height || 1024;
    const s = Math.min(W / iw, H / ih);
    const dw = iw * s, dh = ih * s;
    return { x: (W - dw) / 2, y: (H - dh) / 2, dw, dh };
  }

  _nodePos(n, r) { return { x: r.x + n.u * r.dw, y: r.y + n.v * r.dh }; }
  _nodeRadius(r) { return 0.066 * r.dw; }   // هم‌اندازه با دایرهٔ نقاشی‌شدهٔ نقشه

  update(dt) {
    this.t += dt;
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('menu'); }

    if (this.loaded) {
      const r = this._rect();
      const rad = this._nodeRadius(r);
      this.hover = -1;
      this.nodes.forEach((n, i) => {
        const p = this._nodePos(n, r);
        const d = Math.hypot(Input.pointer.x - p.x, Input.pointer.y - p.y);
        if (d < rad) {
          this.hover = i;
          if (Input.pointer.justDown) { Sound.select(); this.game.scenes.go('stage' + n.id); }
        }
      });
    } else if (this.failed) {
      for (const c of this.cards) {
        const hit = Input.pointer.justDown &&
          Input.pointer.x >= c.x && Input.pointer.x <= c.x + c.w &&
          Input.pointer.y >= c.y && Input.pointer.y <= c.y + c.h;
        if (hit) { Sound.select(); this.game.scenes.go('stage' + c.st.id); }
      }
    }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);

    if (this.loaded) {
      const r = this._rect();
      ctx.drawImage(this.img, r.x, r.y, r.dw, r.dh);
      this._nodes(ctx, r);
    } else if (this.failed) {
      this._fallbackRender(ctx, W, H);
    } else {
      Utils.text(ctx, 'در حال بارگذاری نقشه…', W / 2, H / 2, 20, '#d9b65a');
    }

    this.backBtn.render(ctx);
  }

  _nodes(ctx, r) {
    // فقط یک هالهٔ ظریف هم‌تراز با دایرهٔ هر مرحله (شماره و عنوان از قبل روی نقشه هست)
    const rad = this._nodeRadius(r);
    this.nodes.forEach((n, i) => {
      const p = this._nodePos(n, r);
      const on = this.hover === i;
      const pulse = 0.5 + Math.sin(this.t * 3 + i) * 0.5;
      ctx.save();
      ctx.globalAlpha = on ? 1 : 0.30 + pulse * 0.18;
      ctx.shadowColor = '#ffd277'; ctx.shadowBlur = on ? 26 : 12;
      ctx.lineWidth = on ? 4 : 2.5;
      ctx.strokeStyle = on ? '#ffe9a8' : 'rgba(255,210,120,0.85)';
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  _fallbackRender(ctx, W, H) {
    Utils.text(ctx, 'انتخاب مرحله', W / 2, 60, 30, '#f0d878');
    for (const c of this.cards) {
      const hover = Input.pointer.x >= c.x && Input.pointer.x <= c.x + c.w &&
                    Input.pointer.y >= c.y && Input.pointer.y <= c.y + c.h;
      Utils.roundRect(ctx, c.x, c.y, c.w, c.h, 12);
      ctx.fillStyle = hover ? Utils.rgba(217, 182, 90, 0.15) : Utils.rgba(20, 26, 48, 0.85);
      ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#d9b65a'; ctx.stroke();
      Utils.text(ctx, c.st.id + '. ' + c.st.title, c.x + c.w / 2, c.y + 44, 18, '#f0e8d0');
      Utils.text(ctx, c.st.env, c.x + c.w / 2, c.y + 72, 14, '#9aa0b8');
      Utils.text(ctx, '▶ بازی', c.x + c.w / 2, c.y + 98, 13, '#7ec07e');
    }
  }
}
