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

    const blink = 0.5 + Math.sin(this.t * 4) * 0.5;
    ctx.globalAlpha = blink;
    Utils.text(ctx, 'برای شروع لمس کنید', W / 2, H - barH / 2, 20, '#f0e8d0');
    ctx.globalAlpha = 1;
  }
}
