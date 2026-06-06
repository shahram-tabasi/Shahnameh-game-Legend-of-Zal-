// menu.js — صفحهٔ اصلی (نام بازی: شاهنامه — فصل اول: افسانه زال)
'use strict';

class MenuScene extends Scene {
  enter() {
    const W = this.game.width;
    this.t = 0;
    this.bg = new Image();
    this.bgLoaded = false;
    this.bg.onload = () => { this.bgLoaded = true; };
    this.bg.src = 'assets/poster.png';

    this.startBtn = new UIButton(W / 2 - 140, 300, 280, 54, 'شروع بازی', { size: 26 });
    this.galleryBtn = new UIButton(W / 2 - 140, 364, 280, 44, 'گالری شخصیت‌ها', { size: 20 });
    this.aboutBtn = new UIButton(W / 2 - 140, 414, 280, 44, 'داستان و راهنما', { size: 20 });
  }

  update(dt) {
    this.t += dt;
    if (this.startBtn.update()) { Sound.select(); this.game.scenes.go('stageSelect'); }
    if (this.galleryBtn.update()) { Sound.select(); this.game.scenes.go('gallery'); }
    if (this.aboutBtn.update()) { Sound.select(); this.game.scenes.go('about'); }
    if (Input.just('confirm')) { Sound.select(); this.game.scenes.go('stageSelect'); }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;

    // پس‌زمینه: پوستر (cover) + لایهٔ تیره
    ctx.fillStyle = '#0b0d1a'; ctx.fillRect(0, 0, W, H);
    if (this.bgLoaded) {
      const iw = this.bg.width, ih = this.bg.height;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(this.bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    ctx.fillStyle = 'rgba(8,10,20,0.5)'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(8,10,20,0.92)');
    g.addColorStop(0.32, 'rgba(8,10,20,0.3)');
    g.addColorStop(0.6, 'rgba(8,10,20,0.5)');
    g.addColorStop(1, 'rgba(8,10,20,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // نام بازی: شاهنامه
    ctx.save();
    ctx.shadowColor = 'rgba(217,182,90,0.9)'; ctx.shadowBlur = 30;
    Utils.text(ctx, 'شاهنامه', W / 2, 86, 64, '#f2d97a', 'center', '700');
    ctx.restore();
    // فصل اول
    Utils.text(ctx, '✦ فصل اول ✦', W / 2, 138, 17, '#caa15a', 'center', '500');
    ctx.save();
    ctx.shadowColor = 'rgba(217,182,90,0.5)'; ctx.shadowBlur = 14;
    Utils.text(ctx, 'افسانهٔ زال', W / 2, 172, 30, '#e8d8b0', 'center', '700');
    ctx.restore();

    this.startBtn.render(ctx);
    this.galleryBtn.render(ctx);
    this.aboutBtn.render(ctx);

    Utils.text(ctx, 'برگرفته از شاهنامهٔ فردوسی', W / 2, H - 18, 13, '#9a9ab0');
  }
}
