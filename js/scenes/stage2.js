// stage2.js — مرحله ۲: پرواز سیمرغ (آسمان البرز) — قابل بازی
// سبک: پرواز جانبی. سیمرغ با نگه‌داشتن «پرش» اوج می‌گیرد و رها که کنی پایین می‌آید.
// خطرها: صاعقه، تیر شکارچیان، تنگه‌های سنگی. باس: طوفان بزرگ البرز.
'use strict';

class Stage2Scene extends Scene {
  enter() {
    this.state = 'intro';     // intro | play | storm | dead | win
    this.t = 0;
    this.dist = 0;            // مسافت طی‌شده
    this.goalDist = 2600;    // رسیدن به این مسافت = شروع طوفان
    this.scroll = 240;        // سرعت پایه اسکرول
    this.score = 0;

    this.player = { x: this.game.width * 0.26, y: this.game.height / 2,
                    vy: 0, w: 56, h: 34, maxHp: 5, hp: 5, invuln: 0 };

    this.obstacles = [];      // {type, x, y, w, h, ...}
    this.spawnTimer = 0;
    this.stormTimer = 8;      // مدت بقا در طوفان
    this.flash = 0;           // درخشش صاعقه

    this.clouds = Array.from({ length: 14 }, () => ({
      x: Math.random() * this.game.width, y: Math.random() * this.game.height,
      s: Math.random() * 0.6 + 0.4, speed: Math.random() * 30 + 20
    }));

    this.retryBtn = new UIButton(this.game.width / 2 - 110, 330, 220, 50, 'تلاش دوباره', { size: 22 });
    this.nextBtn = new UIButton(this.game.width / 2 - 110, 380, 220, 50, 'ادامه', { size: 22 });

    Narrator.speak('آسمان البرز. سیمرغ، زال را به آشیانهٔ خود می‌برد. از صاعقه و طوفان و تیر شکارچیان بگذر.');
  }

  update(dt) {
    this.t += dt;
    Sound.resume();
    if (this.flash > 0) this.flash -= dt * 3;
    for (const c of this.clouds) {
      c.x -= c.speed * c.s * dt;
      if (c.x < -120) { c.x = this.game.width + 80; c.y = Math.random() * this.game.height; }
    }

    if (this.state === 'intro') {
      if (this.t > 2.5 || Input.just('jump') || Input.pointer.justDown) this.state = 'play';
      return;
    }
    if (this.state === 'dead') {
      if (this.retryBtn.update() || Input.just('confirm')) { Sound.select(); this.game.scenes.go('stage2'); }
      return;
    }
    if (this.state === 'win') {
      if (this.nextBtn.update() || Input.just('confirm')) { Sound.select(); this.game.scenes.go('stageSelect'); }
      return;
    }

    this._updateFlight(dt);
  }

  _updateFlight(dt) {
    const H = this.game.height;
    const p = this.player;

    // فیزیک پرواز: جاذبه رو به پایین، نگه‌داشتن پرش رو به بالا
    p.vy += 1100 * dt;                          // جاذبه
    if (Input.down('jump')) p.vy -= 1800 * dt;  // اوج گرفتن
    p.vy = Utils.clamp(p.vy, -460, 560);
    p.y += p.vy * dt;

    // باد طوفان در فاز باس
    if (this.state === 'storm') {
      p.y += Math.sin(this.t * 5) * 40 * dt + 30 * dt;
    }

    // برخورد با سقف/کف آسمان
    if (p.y < 20) { p.y = 20; p.vy = 0; }
    if (p.y + p.h > H - 20) { p.y = H - 20 - p.h; p.vy = 0; this._hurt(1); }

    if (p.invuln > 0) p.invuln -= dt;

    // پیشروی
    this.scroll = Math.min(360, this.scroll + dt * 6);
    if (this.state === 'play') {
      this.dist += this.scroll * dt;
      this.score = Math.floor(this.dist / 10);
      if (this.dist >= this.goalDist) { this.state = 'storm'; this.flash = 1; Sound.eagle(); }
    }

    this._spawn(dt);
    this._moveObstacles(dt);

    if (this.state === 'storm') {
      this.stormTimer -= dt;
      if (this.stormTimer <= 0) {
        this.state = 'win'; this.winT = 0; Sound.win();
        Narrator.speak('از طوفان بزرگ البرز گذشتی. سیمرغ زال را به آشیانه می‌رساند.');
      }
    }
  }

  _spawn(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const W = this.game.width, H = this.game.height;
    const storm = this.state === 'storm';
    this.spawnTimer = storm ? Utils.rand(0.5, 0.9) : Utils.rand(0.9, 1.5);

    const roll = Math.random();
    if (storm || roll < 0.4) {
      // صاعقه: هشدار سپس فرود
      this.obstacles.push({ type: 'lightning', x: Utils.rand(W * 0.5, W), y: 0,
        w: 14, h: H, warn: 0.8, struck: 0 });
    } else if (roll < 0.7) {
      // تیر شکارچی از سمت راست
      this.obstacles.push({ type: 'arrow', x: W + 20, y: Utils.rand(40, H - 60),
        w: 34, h: 6, vx: -420 });
    } else {
      // تنگه سنگی: یک دیواره از بالا یا پایین
      const top = Math.random() < 0.5;
      const hh = Utils.rand(90, 200);
      this.obstacles.push({ type: 'rock', x: W + 40, y: top ? 0 : H - hh,
        w: 70, h: hh, vx: -this.scroll });
    }
  }

  _moveObstacles(dt) {
    const p = this.player;
    for (const o of this.obstacles) {
      if (o.type === 'lightning') {
        if (o.warn > 0) { o.warn -= dt; if (o.warn <= 0) { o.struck = 0.35; this.flash = 0.8; Sound.hit(); } }
        else { o.struck -= dt; o.x -= this.scroll * dt; }
        if (o.struck > 0 && Utils.aabb(this._pb(), { x: o.x - 6, y: 0, w: o.w + 12, h: o.h })) this._hurt(1);
      } else {
        o.x += (o.vx || -this.scroll) * dt;
        const box = { x: o.x, y: o.y, w: o.w, h: o.h };
        if (Utils.aabb(this._pb(), box)) this._hurt(1);
      }
    }
    this.obstacles = this.obstacles.filter(o => o.x > -120 && !(o.type === 'lightning' && o.warn <= 0 && o.struck <= 0));
  }

  _pb() { return { x: this.player.x - this.player.w / 2, y: this.player.y, w: this.player.w, h: this.player.h }; }

  _hurt(dmg) {
    const p = this.player;
    if (p.invuln > 0) return;
    p.hp -= dmg; p.invuln = 1.1; Sound.hurt();
    if (p.hp <= 0) { p.hp = 0; this.state = 'dead'; }
  }

  // ---------- رندر ----------
  render(ctx) {
    const W = this.game.width, H = this.game.height;
    this._sky(ctx, W, H);
    for (const c of this.clouds) this._cloud(ctx, c);

    for (const o of this.obstacles) this._obstacle(ctx, o);
    this._simorgh(ctx);

    // درخشش صاعقه
    if (this.flash > 0) { ctx.fillStyle = Utils.rgba(255, 255, 255, this.flash * 0.5); ctx.fillRect(0, 0, W, H); }

    this._hud(ctx, W, H);
    if (this.state === 'intro') this._intro(ctx, W, H);
    if (this.state === 'storm') Utils.text(ctx, 'طوفان بزرگ البرز! دوام بیاور', W / 2, 80, 24, '#ffcf6a');
    if (this.state === 'dead') this._dead(ctx, W, H);
    if (this.state === 'win') this._win(ctx, W, H);
  }

  _sky(ctx, W, H) {
    const storm = this.state === 'storm';
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (storm) { g.addColorStop(0, '#2a2438'); g.addColorStop(1, '#4a3a4a'); }
    else { g.addColorStop(0, '#5b7bb5'); g.addColorStop(0.6, '#88a6cf'); g.addColorStop(1, '#c8d8ea'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  _cloud(ctx, c) {
    ctx.fillStyle = Utils.rgba(255, 255, 255, 0.5 * c.s);
    const r = 30 * c.s;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.arc(c.x + r, c.y + 4, r * 0.8, 0, Math.PI * 2);
    ctx.arc(c.x - r, c.y + 4, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  _obstacle(ctx, o) {
    if (o.type === 'lightning') {
      if (o.warn > 0) {
        ctx.strokeStyle = Utils.rgba(255, 230, 120, 0.5 + Math.sin(this.t * 20) * 0.4);
        ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, o.h); ctx.stroke();
        ctx.setLineDash([]);
        Utils.text(ctx, '⚡', o.x, 24, 22, '#ffe070');
      } else if (o.struck > 0) {
        ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 5; ctx.shadowColor = '#ffe070'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(o.x, 0);
        let y = 0; while (y < o.h) { y += 40; ctx.lineTo(o.x + Utils.rand(-14, 14), y); }
        ctx.stroke(); ctx.shadowBlur = 0;
      }
    } else if (o.type === 'arrow') {
      ctx.save(); ctx.translate(o.x, o.y);
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(0, -2, o.w, 4);
      ctx.fillStyle = '#cfcfcf'; ctx.beginPath();
      ctx.moveTo(-2, 0); ctx.lineTo(8, -6); ctx.lineTo(8, 6); ctx.fill();
      ctx.fillStyle = '#d8c0a0'; ctx.fillRect(o.w - 4, -5, 4, 10);
      ctx.restore();
    } else { // rock
      const g = ctx.createLinearGradient(0, o.y, 0, o.y + o.h);
      g.addColorStop(0, '#6b5d4f'); g.addColorStop(1, '#3e352c');
      ctx.fillStyle = g;
      ctx.beginPath();
      const top = o.y === 0;
      if (top) { ctx.moveTo(o.x, 0); ctx.lineTo(o.x + o.w, 0); ctx.lineTo(o.x + o.w / 2, o.h); }
      else { ctx.moveTo(o.x, o.y + o.h); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.lineTo(o.x + o.w / 2, o.y); }
      ctx.closePath(); ctx.fill();
    }
  }

  _simorgh(ctx) {
    const p = this.player;
    const blink = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.4;
    const flap = Math.sin(this.t * 12) * 16;
    ctx.save();
    ctx.translate(p.x, p.y + p.h / 2);
    ctx.shadowColor = '#ff9d3a'; ctx.shadowBlur = 18;
    // بدن سیمرغ
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
    // بال‌های آتشین
    ['#e74c3c', '#e67e22', '#f1c40f'].forEach((c, i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 5 - i * 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-30 - i * 8, -flap - i * 5, -50 - i * 8, 8);
      ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-30 - i * 8, flap + i * 5, -50 - i * 8, -8);
      ctx.stroke();
    });
    // دم
    ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-48, 0, -64, 6); ctx.stroke();
    // سر و منقار
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(18, -4, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e0a020'; ctx.beginPath(); ctx.moveTo(24, -4); ctx.lineTo(32, -2); ctx.lineTo(24, 0); ctx.fill();
    // زال سوار
    ctx.fillStyle = '#2f6f8f'; ctx.fillRect(-6, -16, 12, 12);
    ctx.fillStyle = '#f4f4f8'; ctx.beginPath(); ctx.arc(0, -18, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _hud(ctx, W, H) {
    for (let i = 0; i < this.player.maxHp; i++) {
      ctx.fillStyle = i < this.player.hp ? '#e74c3c' : 'rgba(255,255,255,0.25)';
      const x = 24 + i * 26, y = 28;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    Utils.text(ctx, 'امتیاز: ' + this.score, W - 24, 28, 18, '#fff', 'right');
    Utils.text(ctx, 'مرحله ۲ — پرواز سیمرغ', W / 2, 26, 16, 'rgba(255,255,255,0.85)');
    if (this.state === 'play') {
      const prog = Utils.clamp(this.dist / this.goalDist, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(W / 2 - 120, 42, 240, 6);
      ctx.fillStyle = '#d9b65a'; ctx.fillRect(W / 2 - 120, 42, 240 * prog, 6);
    }
    if (this.state === 'storm') {
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(W / 2 - 120, 42, 240, 6);
      ctx.fillStyle = '#e74c3c'; ctx.fillRect(W / 2 - 120, 42, 240 * Utils.clamp(this.stormTimer / 8, 0, 1), 6);
    }
  }

  _intro(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(0, 0, 0, 0.55); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'آسمان البرز', W / 2, H / 2 - 50, 38, '#f0d878');
    Utils.text(ctx, 'سیمرغ زال را به آشیانه خود می‌برد', W / 2, H / 2, 20, '#e0d8c0');
    Utils.text(ctx, 'نگه‌داشتن «پرش» = اوج گرفتن  |  رهاکردن = فرود', W / 2, H / 2 + 36, 17, '#c9b48a');
    const blink = 0.5 + Math.sin(this.t * 4) * 0.5;
    ctx.globalAlpha = blink; Utils.text(ctx, 'برای پرواز، پرش را نگه دار', W / 2, H / 2 + 86, 18, '#fff'); ctx.globalAlpha = 1;
  }

  _dead(ctx, W, H) {
    ctx.fillStyle = Utils.rgba(40, 0, 0, 0.6); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'سیمرغ از پا درآمد', W / 2, 240, 40, '#e74c3c');
    Utils.text(ctx, 'امتیاز: ' + this.score, W / 2, 290, 22, '#e0d8c0');
    this.retryBtn.render(ctx);
  }

  _win(ctx, W, H) {
    this.winT = (this.winT || 0) + 1 / 60;
    ctx.fillStyle = Utils.rgba(20, 10, 30, 0.6); ctx.fillRect(0, 0, W, H);
    Utils.text(ctx, 'از طوفان گذشتی!', W / 2, 250, 42, '#f0d878');
    Utils.text(ctx, 'سیمرغ زال را به آشیانه می‌رساند', W / 2, 296, 20, '#e0d8c0');
    Utils.text(ctx, 'پایان مرحله ۲  •  امتیاز: ' + this.score, W / 2, 336, 17, '#c9b48a');
    if (this.winT > 1) this.nextBtn.render(ctx);
  }
}
