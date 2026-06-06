// stageSelect.js — انتخاب مرحله (نمای کلی ۸ مرحله فصل اول)
'use strict';

class StageSelectScene extends Scene {
  enter() {
    const W = this.game.width;
    this.cards = [];
    const cols = 4, cw = 200, ch = 150, gap = 18;
    const totalW = cols * cw + (cols - 1) * gap;
    const startX = (W - totalW) / 2;
    STAGES.forEach((st, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      this.cards.push({
        st,
        x: startX + col * (cw + gap),
        y: 120 + row * (ch + gap),
        w: cw, h: ch
      });
    });
    this.backBtn = new UIButton(30, 24, 110, 42, '‹ بازگشت', { size: 18 });
  }

  update() {
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('menu'); }
    for (const c of this.cards) {
      const hit = Input.pointer.justDown &&
        Input.pointer.x >= c.x && Input.pointer.x <= c.x + c.w &&
        Input.pointer.y >= c.y && Input.pointer.y <= c.y + c.h;
      if (hit) {
        Sound.select();
        if (c.st.playable) this.game.scenes.go('stage' + c.st.id);
        else this.game.scenes.go('placeholder', { stage: c.st });
      }
    }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#11182e'); g.addColorStop(1, '#2a2030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    Utils.text(ctx, 'فصل اول: زال، فرزند سیمرغ', W / 2, 60, 30, '#f0d878');
    this.backBtn.render(ctx);

    for (const c of this.cards) {
      const hover = Input.pointer.x >= c.x && Input.pointer.x <= c.x + c.w &&
                    Input.pointer.y >= c.y && Input.pointer.y <= c.y + c.h;
      // کارت
      Utils.roundRect(ctx, c.x, c.y, c.w, c.h, 12);
      ctx.fillStyle = hover ? Utils.rgba(217, 182, 90, 0.15) : Utils.rgba(20, 26, 48, 0.85);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.st.playable ? '#d9b65a' : '#5a6178';
      ctx.stroke();

      // شماره مرحله
      ctx.fillStyle = c.st.playable ? '#d9b65a' : '#5a6178';
      ctx.beginPath(); ctx.arc(c.x + 28, c.y + 28, 18, 0, Math.PI * 2); ctx.fill();
      Utils.text(ctx, String(c.st.id), c.x + 28, c.y + 28, 20, '#11182e');

      Utils.text(ctx, c.st.title, c.x + c.w / 2, c.y + 60, 19, '#f0e8d0');
      Utils.text(ctx, c.st.env, c.x + c.w / 2, c.y + 84, 14, '#9aa0b8');
      Utils.text(ctx, 'باس: ' + c.st.boss, c.x + c.w / 2, c.y + 108, 12, '#c08a6a');

      // وضعیت
      const label = c.st.playable ? '▶ قابل بازی' : 'به‌زودی';
      Utils.text(ctx, label, c.x + c.w / 2, c.y + 132, 13,
        c.st.playable ? '#7ec07e' : '#888');
    }
  }
}
