// about.js — صفحه راهنما و خلاصه داستان
'use strict';

class AboutScene extends Scene {
  enter() {
    const W = this.game.width;
    this.t = 0;
    this.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * this.game.height,
      r: Math.random() * 1.4 + 0.3, tw: Math.random() * Math.PI * 2
    }));
    this.backBtn = new UIButton(30, 24, 110, 42, '‹ بازگشت', { size: 18 });

    // خلاصه داستان زال (شکسته به خطوط برای نمایش)
    this.story = [
      'زال، پسرِ سام، با موهای سپید به دنیا آمد. سام از سرِ خرافه و',
      'شرم، نوزاد را در کوه البرز رها کرد. اما سیمرغ، مرغِ خردمندِ',
      'افسانه‌ای، او را یافت و در آشیانه خود بزرگ کرد.',
      'زال در دامان سیمرغ، خرد و هنر آموخت و با عقاب ایرانی همراه شد.',
      'سرانجام سام پشیمان شد و او را بازگرداند؛ زال پهلوانِ زابل گشت،',
      'دلباختهٔ رودابه شد، و از این عشق، رستم — بزرگ‌ترین پهلوانِ',
      'شاهنامه — زاده شد.'
    ];
  }

  update(dt) {
    this.t += dt;
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('menu'); }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1026'); g.addColorStop(1, '#2a2030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      const a = 0.3 + Math.sin(this.t * 2 + s.tw) * 0.3;
      ctx.fillStyle = Utils.rgba(255, 245, 210, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }

    this.backBtn.render(ctx);

    ctx.save();
    ctx.shadowColor = '#d9b65a'; ctx.shadowBlur = 16;
    Utils.text(ctx, 'داستان و راهنما', W / 2, 54, 34, '#f0d878');
    ctx.restore();

    // ── خلاصه داستان ──
    Utils.text(ctx, '📜 داستان', W / 2, 100, 20, '#d9b65a');
    let y = 130;
    for (const line of this.story) {
      Utils.text(ctx, line, W / 2, y, 16, '#e0d8c0');
      y += 24;
    }

    // ── کنترل‌ها (ستون راست) ──
    const colR = W - 250, colL = 60;
    Utils.text(ctx, '🎮 کنترل‌ها', colR + 130, 320, 19, '#d9b65a', 'right');
    const ctrls = [
      'حرکت: کلیدهای جهت یا A / D',
      'پرش کوتاه: ضربهٔ کوتاه به دکمهٔ پرش',
      'پرش بلند: دکمهٔ پرش را نگه دار',
      'عقاب: کلید E یا دکمه «عقاب»',
      'روی موبایل: دکمه‌های لمسی روی صفحه'
    ];
    y = 348;
    for (const c of ctrls) { Utils.text(ctx, c, colR + 130, y, 14, '#c9c2b0', 'right'); y += 24; }

    // ── مکانیک عقاب (ستون چپ) ──
    Utils.text(ctx, '🦅 مکانیک عقاب', colL + 130, 320, 19, '#7ec0e8', 'left');
    const eagle = [
      'از مرحله ۳، عقاب همراه توست.',
      'با نگه‌داشتن دکمه، عقاب یک نگهبان را',
      'سرگرم می‌کند تا تو بقیه را شکست دهی.',
      'سریع باش! اگر دیر کنی عقاب خسته',
      'می‌شود و به زمین می‌افتد.'
    ];
    y = 348;
    for (const e of eagle) { Utils.text(ctx, e, colL + 130, y, 14, '#bcd6e8', 'left'); y += 24; }

    const blink = 0.5 + Math.sin(this.t * 3) * 0.5;
    ctx.globalAlpha = blink;
    Utils.text(ctx, 'برگرفته از شاهنامهٔ فردوسی', W / 2, H - 24, 14, '#9aa0b8');
    ctx.globalAlpha = 1;
  }
}
