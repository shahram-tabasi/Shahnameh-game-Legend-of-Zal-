// audio.js — افکت‌های صوتی ساده با WebAudio (بدون نیاز به فایل)
'use strict';

const Sound = {
  ctx: null,
  enabled: true,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  },

  // برخی مرورگرها تا اولین تعامل کاربر اجازه پخش نمی‌دهند
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  _beep(freq, dur, type = 'sine', vol = 0.2) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },

  jump()    { this._beep(440, 0.15, 'square', 0.15); },
  collect() { this._beep(880, 0.12, 'sine', 0.18); this._beep(1180, 0.12, 'sine', 0.12); },
  hurt()    { this._beep(140, 0.25, 'sawtooth', 0.2); },
  hit()     { this._beep(220, 0.1, 'square', 0.15); },
  eagle()   { this._beep(620, 0.2, 'triangle', 0.15); },
  win()     { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this._beep(f, 0.25, 'sine', 0.2), i * 130)); },
  select()  { this._beep(660, 0.08, 'triangle', 0.12); }
};
