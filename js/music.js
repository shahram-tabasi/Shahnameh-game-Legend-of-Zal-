// music.js — موسیقی پس‌زمینهٔ زنده و کاملاً سنتزشده (بدون فایل صوتی → بدون مشکل کپی‌رایت)
// سنتز زخمه‌ای شبیه تار/سنتور روی گام «دستگاه شور» + ضرب تنبک، با فضای آکوستیک.
'use strict';

const Music = {
  ctx: null, enabled: true, started: false,
  master: null, bus: null, _timer: null,
  _nextTime: 0, _step: 0, _mel: 5,
  tempo: 82,

  // فواصل دستگاه شور بر حسب سنت (شامل ربع‌پردهٔ ایرانی ۱۵۰ سنت)
  scaleCents: [0, 150, 300, 500, 700, 800, 1000, 1200, 1350, 1500, 1700, 1900],
  root: 146.83,   // ر۳ (D3)

  // الگوی ضرب تنبک روی ۱۶ ضربِ هشتم (دو میزان ۴/۴)
  domSteps: [0, 3, 6, 8, 11, 14],
  tekSteps: [2, 4, 5, 10, 12, 13, 15],

  init(ctx) {
    if (!ctx) return;
    this.ctx = ctx;
    try {
      const comp = ctx.createDynamicsCompressor();
      comp.connect(ctx.destination);
      this.master = ctx.createGain();
      this.master.gain.value = 0.0001;
      this.master.connect(comp);

      // ریورب با پاسخ‌ضربهٔ سنتزشده
      const reverb = ctx.createConvolver();
      reverb.buffer = this._impulse(2.4, 2.6);
      const wet = ctx.createGain(); wet.gain.value = 0.22;
      reverb.connect(wet); wet.connect(this.master);

      this.bus = ctx.createGain(); this.bus.gain.value = 0.9;
      this.bus.connect(this.master);   // مسیر خشک
      this.bus.connect(reverb);        // ارسال به ریورب
    } catch (e) { this.ctx = null; }
  },

  _impulse(dur, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  },

  freq(deg) {
    const n = this.scaleCents.length;
    const idx = ((deg % n) + n) % n;
    const oct = Math.floor(deg / n);
    return this.root * Math.pow(2, this.scaleCents[idx] / 1200 + oct);
  },

  start() {
    if (!this.ctx || this.started || !this.enabled) return;
    if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) {} }
    this.started = true;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.exponentialRampToValueAtTime(0.16, t + 2.5);  // ورود تدریجی
    this._nextTime = t + 0.1;
    this._step = 0;
    this._timer = setInterval(() => this._scheduler(), 25);
  },

  stop() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.started = false;
    if (this.master && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setValueAtTime(this.master.gain.value, t);
        this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      } catch (e) {}
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.start(); else this.stop();
    return this.enabled;
  },

  _scheduler() {
    if (!this.ctx) return;
    const stepDur = (60 / this.tempo) / 2;   // نت‌های هشتم
    while (this._nextTime < this.ctx.currentTime + 0.2) {
      this._scheduleStep(this._step, this._nextTime, stepDur);
      this._step = (this._step + 1) % 16;
      this._nextTime += stepDur;
    }
  },

  _scheduleStep(step, time, stepDur) {
    if (this.domSteps.includes(step)) this._dom(time);
    if (this.tekSteps.includes(step)) this._tek(time);

    // ملودی زخمه‌ای: گردش پلکانی روی گام با کمی سکوت
    if (Math.random() < 0.62) {
      const moves = [-2, -1, -1, 0, 1, 1, 2];
      this._mel = Utils.clamp(this._mel + moves[Math.floor(Math.random() * moves.length)], 0, 14);
      this._pluck(this.freq(this._mel), time, 0.55 + Math.random() * 0.35);
      // تک‌نوازی سریع سنتور (دو زخمهٔ پشت‌سرهم)
      if (Math.random() < 0.28) this._pluck(this.freq(this._mel), time + stepDur * 0.5, 0.3);
    }
  },

  // زخمهٔ تار/سنتور
  _pluck(freq, time, dur) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.45, time + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3600;

    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = freq; o2.detune.value = 6;
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = freq * 2.01; // درخشش فلزی سنتور
    const gb = ctx.createGain(); gb.gain.value = 0.5;
    const gh = ctx.createGain(); gh.gain.value = 0.16;

    o1.connect(g); o2.connect(gb); gb.connect(g); o3.connect(gh); gh.connect(g);
    g.connect(lp); lp.connect(this.bus);

    [o1, o2, o3].forEach(o => { o.start(time); o.stop(time + dur + 0.05); });
  },

  // تنبک — «تُم» (بم)
  _dom(time) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(165, time);
    o.frequency.exponentialRampToValueAtTime(58, time + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.8, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    o.connect(g); g.connect(this.bus);
    o.start(time); o.stop(time + 0.32);
    this._noise(time, 0.035, 1400, 0.25, 'lowpass');
  },

  // تنبک — «تَک» (زیر)
  _tek(time) { this._noise(time, 0.05, 3200, 0.4, 'highpass'); },

  _noise(time, dur, freq, vol, type) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.bus);
    src.start(time);
  }
};
