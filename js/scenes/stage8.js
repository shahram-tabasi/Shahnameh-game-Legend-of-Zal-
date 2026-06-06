// stage8.js — مرحله ۸: به دنیا آمدن رستم (پر سیمرغ) — فرار سوارهٔ زال از غول صحرا
// سبک: دونده/سوارکاری با تایمر. از موانع بپر و قبل از پایان زمان به پر سیمرغ برس.
'use strict';

class Stage8Scene extends Scene {
  enter() {
    const W = this.game.width, H = this.game.height;
    this.W = W; this.H = H;
    this.groundY = H - 110;
    this.state = 'intro';      // intro | play | dead | win
    this.t = 0;
    this.dist = 0;
    this.goalDist = 4200;
    this.scroll = 330;
    this.score = 0;
    this.timeLeft = 38;        // تایمر مرحله
    this.danger = 0.32;        // نزدیکی غول صحرا (۰..۱)
    this.shake = 0;

    this.player = { x: W * 0.32, y: this.groundY - 60, vy: 0, w: 70, h: 60, onGround: true, invuln: 0 };
    this.obstacles = [];
    this.spawnTimer = 1.2;

    this.dunes = Array.from({ length: 6 }, (_, i) => ({ x: i * 220, h: Utils.rand(40, 90) }));
    this.retryBtn = new UIButton(W / 2 - 110, 340, 220, 50, 'تلاش دوباره', { size: 22 });
    this.nextBtn = new UIButton(W / 2 - 110, 392, 220, 50, 'پایان فصل', { size: 22 });

    Narrator.play('stage8-intro');
  }

  update(dt) {
    this.t += dt;
    Sound.resume();
    if (this.shake > 0) this.shake -= dt * 30;

    if (this.state === 'intro') {
      if (this.t > 0.4 && (Input.just('jump') || Input.just('confirm') || Input.pointer.justDown)) { Narrator.stop(); this.state = 'play'; }
      return;
    }
    if (this.state === 'dead') {
      if (this.retryBtn.update() || Input.just('confirm')) { Narrator.stop(); Sound.select(); this.game.scenes.go('stage8'); }
      return;
    }
    if (this.state === 'win') {
      this.winT = (this.winT || 0) + dt;
      if (this.nextBtn.update() || Input.just('confirm') || (this.winT > 0.6 && Input.pointer.justDown)) { Narrator.stop(); Sound.select(); this.game.scenes.go('menu'); }
      return;
    }
    this._updateRun(dt);
  }

  _updateRun(dt) {
    const p = this.player;

    // پرش
    if (Input.just('jump') && p.onGround) { p.vy = -780; p.onGround = false; Sound.jump(); }
    if (!Input.down('jump') && p.vy < -260) p.vy = -260;   // پرش متغیر
    p.vy += 2100 * dt;
    p.y += p.vy * dt;
    if (p.y + p.h >= this.groundY) { p.y = this.groundY - p.h; p.vy = 0; p.onGround = true; }
    if (p.invuln > 0) p.invuln -= dt;

    // پیشروی و تایمر
    this.scroll = Math.min(430, this.scroll + dt * 8);
    this.dist += this.scroll * dt;
    this.score = Math.floor(this.dist / 10);
    this.timeLeft -= dt;

    // بازیابی تدریجی فاصله از غول
    this.danger = Utils.clamp(this.danger - dt * 0.045, 0, 1);

    // پایان زمان یا گرفتارشدن = شکست
    if (this.timeLeft <= 0 || this.danger >= 1) { this.state = 'dead'; this.deadReason = this.timeLeft <= 0 ? 'time' : 'giant'; return; }

    // رسیدن به پر سیمرغ
    if (this.dist >= this.goalDist) {
      this.state = 'win'; this.winT = 0; Sound.win();
      Narrator.play('stage8-win');
      return;
    }

    this._spawn(dt);
    this._moveObstacles(dt);
  }

  _spawn(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = Utils.rand(0.9, 1.6);
    if (Math.random() < 0.6) {
      this.obstacles.push({ type: 'rock', x: this.W + 40, w: Utils.rand(34, 56), h: Utils.rand(32, 64), hit: false });
    } else {
      this.obstacles.push({ type: 'pit', x: this.W + 40, w: Utils.rand(80, 130), hit: false });
    }
  }

  _moveObstacles(dt) {
    const p = this.player;
    const pb = { x: p.x, y: p.y, w: p.w, h: p.h };
    for (const o of this.obstacles) {
      o.x -= this.scroll * dt;
      if (o.hit || p.invuln > 0) continue;

      if (o.type === 'rock') {
        const box = { x: o.x, y: this.groundY - o.h, w: o.w, h: o.h };
        if (Utils.aabb(pb, box)) this._stumble(o);
      } else { // pit — اگر روی زمین باشی و بالای گودال، می‌افتی
        if (p.onGround && p.x + p.w > o.x + 8 && p.x < o.x + o.w - 8) this._stumble(o);
      }
    }
    this.obstacles = this.obstacles.filter(o => o.x > -160);
  }

  _stumble(o) {
    o.hit = true;
    this.player.invuln = 0.8;
    this.danger = Utils.clamp(this.danger + 0.2, 0, 1);
    this.shake = 8;
    Sound.hurt();
  }

  // ---------- رندر ----------
  render(ctx) {
    const W = this.W, H = this.H;

    if (this.state === 'intro') {
      StoryCard.intro(ctx, W, H, { id: 8, title: 'به دنیا آمدن رستم', subtitle: 'صحرا — پر سیمرغ', t: this.t });
      return;
    }
    if (this.state === 'win') {
      StoryCard.win(ctx, W, H, { id: 8, title: 'رستم زاده شد!', lines: ['زال پر سیمرغ را آتش زد', 'و بزرگ‌ترین پهلوان شاهنامه زاده شد.'], score: this.score, t: this.t, ready: (this.winT || 0) > 1 });
      return;
    }

    ctx.save();
    if (this.shake > 0) ctx.translate(Utils.rand(-this.shake, this.shake), Utils.rand(-this.shake, this.shake));

    this._sky(ctx, W, H);
    this._giant(ctx);
    this._ground(ctx);
    for (const o of this.obstacles) this._obstacle(ctx, o);
    this._horse(ctx);

    ctx.restore();

    this._hud(ctx, W, H);
    if (this.state === 'dead') this._dead(ctx, W, H);
  }

  _sky(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#e8a85a'); g.addColorStop(0.5, '#e8c98a'); g.addColorStop(1, '#d8b070');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // خورشید
    ctx.fillStyle = 'rgba(255,240,200,0.8)';
    ctx.beginPath(); ctx.arc(W * 0.7, 110, 50, 0, Math.PI * 2); ctx.fill();
    // تپه‌های شنی پارالاکس
    ctx.fillStyle = '#cda468';
    for (const d of this.dunes) {
      const x = (d.x - this.dist * 0.15) % (W + 240);
      const dx = x < -120 ? x + W + 240 : x;
      ctx.beginPath(); ctx.arc(dx, this.groundY, 120, Math.PI, Math.PI * 2); ctx.fill();
    }
  }

  _ground(ctx) {
    const W = this.W, H = this.H;
    // زمین پایه
    ctx.fillStyle = '#b8945a'; ctx.fillRect(0, this.groundY, W, H - this.groundY);
    ctx.fillStyle = '#caa468'; ctx.fillRect(0, this.groundY, W, 8);
    // گودال‌ها را به‌صورت شکاف در زمین بکش
    for (const o of this.obstacles) {
      if (o.type !== 'pit') continue;
      ctx.fillStyle = '#3a2c1a';
      ctx.fillRect(o.x, this.groundY, o.w, H - this.groundY);
    }
  }

  _obstacle(ctx, o) {
    if (o.type !== 'rock') return;
    const g = ctx.createLinearGradient(0, this.groundY - o.h, 0, this.groundY);
    g.addColorStop(0, '#8a7048'); g.addColorStop(1, '#5e4a2c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(o.x, this.groundY);
    ctx.lineTo(o.x + o.w * 0.2, this.groundY - o.h);
    ctx.lineTo(o.x + o.w * 0.7, this.groundY - o.h * 0.8);
    ctx.lineTo(o.x + o.w, this.groundY);
    ctx.fill();
  }

  _giant(ctx) {
    // غول صحرا پشت سر — هرچه danger بیشتر، نزدیک‌تر و بزرگ‌تر
    const gx = Utils.lerp(-180, this.player.x - 140, this.danger);
    const scale = Utils.lerp(1.1, 1.7, this.danger);
    const sway = Math.sin(this.t * 3) * 10;
    ctx.save();
    ctx.translate(gx, this.groundY - 150 * scale);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.92;
    // تنه
    ctx.fillStyle = '#7a5a3a';
    Utils.roundRect(ctx, -50, 40, 100, 120, 16); ctx.fill();
    // سر
    ctx.beginPath(); ctx.arc(0, 24, 34, 0, Math.PI * 2); ctx.fill();
    // بازوها
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-40, 70); ctx.lineTo(-80 + sway, 130); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 70); ctx.lineTo(80 - sway, 130); ctx.stroke();
    ctx.lineCap = 'butt';
    // چشمان خشمگین
    ctx.fillStyle = '#ff4a2a'; ctx.shadowColor = '#ff4a2a'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(-12, 20, 5, 0, Math.PI * 2); ctx.arc(12, 20, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _horse(ctx) {
    const p = this.player;
    const blink = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.5;
    const gallop = Math.sin(this.t * 16) * 4;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h);

    // پاهای اسب
    ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      const lx = -26 + i * 16;
      const sw = Math.sin(this.t * 16 + i) * 8;
      ctx.beginPath(); ctx.moveTo(lx, -16); ctx.lineTo(lx + sw, 0); ctx.stroke();
    }
    // بدن اسب
    ctx.fillStyle = '#6b4423';
    Utils.roundRect(ctx, -34, -40, 64, 26, 12); ctx.fill();
    // گردن و سر
    ctx.beginPath();
    ctx.moveTo(26, -34); ctx.lineTo(40, -56); ctx.lineTo(50, -52); ctx.lineTo(36, -28); ctx.fill();
    // یال و دم
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(24, -40); ctx.lineTo(30, -54); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, -34); ctx.lineTo(-48, -20 + gallop); ctx.stroke();
    // زال سوار
    ctx.fillStyle = '#2f6f8f';
    Utils.roundRect(ctx, -10, -64, 20, 26, 5); ctx.fill();
    ctx.fillStyle = '#e8c39a'; ctx.beginPath(); ctx.arc(0, -68, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4f4f8'; ctx.beginPath(); ctx.arc(0, -72, 7, Math.PI, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _hud(ctx, W, H) {
    Utils.text(ctx, 'مرحله ۸ — فرار به‌سوی پر سیمرغ', W / 2, 26, 16, 'rgba(60,30,10,0.85)');
    Utils.text(ctx, 'امتیاز: ' + this.score, W - 24, 26, 18, '#3a2410', 'right');

    // تایمر
    const tc = this.timeLeft < 8 ? '#c0392b' : '#3a2410';
    Utils.text(ctx, '⏱ ' + Math.ceil(Math.max(0, this.timeLeft)), 30, 26, 22, tc, 'left');

    // نوار پیشرفت تا پر سیمرغ
    const prog = Utils.clamp(this.dist / this.goalDist, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(W / 2 - 130, 44, 260, 7);
    ctx.fillStyle = '#d9651b'; ctx.fillRect(W / 2 - 130, 44, 260 * prog, 7);
    Utils.text(ctx, '🪶', W / 2 + 138, 47, 16, '#c0392b', 'left');

    // نوار فاصله از غول
    Utils.text(ctx, 'غول صحرا', 30, H - 30, 13, '#7a2a1a', 'left');
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(30, H - 22, 180, 8);
    ctx.fillStyle = this.danger > 0.7 ? '#c0392b' : '#e08a3a';
    ctx.fillRect(30, H - 22, 180 * this.danger, 8);
  }

  _intro(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(0, 0, 0, 0.5); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'صحرای سوزان', W / 2, H / 2 - 60, 38, '#f0d878');
    Utils.text(ctx, 'برای زایش رستم باید پر سیمرغ را بیاوری.', W / 2, H / 2 - 16, 19, '#f0e8d0');
    Utils.text(ctx, 'سوار بر اسب از غول صحرا بگریز و از موانع بپر.', W / 2, H / 2 + 14, 18, '#f0e8d0');
    Utils.text(ctx, 'قبل از پایان زمان به پر سیمرغ برس!', W / 2, H / 2 + 44, 17, '#e8b060');
    const blink = 0.5 + Math.sin(this.t * 4) * 0.5;
    ctx.globalAlpha = blink; Utils.text(ctx, 'برای پرش، دکمه پرش را بزن', W / 2, H / 2 + 94, 18, '#fff'); ctx.globalAlpha = 1;
  }

  _dead(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(40, 10, 0, 0.6); ctx.fillRect(0, 0, W, H);
    const msg = this.deadReason === 'time' ? 'زمان تمام شد!' : 'غول صحرا به زال رسید!';
    Utils.text(ctx, msg, W / 2, 250, 40, '#e74c3c');
    Utils.text(ctx, 'امتیاز: ' + this.score, W / 2, 298, 22, '#e0d8c0');
    this.retryBtn.render(ctx);
  }

  _win(ctx, W, H) {
    this.winT = (this.winT || 0) + 1 / 60;
    ctx.fillStyle = Utils.rgba(20, 10, 30, 0.65); ctx.fillRect(0, 0, W, H);

    // پر سیمرغ در حال سوختن
    const flick = 0.7 + Math.sin(this.winT * 20) * 0.3;
    ctx.save();
    ctx.translate(W / 2, 170);
    ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 30 * flick;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 40, 0, 0, Math.PI * 2); ctx.fill();
    ['#f1c40f', '#e67e22', '#e74c3c'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(0, -40 - i * 6);
      ctx.quadraticCurveTo((10 + i * 6) * flick, -50 - i * 10, 0, -64 - i * 12);
      ctx.quadraticCurveTo((-10 - i * 6) * flick, -50 - i * 10, 0, -40 - i * 6);
      ctx.fill();
    });
    ctx.restore();

    Utils.text(ctx, 'پر سیمرغ را آتش زدی', W / 2, 250, 36, '#f0d878');
    Utils.text(ctx, 'سیمرغ پدیدار شد و روش زایمان را آموخت.', W / 2, 292, 19, '#e0d8c0');
    Utils.text(ctx, '🎉 رستم، بزرگ‌ترین پهلوان شاهنامه، زاده شد!', W / 2, 326, 20, '#ffcf6a');
    Utils.text(ctx, 'پایان فصل اول  •  امتیاز: ' + this.score, W / 2, 364, 16, '#c9b48a');
    if (this.winT > 1.4) this.nextBtn.render(ctx);
  }
}
