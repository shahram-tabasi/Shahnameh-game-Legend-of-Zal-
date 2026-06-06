// storyCard.js — کارت زیبای ابتدا و پایان مرحله (عکس مدالیون + متن)
'use strict';

const StoryCard = {
  _cache: {},
  image(id) {
    if (this._cache[id]) return this._cache[id];
    const img = new Image();
    img.src = 'assets/stages/stage' + id + '.png';
    this._cache[id] = img;
    return img;
  },

  _bg(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0b1026'); g.addColorStop(0.55, '#141a30'); g.addColorStop(1, '#241a2c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },

  // عکس مدالیون به‌صورت دایره با قاب طلایی
  _medallion(ctx, id, cx, cy, r) {
    const img = this.image(id);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, cx - r, cy - r, 2 * r, 2 * r);
    else { ctx.fillStyle = '#1a2238'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    ctx.restore();
    ctx.save();
    ctx.shadowColor = 'rgba(217,182,90,0.9)'; ctx.shadowBlur = 22;
    ctx.lineWidth = 5; ctx.strokeStyle = '#d9b65a';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,240,200,0.8)';
    ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },

  // کارت ابتدای مرحله
  intro(ctx, W, H, o) {
    this._bg(ctx, W, H);
    const cx = W / 2, cy = 178, r = 104;
    this._medallion(ctx, o.id, cx, cy, r);
    Utils.text(ctx, 'مرحله ' + o.id, cx, cy + r + 30, 17, '#c9b48a', 'center', '500');
    ctx.save(); ctx.shadowColor = 'rgba(217,182,90,0.8)'; ctx.shadowBlur = 20;
    Utils.text(ctx, o.title, cx, cy + r + 66, 38, '#f2d97a', 'center', '700');
    ctx.restore();
    if (o.subtitle) Utils.text(ctx, o.subtitle, cx, cy + r + 104, 18, '#d8c8a0', 'center', '400');

    const blink = 0.55 + Math.sin(o.t * 3.5) * 0.45;
    ctx.globalAlpha = blink;
    Utils.text(ctx, '▸ برای شروع لمس کنید ◂', cx, H - 28, 19, '#f6e6b0', 'center', '700');
    ctx.globalAlpha = 1;
  },

  // کارت پایان مرحله (پیروزی)
  win(ctx, W, H, o) {
    this._bg(ctx, W, H);
    const cx = W / 2, cy = 160, r = 100;
    // پرتوهای نور پیروزی
    ctx.save(); ctx.translate(cx, cy);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = 'rgba(255,210,110,' + (0.06 + 0.05 * Math.sin(o.t * 2 + i)) + ')';
      ctx.fillRect(-5, -r - 96, 10, 84);
    }
    ctx.restore();
    this._medallion(ctx, o.id, cx, cy, r);

    ctx.save(); ctx.shadowColor = 'rgba(217,182,90,0.85)'; ctx.shadowBlur = 22;
    Utils.text(ctx, o.title, cx, cy + r + 42, 33, '#f2d97a', 'center', '700');
    ctx.restore();
    let y = cy + r + 80;
    for (const ln of (o.lines || [])) { Utils.text(ctx, ln, cx, y, 18, '#e0d8c0', 'center', '400'); y += 26; }
    if (o.score != null) Utils.text(ctx, 'امتیاز: ' + o.score, cx, y + 4, 17, '#c9b48a');

    if (o.ready) {
      const blink = 0.55 + Math.sin(o.t * 3.5) * 0.45;
      ctx.globalAlpha = blink;
      Utils.text(ctx, '▸ ادامه ◂', cx, H - 28, 20, '#f6e6b0', 'center', '700');
      ctx.globalAlpha = 1;
    }
  }
};
