// gallery.js — گالری طراحی شخصیت‌ها
'use strict';

class GalleryScene extends Scene {
  enter() {
    this.t = 0;
    this.loaded = false;
    this.failed = false;
    this.img = new Image();
    this.img.onload = () => { this.loaded = true; };
    this.img.onerror = () => { this.failed = true; };
    this.img.src = 'assets/characters.png';
    this.backBtn = new UIButton(14, 16, 96, 38, '‹ بازگشت', { size: 16 });
  }

  update(dt) {
    this.t += dt;
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('menu'); }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    ctx.fillStyle = '#080a14'; ctx.fillRect(0, 0, W, H);

    if (this.loaded) {
      const iw = this.img.width, ih = this.img.height;
      const s = Math.min(W / iw, (H - 30) / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(this.img, (W - dw) / 2, 30 + ((H - 30) - dh) / 2, dw, dh);
    } else if (this.failed) {
      Utils.text(ctx, 'تصویر شخصیت‌ها یافت نشد', W / 2, H / 2, 20, '#c98a6a');
    } else {
      Utils.text(ctx, 'در حال بارگذاری…', W / 2, H / 2, 20, '#d9b65a');
    }

    Utils.text(ctx, 'گالری شخصیت‌ها', W / 2, 18, 18, '#f0d878');
    this.backBtn.render(ctx);
  }
}
