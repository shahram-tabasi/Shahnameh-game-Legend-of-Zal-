// stage3.js — مرحله ۳: نجات بچه عقاب (کوه البرز) — قابل بازی + مکانیک عقاب 🦅
// نگهبان‌ها راه را بسته‌اند: عقاب را به سراغ یکی بفرست (E یا دکمه عقاب)،
// تا او سرگرم شود، آن یکی را از پای درآور. اگر دیر کنی عقاب خسته می‌شود!
'use strict';

class Stage3Scene extends Scene {
  enter() {
    this.gravity = 1700;
    this.state = 'intro';
    this.timer = 0;
    this.score = 0;
    this.lionDefeated = false;

    this._buildLevel();
    this.eagle = new Eagle();

    this.cam = { x: 0, y: 0 };
    this.retryBtn = new UIButton(this.game.width / 2 - 110, 330, 220, 50, 'تلاش دوباره', { size: 22 });
    this.nextBtn = new UIButton(this.game.width / 2 - 110, 380, 220, 50, 'ادامه', { size: 22 });
    this.snow = Array.from({ length: 70 }, () => ({
      x: Math.random() * this.game.width, y: Math.random() * this.game.height,
      s: Math.random() * 1.5 + 0.5, vy: Math.random() * 30 + 20
    }));

    Narrator.play('stage3-intro');
  }

  _buildLevel() {
    this.level = {
      width: 3500, height: 800,
      platforms: [
        { x: -50, y: 640, w: 950, h: 200 },
        { x: 1000, y: 640, w: 800, h: 200 },
        { x: 1900, y: 640, w: 1650, h: 200 },
        { x: 650, y: 500, w: 150, h: 24 },
        { x: 1150, y: 470, w: 180, h: 24 },
        { x: 1500, y: 470, w: 220, h: 24 }   // ایوان نگهبان‌ها
      ]
    };

    this.player = new Player(80, 560);

    this.enemies = [
      new Enemy(450, 600, 'wolf', 140),
      new Enemy(900, 600, 'wolf', 120),
      // دو نگهبان نزدیک هم روی ایوان — اینجا عقاب لازم می‌شود
      new Enemy(1560, 420, 'guard', 40),
      new Enemy(1650, 420, 'guard', 40),
      new Enemy(2950, 570, 'lion', 240)      // شیر کوهستان
    ];
    this.lion = this.enemies[this.enemies.length - 1];

    this.items = [
      new Item(690, 460, 'fruit'),
      new Item(1200, 430, 'water'),
      new Item(1000, 590, 'fruit'),
      new Item(2100, 590, 'water'),
      new Item(2500, 590, 'fruit')
    ];

    // آشیانه بچه عقاب (هدف نجات)
    this.goal = { x: 3360, y: 540, w: 120, h: 100 };
  }

  update(dt) {
    this.timer += dt;
    Sound.resume();
    for (const s of this.snow) {
      s.y += s.vy * dt; s.x -= 12 * dt;
      if (s.y > this.game.height) { s.y = -10; s.x = Math.random() * this.game.width; }
    }

    if (this.state === 'intro') {
      if (this.timer > 0.4 && (Input.just('jump') || Input.just('confirm') || Input.pointer.justDown)) { Narrator.stop(); this.state = 'play'; }
      return;
    }
    if (this.state === 'play') this._updatePlay(dt);
    if (this.state === 'dead') {
      this.player.update(dt, this.level, this.gravity);
      if (this.retryBtn.update() || Input.just('confirm')) { Narrator.stop(); Sound.select(); this.game.scenes.go('stage3'); }
    }
    if (this.state === 'win') {
      this.winT = (this.winT || 0) + dt;
      if (this.nextBtn.update() || Input.just('confirm') || (this.winT > 0.6 && Input.pointer.justDown)) { Narrator.stop(); Sound.select(); this.game.scenes.go('stageSelect'); }
    }
    this._updateCamera();
  }

  _updatePlay(dt) {
    this.player.update(dt, this.level, this.gravity);

    // مکانیک عقاب: فراخوانی به سمت نزدیک‌ترین دشمن
    if (Input.just('eagle')) this.eagle.dispatch(this.player, this.enemies);
    this.eagle.update(dt);

    for (const it of this.items) {
      it.update(dt);
      if (!it.collected && Utils.aabb(this.player.bounds, it.bounds)) {
        it.collected = true; this.score += 10;
        if (this.player.hp < this.player.maxHp && it.kind === 'fruit') this.player.hp++;
        Sound.collect();
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.level, this.player);
      if (!e.alive) continue;
      if (Utils.aabb(this.player.bounds, e.bounds)) {
        const fromTop = this.player.vy > 0 && (this.player.y + this.player.h - e.y) < 28;
        if (e.stunned > 0) {                 // سرگرمِ عقاب — می‌توان او را کشت
          if (e.stomp()) this.score += 20;
          if (fromTop) this.player.vy = -420;
        } else if (fromTop) {
          if (e.stomp()) this.score += 20;
          this.player.vy = -420;
        } else {
          this.player.hurt(e.dmg, this.player.x < e.x ? -1 : 1);
        }
        if (!e.alive && e === this.lion) this.lionDefeated = true;
      }
    }

    if (!this.player.alive) { this.state = 'dead'; return; }

    if (this.lionDefeated && Utils.aabb(this.player.bounds, this.goal)) {
      this.state = 'win'; this.winT = 0; Sound.win();
      Narrator.play('stage3-win');
    }
  }

  _updateCamera() {
    const W = this.game.width, H = this.game.height;
    const tx = Utils.clamp(this.player.x + this.player.w / 2 - W / 2, 0, this.level.width - W);
    const ty = Utils.clamp(this.player.y + this.player.h / 2 - H / 2, 0, this.level.height - H);
    this.cam.x = Utils.lerp(this.cam.x, tx, 0.12);
    this.cam.y = Utils.lerp(this.cam.y, ty, 0.12);
  }

  render(ctx) {
    const W = this.game.width, H = this.game.height;

    if (this.state === 'intro') {
      StoryCard.intro(ctx, W, H, { id: 3, title: 'نجات بچه عقاب', subtitle: 'کوه البرز', t: this.timer });
      return;
    }
    if (this.state === 'win') {
      StoryCard.win(ctx, W, H, { id: 3, title: 'بچه عقاب نجات یافت', lines: ['عقاب ایرانی همراه زال شد.'], score: this.score, t: this.timer, ready: (this.winT || 0) > 0.8 });
      return;
    }

    this._sky(ctx, W, H);
    this._parallax(ctx, W, H);

    ctx.save();
    ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));
    this._platforms(ctx);
    this._goal(ctx);
    for (const it of this.items) it.render(ctx);
    for (const e of this.enemies) e.render(ctx);
    this.player.render(ctx);
    this.eagle.render(ctx);
    ctx.restore();

    this._snow(ctx);
    this._hud(ctx, W, H);
    if (this.state === 'dead') this._dead(ctx, W, H);
  }

  _sky(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#43577f'); g.addColorStop(0.5, '#7081a4'); g.addColorStop(1, '#cabba9');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  _parallax(ctx, W, H) {
    const px = this.cam.x * 0.4;
    ctx.fillStyle = '#5a6488';
    ctx.beginPath(); ctx.moveTo(-px % 700 - 100, H);
    for (let i = -1; i < 6; i++) {
      const bx = -px % 700 + i * 700;
      ctx.lineTo(bx + 175, 300); ctx.lineTo(bx + 350, 170); ctx.lineTo(bx + 525, 320);
    }
    ctx.lineTo(W + 100, H); ctx.fill();
  }

  _platforms(ctx) {
    for (const p of this.level.platforms) {
      const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      g.addColorStop(0, '#6b5d4f'); g.addColorStop(1, '#3e352c');
      ctx.fillStyle = g; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#e8eef5'; ctx.fillRect(p.x, p.y, p.w, 6);
    }
  }

  _goal(ctx) {
    const g = this.goal;
    const pulse = 0.5 + Math.sin(this.timer * 3) * 0.5;
    const grad = ctx.createLinearGradient(0, g.y - 200, 0, g.y + g.h);
    grad.addColorStop(0, Utils.rgba(255, 220, 120, 0));
    grad.addColorStop(1, Utils.rgba(255, 190, 80, 0.3 * pulse + 0.1));
    ctx.fillStyle = grad; ctx.fillRect(g.x - 20, g.y - 200, g.w + 40, g.h + 200);
    // آشیانه
    ctx.fillStyle = '#5a4326';
    ctx.beginPath(); ctx.ellipse(g.x + g.w / 2, g.y + 70, 50, 22, 0, 0, Math.PI * 2); ctx.fill();
    // بچه عقاب
    ctx.save();
    ctx.translate(g.x + g.w / 2, g.y + 55 + Math.sin(this.timer * 3) * 3);
    ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0ead6'; ctx.beginPath(); ctx.arc(0, -6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e0a020'; ctx.beginPath(); ctx.moveTo(5, -6); ctx.lineTo(12, -4); ctx.lineTo(5, -2); ctx.fill();
    ctx.restore();
  }

  _snow(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const s of this.snow) { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill(); }
  }

  _hud(ctx, W, H) {
    for (let i = 0; i < this.player.maxHp; i++) {
      ctx.fillStyle = i < this.player.hp ? '#e74c3c' : 'rgba(255,255,255,0.25)';
      const x = 24 + i * 26, y = 28;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    Utils.text(ctx, 'امتیاز: ' + this.score, W - 24, 28, 18, '#fff', 'right');
    Utils.text(ctx, 'مرحله ۳ — نجات بچه عقاب', W / 2, 26, 16, 'rgba(255,255,255,0.85)');

    // وضعیت عقاب
    let eagleTxt, eagleColor;
    if (this.eagle.active) { eagleTxt = '🦅 عقاب در حال سرگرم‌سازی…'; eagleColor = '#f1c40f'; }
    else if (this.eagle.cooldown > 0) { eagleTxt = '🦅 عقاب در حال بازگشت (' + this.eagle.cooldown.toFixed(1) + ')'; eagleColor = '#888'; }
    else { eagleTxt = '🦅 عقاب آماده — کلید E یا دکمه عقاب'; eagleColor = '#7ec0e8'; }
    Utils.text(ctx, eagleTxt, 24, 56, 15, eagleColor, 'left');

    if (this.lion.alive && Math.abs(this.player.x - this.lion.x) < 600 && this.state === 'play')
      Utils.text(ctx, '⚠ شیر کوهستان — از بالا روی سرش بپر!', W / 2, H - 28, 16, '#ffcf6a');
  }

  _intro(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(0, 0, 0, 0.55); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'نجات بچه عقاب', W / 2, H / 2 - 60, 38, '#f0d878');
    Utils.text(ctx, 'بچه عقاب در چنگال شیر کوهستان گرفتار است', W / 2, H / 2 - 16, 19, '#e0d8c0');
    Utils.text(ctx, '🦅 عقابت را به سراغ نگهبان بفرست تا سرگرم شود،', W / 2, H / 2 + 20, 17, '#7ec0e8');
    Utils.text(ctx, 'سپس سریع نگهبان دیگر را از پای درآور — عقاب وقت کمی دارد!', W / 2, H / 2 + 46, 17, '#7ec0e8');
    const blink = 0.5 + Math.sin(this.timer * 4) * 0.5;
    ctx.globalAlpha = blink; Utils.text(ctx, 'برای شروع، پرش را بزن', W / 2, H / 2 + 96, 18, '#fff'); ctx.globalAlpha = 1;
  }

  _dead(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(40, 0, 0, 0.6); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'زال شکست خورد', W / 2, 240, 42, '#e74c3c');
    Utils.text(ctx, 'امتیاز: ' + this.score, W / 2, 290, 22, '#e0d8c0');
    this.retryBtn.render(ctx);
  }

  _win(ctx, W, H) {
    this.winT = (this.winT || 0) + 1 / 60;
    ctx.fillStyle = Utils.rgba(20, 10, 30, 0.6); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'بچه عقاب نجات یافت!', W / 2, 240, 40, '#f0d878');
    Utils.text(ctx, 'عقاب ایرانی همراه زال می‌شود', W / 2, 286, 20, '#e0d8c0');
    Utils.text(ctx, 'پایان مرحله ۳  •  امتیاز: ' + this.score, W / 2, 326, 17, '#c9b48a');
    if (this.winT > 1) this.nextBtn.render(ctx);
  }
}
