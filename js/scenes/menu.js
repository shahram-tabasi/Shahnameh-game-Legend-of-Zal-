// menu.js — منوی اصلی (پس‌زمینهٔ پوستر + دکمه‌های تمیز)
'use strict';

class MenuScene extends Scene {
  enter() {
    const W = this.game.width;
    this.t = 0;
    this.bg = new Image();
    this.bgLoaded = false;
    this.bg.onload = () => { this.bgLoaded = true; };
    this.bg.src = 'assets/poster.png';

    this.startBtn = new UIButton(W / 2 - 140, 250, 280, 52, 'شروع بازی', { size: 25 });
    this.selectBtn = new UIButton(W / 2 - 140, 312, 280, 46, 'انتخاب مرحله', { size: 21 });
    this.galleryBtn = new UIButton(W / 2 - 140, 366, 280, 42, 'گالری شخصیت‌ها', { size: 19 });
    this.aboutBtn = new UIButton(W / 2 - 140, 414, 280, 42, 'داستان و راهنما', { size: 19 });
  }

  update(dt) {
    this.t += dt;
    if (this.startBtn.update()) { Sound.select(); this.game.scenes.go('stage1'); }
    if (this.selectBtn.update()) { Sound.select(); this.game.scenes.go('stageSelect'); }
    if (this.galleryBtn.update()) { Sound.select(); this.game.scenes.go('gallery'); }
    if (this.aboutBtn.update()) { Sound.select(); this.game.scenes.go('about'); }
    if (Input.just('confirm')) this.game.scenes.go('stage1');
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;

    // پس‌زمینه: پوستر (cover، متمرکز روی قهرمان) + لایهٔ تیره برای خوانایی
    ctx.fillStyle = '#0b0d1a'; ctx.fillRect(0, 0, W, H);
    if (this.bgLoaded) {
      const iw = this.bg.width, ih = this.bg.height;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s, dh = ih * s;
      ctx.drawImage(this.bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    // تیرگی کلی + گرادیان بالا/پایین
    ctx.fillStyle = 'rgba(8,10,20,0.45)'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(8,10,20,0.85)');
    g.addColorStop(0.32, 'rgba(8,10,20,0.25)');
    g.addColorStop(0.62, 'rgba(8,10,20,0.45)');
    g.addColorStop(1, 'rgba(8,10,20,0.9)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // عنوان
    ctx.save();
    ctx.shadowColor = 'rgba(217,182,90,0.85)'; ctx.shadowBlur = 26;
    Utils.text(ctx, 'افسانه زال', W / 2, 92, 58, '#f2d97a', 'center', '700');
    ctx.restore();
    Utils.text(ctx, 'فرزند سیمرغ — برگرفته از شاهنامهٔ فردوسی', W / 2, 150, 18, '#d8c8a0', 'center', '500');

    this.startBtn.render(ctx);
    this.selectBtn.render(ctx);
    this.galleryBtn.render(ctx);
    this.aboutBtn.render(ctx);

    Utils.text(ctx, 'دموی فنی — فصل اول', W / 2, H - 18, 13, '#8a8ea5');
  }
}
