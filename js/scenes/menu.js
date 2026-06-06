// menu.js — صفحه اصلی
'use strict';

class MenuScene extends Scene {
  enter() {
    const W = this.game.width;
    this.t = 0;
    this.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * 300,
      r: Math.random() * 1.6 + 0.4, tw: Math.random() * Math.PI * 2
    }));
    this.startBtn = new UIButton(W / 2 - 130, 326, 260, 48, 'شروع بازی', { size: 25 });
    this.selectBtn = new UIButton(W / 2 - 130, 382, 260, 42, 'انتخاب مرحله', { size: 21 });
    this.galleryBtn = new UIButton(W / 2 - 130, 430, 260, 38, 'گالری شخصیت‌ها', { size: 19 });
    this.aboutBtn = new UIButton(W / 2 - 130, 474, 260, 38, 'داستان و راهنما', { size: 19 });
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
    // آسمان شبانه
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1026'); g.addColorStop(0.6, '#1a2238'); g.addColorStop(1, '#2a2030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // ستاره‌ها
    for (const s of this.stars) {
      const a = 0.4 + Math.sin(this.t * 2 + s.tw) * 0.4;
      ctx.fillStyle = Utils.rgba(255, 245, 210, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }

    // ماه
    ctx.fillStyle = '#f4ecd0';
    ctx.beginPath(); ctx.arc(W - 130, 90, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a2238';
    ctx.beginPath(); ctx.arc(W - 115, 80, 32, 0, Math.PI * 2); ctx.fill();

    // کوه‌های البرز
    this._mountains(ctx, W, H);

    // سیمرغ نورانی در حال پرواز
    this._simorgh(ctx, W / 2 + Math.sin(this.t * 0.5) * 120, 150 + Math.cos(this.t * 0.7) * 20, this.t);

    // عنوان
    ctx.save();
    ctx.shadowColor = '#d9b65a'; ctx.shadowBlur = 24;
    Utils.text(ctx, 'افسانه زال', W / 2, 280, 64, '#f0d878');
    ctx.restore();
    Utils.text(ctx, 'فرزند سیمرغ — برگرفته از شاهنامه فردوسی', W / 2, 326, 18, '#c9b48a');

    this.startBtn.render(ctx);
    this.selectBtn.render(ctx);
    this.galleryBtn.render(ctx);
    this.aboutBtn.render(ctx);
    Utils.text(ctx, 'دموی فنی — فصل اول', W / 2, H - 14, 12, '#7a7e95');
  }

  _mountains(ctx, W, H) {
    ctx.fillStyle = '#161d30';
    ctx.beginPath(); ctx.moveTo(0, H);
    ctx.lineTo(0, 360); ctx.lineTo(160, 240); ctx.lineTo(320, 340);
    ctx.lineTo(500, 200); ctx.lineTo(700, 330); ctx.lineTo(900, 250);
    ctx.lineTo(W, 360); ctx.lineTo(W, H); ctx.fill();
    // برف قله‌ها
    ctx.fillStyle = '#2e3a55';
    ctx.beginPath();
    ctx.moveTo(460, 240); ctx.lineTo(500, 200); ctx.lineTo(540, 240); ctx.fill();
  }

  _simorgh(ctx, x, y, t) {
    const flap = Math.sin(t * 3) * 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#ff9d3a'; ctx.shadowBlur = 30;
    // بدن
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    // بال‌های آتشین
    const colors = ['#e74c3c', '#e67e22', '#f1c40f'];
    colors.forEach((c, i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-40 - i * 8, -flap - i * 6, -70 - i * 10, 10);
      ctx.moveTo(4, 0); ctx.quadraticCurveTo(40 + i * 8, -flap - i * 6, 70 + i * 10, 10);
      ctx.stroke();
    });
    // دم بلند
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.quadraticCurveTo(0, 50, 20, 70); ctx.stroke();
    ctx.restore();
  }
}
