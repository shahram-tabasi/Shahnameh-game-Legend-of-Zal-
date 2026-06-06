// stage1.js — مرحله ۱: کودک رهاشده (کوه البرز) — کاملاً قابل بازی
'use strict';

class Stage1Scene extends Scene {
  enter() {
    this.gravity = 1700;
    this.state = 'intro';      // intro | play | dead | win
    this.timer = 0;
    this.score = 0;
    this.bossDefeated = false;

    this._buildLevel();

    this.cam = { x: 0, y: 0 };
    this.retryBtn = new UIButton(this.game.width / 2 - 110, 320, 220, 50, 'تلاش دوباره', { size: 22 });
    this.nextBtn = new UIButton(this.game.width / 2 - 110, 380, 220, 50, 'ادامه', { size: 22 });

    // برف برای فضاسازی کوهستان
    this.snow = Array.from({ length: 80 }, () => ({
      x: Math.random() * this.game.width, y: Math.random() * this.game.height,
      s: Math.random() * 1.5 + 0.5, vy: Math.random() * 30 + 20
    }));

    Narrator.play('stage1-intro');
  }

  _buildLevel() {
    this.level = {
      width: 3600, height: 800,
      platforms: [
        { x: -50, y: 640, w: 900, h: 200 },
        { x: 980, y: 640, w: 700, h: 200 },
        { x: 1760, y: 640, w: 600, h: 200 },
        { x: 2450, y: 640, w: 1200, h: 200 },
        // سکوهای معلق
        { x: 600, y: 500, w: 140, h: 24 },
        { x: 1100, y: 480, w: 160, h: 24 },
        { x: 1350, y: 380, w: 140, h: 24 },
        { x: 1850, y: 500, w: 160, h: 24 },
        { x: 2120, y: 400, w: 160, h: 24 }
      ]
    };

    this.player = new Player(80, 560);

    this.enemies = [
      new Enemy(420, 600, 'wolf', 140),
      new Enemy(1180, 600, 'wolf', 120),
      new Enemy(1380, 348, 'cat', 60),
      new Enemy(1980, 600, 'wolf', 150),
      new Enemy(2900, 590, 'boss', 220)   // گرگ پیر کوهستان
    ];
    this.boss = this.enemies[this.enemies.length - 1];

    this.items = [
      new Item(640, 460, 'fruit'),
      new Item(1150, 440, 'water'),
      new Item(1400, 340, 'fruit'),
      new Item(1500, 590, 'water'),
      new Item(1900, 460, 'fruit'),
      new Item(2160, 360, 'water'),
      new Item(2300, 590, 'fruit')
    ];

    // سکوی مقدس سیمرغ (هدف مرحله)
    this.goal = { x: 3380, y: 540, w: 120, h: 100 };
  }

  update(dt) {
    this.timer += dt;
    Sound.resume();

    for (const s of this.snow) {
      s.y += s.vy * dt; s.x -= 12 * dt;
      if (s.y > this.game.height) { s.y = -10; s.x = Math.random() * this.game.width; }
    }

    if (this.state === 'intro') {
      if (this.timer > 3 || Input.just('jump') || Input.just('confirm') || Input.pointer.justDown)
        this.state = 'play';
      return;
    }

    if (this.state === 'play') this._updatePlay(dt);

    if (this.state === 'dead') {
      this.player.update(dt, this.level, this.gravity);
      if (this.retryBtn.update() || Input.just('confirm')) { Sound.select(); this.game.scenes.go('stage1'); }
    }

    if (this.state === 'win') {
      if (this.nextBtn.update() || Input.just('confirm')) { Sound.select(); this.game.scenes.go('stageSelect'); }
    }

    this._updateCamera();
  }

  _updatePlay(dt) {
    this.player.update(dt, this.level, this.gravity);

    // آیتم‌ها
    for (const it of this.items) {
      it.update(dt);
      if (!it.collected && Utils.aabb(this.player.bounds, it.bounds)) {
        it.collected = true;
        this.score += 10;
        if (this.player.hp < this.player.maxHp && it.kind === 'fruit') this.player.hp++;
        Sound.collect();
      }
    }

    // دشمنان
    for (const e of this.enemies) {
      e.update(dt, this.level, this.player);
      if (!e.alive) continue;
      if (Utils.aabb(this.player.bounds, e.bounds)) {
        const fromTop = this.player.vy > 0 &&
          (this.player.y + this.player.h - e.y) < 26;
        if (fromTop && e.stunned <= 0) {
          e.stomp();
          this.player.vy = -420;       // پرش پس از له‌کردن
          this.score += 20;
          if (!e.alive && e === this.boss) this.bossDefeated = true;
        } else if (e.stunned <= 0) {
          this.player.hurt(e.dmg, this.player.x < e.x ? -1 : 1);
        }
      }
    }

    if (!this.player.alive) { this.state = 'dead'; return; }

    // رسیدن به سکوی سیمرغ
    if (this.bossDefeated && Utils.aabb(this.player.bounds, this.goal)) {
      this.state = 'win';
      this.winT = 0;
      Sound.win();
      Narrator.play('stage1-win');
    }
  }

  _updateCamera() {
    const W = this.game.width, H = this.game.height;
    const tx = Utils.clamp(this.player.x + this.player.w / 2 - W / 2, 0, this.level.width - W);
    const ty = Utils.clamp(this.player.y + this.player.h / 2 - H / 2, 0, this.level.height - H);
    this.cam.x = Utils.lerp(this.cam.x, tx, 0.12);
    this.cam.y = Utils.lerp(this.cam.y, ty, 0.12);
  }

  // ---------- رندر ----------
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    this._sky(ctx, W, H);
    this._parallax(ctx, W, H);

    ctx.save();
    ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));

    this._platforms(ctx);
    this._goal(ctx);
    for (const it of this.items) it.render(ctx);
    for (const e of this.enemies) e.render(ctx);
    this.player.render(ctx);

    ctx.restore();

    this._snow(ctx);
    this._hud(ctx, W, H);

    if (this.state === 'intro') this._intro(ctx, W, H);
    if (this.state === 'dead') this._deadScreen(ctx, W, H);
    if (this.state === 'win') this._winScreen(ctx, W, H);
  }

  _sky(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a4d7a'); g.addColorStop(0.5, '#6a7ba0'); g.addColorStop(1, '#c9b8a8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  _parallax(ctx, W, H) {
    // کوه‌های دور (پارالاکس آرام)
    const px = this.cam.x * 0.3;
    ctx.fillStyle = '#7e88a8';
    ctx.beginPath(); ctx.moveTo(-px % 800 - 100, H);
    for (let i = -1; i < 4; i++) {
      const bx = -px % 800 + i * 800;
      ctx.lineTo(bx + 200, 250); ctx.lineTo(bx + 400, 380); ctx.lineTo(bx + 600, 220); ctx.lineTo(bx + 800, 360);
    }
    ctx.lineTo(W + 100, H); ctx.fill();

    // کوه‌های نزدیک‌تر با برف
    const px2 = this.cam.x * 0.55;
    ctx.fillStyle = '#5a6488';
    ctx.beginPath(); ctx.moveTo(-px2 % 700 - 100, H);
    for (let i = -1; i < 5; i++) {
      const bx = -px2 % 700 + i * 700;
      ctx.lineTo(bx + 175, 320); ctx.lineTo(bx + 350, 180); ctx.lineTo(bx + 525, 340);
    }
    ctx.lineTo(W + 100, H); ctx.fill();
  }

  _platforms(ctx) {
    for (const p of this.level.platforms) {
      // سنگ
      const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      g.addColorStop(0, '#6b5d4f'); g.addColorStop(1, '#3e352c');
      ctx.fillStyle = g;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      // لبه برفی
      ctx.fillStyle = '#e8eef5';
      ctx.fillRect(p.x, p.y, p.w, 6);
      // بافت
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
      for (let i = p.x + 20; i < p.x + p.w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, p.y + 8); ctx.lineTo(i, p.y + p.h); ctx.stroke();
      }
    }
  }

  _goal(ctx) {
    const g = this.goal;
    const pulse = 0.5 + Math.sin(this.timer * 3) * 0.5;
    // ستون نور
    const grad = ctx.createLinearGradient(0, g.y - 300, 0, g.y + g.h);
    grad.addColorStop(0, Utils.rgba(255, 200, 90, 0));
    grad.addColorStop(1, Utils.rgba(255, 160, 60, 0.35 * pulse + 0.15));
    ctx.fillStyle = grad;
    ctx.fillRect(g.x - 20, g.y - 300, g.w + 40, g.h + 300);
    // سکو
    ctx.fillStyle = '#caa15a';
    ctx.fillRect(g.x, g.y + 60, g.w, 40);
    ctx.fillStyle = '#e8c878';
    ctx.fillRect(g.x, g.y + 60, g.w, 8);
    // پر سیمرغ نورانی
    ctx.save();
    ctx.translate(g.x + g.w / 2, g.y + 30 + Math.sin(this.timer * 2) * 6);
    ctx.shadowColor = '#ff9d3a'; ctx.shadowBlur = 25;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * 7); ctx.lineTo(i > 0 ? 12 : -12, i * 7 - 6); ctx.stroke();
    }
    ctx.restore();
  }

  _snow(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const s of this.snow) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
    }
  }

  _hud(ctx, W, H) {
    // قلب‌های جان
    for (let i = 0; i < this.player.maxHp; i++) {
      const x = 24 + i * 30, y = 30;
      ctx.fillStyle = i < this.player.hp ? '#e74c3c' : 'rgba(255,255,255,0.25)';
      this._heart(ctx, x, y, 10);
    }
    // امتیاز
    Utils.text(ctx, 'امتیاز: ' + this.score, W - 24, 30, 20, '#fff', 'right');
    // عنوان مرحله
    Utils.text(ctx, 'مرحله ۱ — کودک رهاشده', W / 2, 28, 18, 'rgba(255,255,255,0.85)');

    // پیشرفت تا هدف
    const prog = Utils.clamp(this.player.x / this.goal.x, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(W / 2 - 120, 46, 240, 6);
    ctx.fillStyle = '#d9b65a'; ctx.fillRect(W / 2 - 120, 46, 240 * prog, 6);

    // راهنمای باس
    if (this.boss.alive && Math.abs(this.player.x - this.boss.x) < 600 && this.state === 'play') {
      Utils.text(ctx, '⚠ گرگ پیر کوهستان — از بالا روی سرش بپر!', W / 2, H - 30, 16, '#ffcf6a');
    }
  }

  _heart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.6);
    ctx.bezierCurveTo(x, y, x - r, y, x - r, y + r * 0.6);
    ctx.bezierCurveTo(x - r, y + r, x, y + r * 1.3, x, y + r * 1.6);
    ctx.bezierCurveTo(x, y + r * 1.3, x + r, y + r, x + r, y + r * 0.6);
    ctx.bezierCurveTo(x + r, y, x, y, x, y + r * 0.6);
    ctx.fill();
  }

  _intro(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(0, 0, 0, 0.55);
    ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'کوه البرز', W / 2, H / 2 - 50, 40, '#f0d878');
    Utils.text(ctx, 'سام نوزاد سپیدمو را در کوه رها می‌کند…', W / 2, H / 2, 22, '#e0d8c0');
    Utils.text(ctx, 'به سوی سکوی مقدس سیمرغ بالا برو', W / 2, H / 2 + 36, 18, '#c9b48a');
    const blink = 0.5 + Math.sin(this.timer * 4) * 0.5;
    ctx.globalAlpha = blink;
    Utils.text(ctx, 'برای شروع، پرش را بزن', W / 2, H / 2 + 90, 18, '#fff');
    ctx.globalAlpha = 1;
  }

  _deadScreen(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(40, 0, 0, 0.6); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'زال از پای درآمد', W / 2, 240, 44, '#e74c3c');
    Utils.text(ctx, 'امتیاز: ' + this.score, W / 2, 290, 22, '#e0d8c0');
    this.retryBtn.render(ctx);
  }

  _winScreen(ctx, W, H) {
    this.winT = (this.winT || 0) + 1 / 60;
    ctx.fillStyle = Utils.rgba(20, 10, 30, 0.6); ctx.fillRect(0, 0, W, H);

    // سیمرغ فرود می‌آید
    const y = Utils.clamp(-100 + this.winT * 90, -100, 150);
    this._simorghBig(ctx, W / 2, y, this.winT);

    Utils.text(ctx, 'سیمرغ زال را می‌پذیرد', W / 2, 300, 40, '#f0d878');
    Utils.text(ctx, 'و او را به آشیانه خود می‌برد…', W / 2, 344, 20, '#e0d8c0');
    Utils.text(ctx, 'پایان مرحله ۱  •  امتیاز نهایی: ' + this.score, W / 2, 384, 18, '#c9b48a');
    if (this.winT > 1.2) this.nextBtn.render(ctx);
  }

  _simorghBig(ctx, x, y, t) {
    const flap = Math.sin(t * 4) * 22;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#ff9d3a'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, Math.PI * 2); ctx.fill();
    ['#e74c3c', '#e67e22', '#f1c40f'].forEach((c, i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 7 - i * 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-60 - i * 12, -flap - i * 8, -110 - i * 14, 16);
      ctx.moveTo(6, 0); ctx.quadraticCurveTo(60 + i * 12, -flap - i * 8, 110 + i * 14, 16);
      ctx.stroke();
    });
    ctx.restore();
  }
}
