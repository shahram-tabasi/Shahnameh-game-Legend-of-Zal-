// stageSelect.js — انتخاب مرحله روی نقشه (دکمه‌های قرمز روی مسیر)
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

    // مرکز هر مدالیون (برای ناحیهٔ کلیک) — شماره و عنوان از قبل روی نقشه هست
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
    this.redOff = 0.108;                 // فاصلهٔ نقطهٔ قرمز (پایین مدالیون، روی مسیر)
    this.startPos = { u: 0.305, v: 0.215 };

    // دکمهٔ بازگشت داخل کادر، زیر عنوان «افسانه زال»
    const r = this._rect();
    this.backBtn = new UIButton(r.x + 0.035 * r.dw, r.y + 0.155 * r.dh, 86, 30, '‹ بازگشت', { size: 15 });
    this.hover = -1;

    this._fallbackCards();
  }

  _fallbackCards() {
    const W = this.game.width;
    this.cards = [];
    const cols = 4, cw = 200, ch = 120, gap = 18;
    const startX = (W - (cols * cw + (cols - 1) * gap)) / 2;
    STAGES.forEach((st, i) => {
      this.cards.push({ st, x: startX + (i % cols) * (cw + gap), y: 150 + Math.floor(i / cols) * (ch + gap), w: cw, h: ch });
    });
  }

  _rect() {
    const W = this.game.width, H = this.game.height;
    const iw = (this.img && this.img.width) || 1535, ih = (this.img && this.img.height) || 1024;
    const s = Math.min(W / iw, H / ih);
    const dw = iw * s, dh = ih * s;
    return { x: (W - dw) / 2, y: (H - dh) / 2, dw, dh };
  }

  _nodePos(n, r) { return { x: r.x + n.u * r.dw, y: r.y + n.v * r.dh }; }
  _redPos(n, r) { return { x: r.x + n.u * r.dw, y: r.y + (n.v + this.redOff) * r.dh }; }
  _hitRadius(r) { return 0.12 * r.dh; }

  update(dt) {
    this.t += dt;
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('menu'); }

    if (this.loaded) {
      const r = this._rect();
      const hit = this._hitRadius(r);
      this.hover = -1;
      this.nodes.forEach((n, i) => {
        const p = this._nodePos(n, r);
        if (Math.hypot(Input.pointer.x - p.x, Input.pointer.y - p.y) < hit) {
          this.hover = i;
          if (Input.pointer.justDown) { Sound.select(); this.game.scenes.go('stage' + n.id); }
        }
      });
    } else if (this.failed) {
      for (const c of this.cards) {
        if (Input.pointer.justDown && Input.pointer.x >= c.x && Input.pointer.x <= c.x + c.w &&
            Input.pointer.y >= c.y && Input.pointer.y <= c.y + c.h) {
          Sound.select(); this.game.scenes.go('stage' + c.st.id);
        }
      }
    }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);

    if (this.loaded) {
      const r = this._rect();
      ctx.drawImage(this.img, r.x, r.y, r.dw, r.dh);
      this._start(ctx, r);
      this._redButtons(ctx, r);
    } else if (this.failed) {
      this._fallbackRender(ctx, W, H);
    } else {
      Utils.text(ctx, 'در حال بارگذاری نقشه…', W / 2, H / 2, 20, '#d9b65a');
    }

    this.backBtn.render(ctx);
  }

  // درخشش روی START
  _start(ctx, r) {
    const p = { x: r.x + this.startPos.u * r.dw, y: r.y + this.startPos.v * r.dh };
    const pulse = 0.5 + Math.sin(this.t * 4) * 0.5;
    ctx.save();
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 34);
    g.addColorStop(0, 'rgba(255,225,140,' + (0.45 + pulse * 0.3) + ')');
    g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // دکمه‌های قرمز روی نقطه‌های مسیر
  _redButtons(ctx, r) {
    this.nodes.forEach((n, i) => {
      const p = this._redPos(n, r);
      const on = this.hover === i;
      const pulse = 0.5 + Math.sin(this.t * 3 + i) * 0.5;
      const rad = on ? 11 : 8.5;
      // هاله
      ctx.save();
      ctx.shadowColor = 'rgba(255,60,50,0.9)'; ctx.shadowBlur = on ? 18 : 8 + pulse * 6;
      // بدنهٔ دکمه (گرادیان قرمز براق)
      const g = ctx.createRadialGradient(p.x - 2, p.y - 3, 1, p.x, p.y, rad);
      g.addColorStop(0, on ? '#ff8a7a' : '#ff5a4a');
      g.addColorStop(1, on ? '#b81d1d' : '#8a1212');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,230,180,0.85)';
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.stroke();
      // برق
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(p.x - rad * 0.3, p.y - rad * 0.35, rad * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  _fallbackRender(ctx, W, H) {
    Utils.text(ctx, 'انتخاب مرحله', W / 2, 60, 30, '#f0d878', 'center', '700');
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
