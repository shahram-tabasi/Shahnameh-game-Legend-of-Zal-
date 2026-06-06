// title.js — صفحهٔ آغازین: نمایش پوستر بازی، سپس ورود به منو
'use strict';

class TitleScene extends Scene {
  enter() {
    this.t = 0;
    this.loaded = false;
    this.failed = false;
    this.img = new Image();
    this.img.onload = () => { this.loaded = true; };
    this.img.onerror = () => { this.failed = true; };
    this.img.src = 'assets/poster.png';
  }

  update(dt) {
    this.t += dt;
    // اگر پوستر بارگذاری نشد، مستقیم به منو برو
    if (this.failed) { this.game.scenes.go('menu'); return; }
    if (this.t > 0.3 && (Input.just('jump') || Input.just('confirm') || Input.pointer.justDown)) {
      Sound.select();
      this.game.scenes.go('menu');
    }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);

    const barH = 46;                    // نوار پایین برای پیام شروع
    if (this.loaded) {
      const iw = this.img.width, ih = this.img.height;
      const scale = Math.min(W / iw, (H - barH) / ih);
      const dw = iw * scale, dh = ih * scale;
      const x = (W - dw) / 2, y = ((H - barH) - dh) / 2;
      // هالهٔ نرم پشت پوستر
      ctx.save();
      ctx.shadowColor = 'rgba(217,182,90,0.5)'; ctx.shadowBlur = 30;
      ctx.drawImage(this.img, x, y, dw, dh);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = '#d9b65a'; ctx.shadowBlur = 18;
      Utils.text(ctx, 'افسانه زال', W / 2, H / 2 - 14, 44, '#f0d878');
      ctx.restore();
      Utils.text(ctx, 'در حال بارگذاری…', W / 2, H / 2 + 30, 18, '#c9b48a');
    }

    // نوار تیره پشت پیام برای خوانایی
    const g = ctx.createLinearGradient(0, H - barH - 16, 0, H);
    g.addColorStop(0, 'rgba(8,10,20,0)'); g.addColorStop(1, 'rgba(8,10,20,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, H - barH - 16, W, barH + 16);

    const blink = 0.6 + Math.sin(this.t * 3.5) * 0.4;
    ctx.save();
    ctx.shadowColor = 'rgba(242,217,122,0.9)'; ctx.shadowBlur = 16;
    ctx.globalAlpha = blink;
    Utils.text(ctx, '▸ برای شروع لمس کنید ◂', W / 2, H - barH / 2 + 2, 22, '#f6e6b0', 'center', '700');
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
