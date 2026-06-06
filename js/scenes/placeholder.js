// placeholder.js — صحنه نگه‌دارنده برای مراحلی که هنوز ساخته نشده‌اند
// طرح هر مرحله را نمایش می‌دهد تا اسکلت کامل پروژه دیده شود.
'use strict';

class PlaceholderScene extends Scene {
  enter(params) {
    this.stage = params.stage || STAGES[1];
    this.t = 0;
    this.backBtn = new UIButton(30, 24, 140, 42, '‹ انتخاب مرحله', { size: 16 });
  }

  update(dt) {
    this.t += dt;
    if (this.backBtn.update() || Input.just('back')) { Sound.select(); this.game.scenes.go('stageSelect'); }
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141a30'); g.addColorStop(1, '#2a2030');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    this.backBtn.render(ctx);

    const st = this.stage;
    Utils.text(ctx, `مرحله ${st.id}`, W / 2, 120, 22, '#9aa0b8');
    ctx.save();
    ctx.shadowColor = '#d9b65a'; ctx.shadowBlur = 18;
    Utils.text(ctx, st.title, W / 2, 165, 48, '#f0d878');
    ctx.restore();

    Utils.text(ctx, '🗺️ ' + st.env, W / 2, 215, 20, '#c9b48a');

    // جعبه توضیحات
    const bw = 620, bx = (W - bw) / 2;
    Utils.roundRect(ctx, bx, 250, bw, 110, 12);
    ctx.fillStyle = Utils.rgba(20, 26, 48, 0.7); ctx.fill();
    ctx.strokeStyle = '#3a4060'; ctx.lineWidth = 1; ctx.stroke();
    Utils.text(ctx, st.desc, W / 2, 290, 18, '#e0d8c0');
    Utils.text(ctx, '⚔️ باس مرحله: ' + st.boss, W / 2, 332, 18, '#d88a6a');

    // نشان «در دست ساخت»
    const pulse = 0.6 + Math.sin(this.t * 3) * 0.4;
    ctx.globalAlpha = pulse;
    Utils.text(ctx, 'این مرحله در نسخه کامل ساخته می‌شود', W / 2, 420, 22, '#d9b65a');
    ctx.globalAlpha = 1;
    Utils.text(ctx, 'دموی فعلی مرحله ۱ را به‌طور کامل قابل بازی نشان می‌دهد', W / 2, 460, 15, '#7a7e95');
  }
}
