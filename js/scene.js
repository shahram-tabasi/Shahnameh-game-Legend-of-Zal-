// scene.js — کلاس پایه صحنه و مدیریت صحنه‌ها
'use strict';

// هر صحنه از این کلاس ارث‌بری می‌کند
class Scene {
  constructor(game) { this.game = game; }
  enter(params) {}      // هنگام ورود به صحنه
  exit() {}             // هنگام خروج
  update(dt) {}         // منطق بازی (dt بر حسب ثانیه)
  render(ctx) {}        // ترسیم
}

// مدیر صحنه‌ها — پشته ساده با امکان تعویض
class SceneManager {
  constructor(game) {
    this.game = game;
    this.current = null;
    this._registry = {};
  }

  register(name, sceneClass) { this._registry[name] = sceneClass; }

  go(name, params) {
    const Klass = this._registry[name];
    if (!Klass) { console.error('صحنه ناشناخته:', name); return; }
    if (this.current) this.current.exit();
    this.current = new Klass(this.game);
    this.current.enter(params || {});
  }

  update(dt) { if (this.current) this.current.update(dt); }
  render(ctx) { if (this.current) this.current.render(ctx); }
}

// دکمه ساده برای منوها (کار با لمس و کلیک)
class UIButton {
  constructor(x, y, w, h, label, opts = {}) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.label = label;
    this.color = opts.color || '#d9b65a';
    this.size = opts.size || 24;
    this.locked = opts.locked || false;
    this.hover = false;
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }

  update() {
    this.hover = this.contains(Input.pointer.x, Input.pointer.y);
    return this.hover && Input.pointer.justDown && !this.locked;
  }

  render(ctx) {
    const c = this.locked ? '#555' : this.color;
    ctx.globalAlpha = this.locked ? 0.5 : 1;
    Utils.roundRect(ctx, this.x, this.y, this.w, this.h, 10);
    ctx.fillStyle = this.hover && !this.locked ? Utils.rgba(217, 182, 90, 0.25) : Utils.rgba(20, 26, 48, 0.7);
    ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = c; ctx.stroke();
    Utils.text(ctx, this.label, this.x + this.w / 2, this.y + this.h / 2, this.size, c);
    if (this.locked) Utils.text(ctx, '🔒', this.x + this.w - 24, this.y + this.h / 2, 18, '#999');
    ctx.globalAlpha = 1;
  }
}
