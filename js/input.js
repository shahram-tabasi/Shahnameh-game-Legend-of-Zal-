// input.js — مدیریت ورودی صفحه‌کلید، ماوس و لمس
'use strict';

const Input = {
  keys: {},          // وضعیت فشرده بودن
  pressed: {},       // فقط یک فریم پس از فشردن
  pointer: { x: 0, y: 0, down: false, justDown: false },
  hadGesture: false, // اولین تعامل کاربر (برای آزادسازی صدا/موسیقی)

  _actionMap: {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump',
    KeyA: 'left', KeyD: 'right', KeyW: 'jump', Space: 'jump',
    KeyE: 'eagle', Enter: 'confirm', Escape: 'back'
  },

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      this.hadGesture = true;
      const a = this._actionMap[e.code];
      if (a) {
        if (!this.keys[a]) this.pressed[a] = true;
        this.keys[a] = true;
        if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const a = this._actionMap[e.code];
      if (a) this.keys[a] = false;
    });

    // ماوس / لمس روی بوم برای منوها
    const setPointer = (clientX, clientY, down) => {
      const r = canvas.getBoundingClientRect();
      this.pointer.x = (clientX - r.left) * (canvas.width / r.width);
      this.pointer.y = (clientY - r.top) * (canvas.height / r.height);
      if (down) this.hadGesture = true;
      if (down && !this.pointer.down) this.pointer.justDown = true;
      this.pointer.down = down;
    };
    canvas.addEventListener('mousedown', (e) => setPointer(e.clientX, e.clientY, true));
    canvas.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY, this.pointer.down));
    window.addEventListener('mouseup', () => this.pointer.down = false);
    canvas.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0]; setPointer(t.clientX, t.clientY, true); e.preventDefault();
    }, { passive: false });

    this._bindTouchButtons();
  },

  // دکمه‌های لمسی روی صفحه (HTML)
  _bindTouchButtons() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const tc = document.getElementById('touch-controls');
    if (isTouch && tc) tc.classList.remove('hidden');

    document.querySelectorAll('[data-key]').forEach((btn) => {
      const key = btn.dataset.key;
      const press = (e) => { e.preventDefault(); if (!this.keys[key]) this.pressed[key] = true; this.keys[key] = true; };
      const release = (e) => { e.preventDefault(); this.keys[key] = false; };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    });
  },

  // در پایان هر فریم صدا زده می‌شود تا فلگ‌های لحظه‌ای پاک شوند
  lateUpdate() {
    this.pressed = {};
    this.pointer.justDown = false;
  },

  down(action) { return !!this.keys[action]; },
  just(action) { return !!this.pressed[action]; }
};
