// platformerStage.js — کلاس پایهٔ مشترک برای مراحل پلتفرمر-مبارزه (۳ تا ۷)
// هر مرحله فقط متد config() را پیاده می‌کند و داده‌های خود را برمی‌گرداند.
'use strict';

class PlatformerStage extends Scene {
  // زیرکلاس‌ها این را بازنویسی می‌کنند
  config() { return {}; }

  enter() {
    this.cfg = this.config();
    const c = this.cfg;
    this.gravity = c.gravity || 1700;
    this.state = 'intro';
    this.timer = 0;
    this.score = 0;
    this.bossesDead = false;

    this.level = c.level;
    this.player = new Player(c.start.x, c.start.y);
    this.enemies = c.enemies.map(e => new Enemy(e.x, e.y, e.type, e.patrol));
    this.items = c.items.map(it => new Item(it.x, it.y, it.kind));
    this.goal = c.goal;
    this.bossIndices = c.bossIndices || [];

    this.hasEagle = !!c.hasEagle;
    this.eagle = this.hasEagle ? new Eagle() : null;

    this.cam = { x: 0, y: 0 };
    this.retryBtn = new UIButton(this.game.width / 2 - 110, 330, 220, 50, 'تلاش دوباره', { size: 22 });
    this.nextBtn = new UIButton(this.game.width / 2 - 110, 380, 220, 50, 'ادامه', { size: 22 });

    this._initParticles();
    Narrator.play('stage' + c.id + '-intro');
  }

  _initParticles() {
    const kind = this.cfg.particle || 'none';
    this.particles = (kind === 'none') ? [] : Array.from({ length: 70 }, () => ({
      x: Math.random() * this.game.width, y: Math.random() * this.game.height,
      s: Math.random() * 1.5 + 0.5, vy: Math.random() * 30 + 20
    }));
  }

  update(dt) {
    this.timer += dt;
    Sound.resume();
    this._updateParticles(dt);

    if (this.state === 'intro') {
      if (this.timer > 0.4 && (Input.just('jump') || Input.just('confirm') || Input.pointer.justDown)) {
        Narrator.stop(); this.state = 'play';
      }
      return;
    }
    if (this.state === 'play') this._updatePlay(dt);
    if (this.state === 'dead') {
      this.player.update(dt, this.level, this.gravity);
      if (this.retryBtn.update() || Input.just('confirm')) { Narrator.stop(); Sound.select(); this.game.scenes.go('stage' + this.cfg.id); }
    }
    if (this.state === 'win') {
      this.winT = (this.winT || 0) + dt;
      if (this.nextBtn.update() || Input.just('confirm') || (this.winT > 0.6 && Input.pointer.justDown)) {
        Narrator.stop(); Sound.select(); this.game.scenes.go('stageSelect');
      }
    }
    this._updateCamera();
  }

  _updateParticles(dt) {
    const kind = this.cfg.particle || 'none';
    for (const s of this.particles) {
      s.y += s.vy * dt;
      s.x += (kind === 'sand' ? 30 : -12) * dt;
      if (s.y > this.game.height) { s.y = -10; s.x = Math.random() * this.game.width; }
    }
  }

  _updatePlay(dt) {
    this.player.update(dt, this.level, this.gravity);

    if (this.eagle) {
      if (Input.just('eagle')) this.eagle.dispatch(this.player, this.enemies);
      this.eagle.update(dt);
    }

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
        const fromTop = this.player.vy > 0 && (this.player.y + this.player.h - e.y) < 30;
        if (e.stunned > 0) {                 // سرگرمِ عقاب — می‌توان او را از پای درآورد
          if (e.stomp()) this.score += 20;
          if (fromTop) this.player.vy = -440;
        } else if (fromTop) {
          if (e.stomp()) this.score += 20;
          this.player.vy = -440;
        } else {
          this.player.hurt(e.dmg, this.player.x < e.x ? -1 : 1);
        }
      }
    }

    // آیا همه باس‌ها شکست خورده‌اند؟
    if (!this.bossesDead && this.bossIndices.length > 0)
      this.bossesDead = this.bossIndices.every(i => !this.enemies[i].alive);
    else if (this.bossIndices.length === 0)
      this.bossesDead = true;

    if (!this.player.alive) { this.state = 'dead'; return; }

    if (this.bossesDead && Utils.aabb(this.player.bounds, this.goal)) {
      this.state = 'win'; this.winT = 0; Sound.win();
      Narrator.play('stage' + this.cfg.id + '-win');
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
    const st = STAGES[this.cfg.id - 1];

    if (this.state === 'intro') {
      StoryCard.intro(ctx, W, H, { id: this.cfg.id, title: st.title, subtitle: st.env, t: this.timer });
      return;
    }
    if (this.state === 'win') {
      StoryCard.win(ctx, W, H, { id: this.cfg.id, title: this.cfg.win.title, lines: this.cfg.win.lines, score: this.score, t: this.timer, ready: (this.winT || 0) > 0.8 });
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
    if (this.eagle) this.eagle.render(ctx);
    ctx.restore();

    this._renderParticles(ctx);
    this._hud(ctx, W, H);
    if (this.state === 'dead') this._dead(ctx, W, H);
  }

  _sky(ctx, W, H) {
    const t = this.cfg.theme;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, t.skyTop); g.addColorStop(0.5, t.skyMid); g.addColorStop(1, t.skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  _parallax(ctx, W, H) {
    const px = this.cam.x * 0.4;
    ctx.fillStyle = this.cfg.theme.mountain;
    ctx.beginPath(); ctx.moveTo(-px % 700 - 100, H);
    for (let i = -1; i < 6; i++) {
      const bx = -px % 700 + i * 700;
      ctx.lineTo(bx + 175, 300); ctx.lineTo(bx + 350, 170); ctx.lineTo(bx + 525, 320);
    }
    ctx.lineTo(W + 100, H); ctx.fill();
  }

  _platforms(ctx) {
    const t = this.cfg.theme;
    for (const p of this.level.platforms) {
      const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      g.addColorStop(0, t.platA || '#6b5d4f'); g.addColorStop(1, t.platB || '#3e352c');
      ctx.fillStyle = g; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = t.platTop || '#e8eef5'; ctx.fillRect(p.x, p.y, p.w, 6);
    }
  }

  _goal(ctx) {
    const g = this.goal;
    const pulse = 0.5 + Math.sin(this.timer * 3) * 0.5;
    const col = this.cfg.goalColor || '#ffbe50';
    const open = this.bossesDead;
    const grad = ctx.createLinearGradient(0, g.y - 220, 0, g.y + g.h);
    grad.addColorStop(0, Utils.rgba(255, 220, 120, 0));
    grad.addColorStop(1, Utils.rgba(255, 190, 80, (open ? 0.32 : 0.12) * pulse + 0.08));
    ctx.fillStyle = grad; ctx.fillRect(g.x - 20, g.y - 220, g.w + 40, g.h + 220);
    // سکوی هدف
    ctx.fillStyle = open ? '#caa15a' : '#6a6256';
    ctx.fillRect(g.x, g.y + g.h - 40, g.w, 40);
    ctx.fillStyle = open ? '#e8c878' : '#8a8276';
    ctx.fillRect(g.x, g.y + g.h - 40, g.w, 8);
    // نماد هدف
    ctx.save();
    ctx.translate(g.x + g.w / 2, g.y + 20 + Math.sin(this.timer * 2) * 6);
    if (open) { ctx.shadowColor = col; ctx.shadowBlur = 22; }
    Utils.text(ctx, this.cfg.goalIcon || '⭐', 0, 0, 40, col);
    ctx.restore();
    if (!open) Utils.text(ctx, '🔒', g.x + g.w / 2, g.y + g.h - 20, 18, '#ddd');
  }

  _renderParticles(ctx) {
    if (this.particles.length === 0) return;
    ctx.fillStyle = this.cfg.particle === 'sand' ? 'rgba(225,205,160,0.7)' : 'rgba(255,255,255,0.8)';
    for (const s of this.particles) { ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill(); }
  }

  _hud(ctx, W, H) {
    for (let i = 0; i < this.player.maxHp; i++) {
      ctx.fillStyle = i < this.player.hp ? '#e74c3c' : 'rgba(255,255,255,0.25)';
      const x = 24 + i * 26, y = 28;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    Utils.text(ctx, 'امتیاز: ' + this.score, W - 24, 28, 18, '#fff', 'right');
    Utils.text(ctx, this.cfg.name, W / 2, 26, 16, 'rgba(255,255,255,0.85)');

    if (this.eagle) {
      let txt, col;
      if (this.eagle.active) { txt = '🦅 عقاب در حال سرگرم‌سازی…'; col = '#f1c40f'; }
      else if (this.eagle.cooldown > 0) { txt = '🦅 عقاب (' + this.eagle.cooldown.toFixed(1) + ')'; col = '#888'; }
      else { txt = '🦅 عقاب آماده — E'; col = '#7ec0e8'; }
      Utils.text(ctx, txt, 24, 54, 15, col, 'left');
    }

    // راهنمای باس
    if (this.cfg.hint && !this.bossesDead && this.state === 'play') {
      const boss = this.enemies[this.bossIndices[0]];
      if (boss && boss.alive && Math.abs(this.player.x - boss.x) < 650)
        Utils.text(ctx, this.cfg.hint, W / 2, H - 28, 16, '#ffcf6a');
    }
  }

  _intro(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(0, 0, 0, 0.55); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, this.cfg.intro.title, W / 2, H / 2 - 60, 38, '#f0d878');
    let y = H / 2 - 12;
    for (const line of this.cfg.intro.lines) { Utils.text(ctx, line, W / 2, y, 18, '#e0d8c0'); y += 28; }
    const blink = 0.5 + Math.sin(this.timer * 4) * 0.5;
    ctx.globalAlpha = blink; Utils.text(ctx, 'برای شروع، پرش را بزن', W / 2, y + 24, 18, '#fff'); ctx.globalAlpha = 1;
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
    Utils.text(ctx, this.cfg.win.title, W / 2, 230, 40, '#f0d878');
    let y = 278;
    for (const line of this.cfg.win.lines) { Utils.text(ctx, line, W / 2, y, 20, '#e0d8c0'); y += 30; }
    Utils.text(ctx, 'امتیاز: ' + this.score, W / 2, y + 6, 17, '#c9b48a');
    if (this.winT > 1) this.nextBtn.render(ctx);
  }
}
