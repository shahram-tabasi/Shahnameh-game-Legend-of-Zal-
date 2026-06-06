// narrator.js — روایت داستان اول و آخر هر مرحله با صدای مرورگر (Web Speech API)
// بدون نیاز به فایل صوتی؛ متن فارسی را بلند می‌خواند.
'use strict';

const Narrator = {
  enabled: true,
  supported: false,
  voice: null,
  basePath: 'assets/audio/',
  _audio: null,

  init() {
    this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!this.supported) return;
    this._pickVoice();
    // فهرست صداها ممکن است با تأخیر بارگذاری شود
    window.speechSynthesis.onvoiceschanged = () => this._pickVoice();
  },

  _pickVoice() {
    try {
      const vs = window.speechSynthesis.getVoices() || [];
      this.voice = vs.find(v => /fa|persian|farsi/i.test(v.lang + ' ' + v.name))
                || vs.find(v => /^ar/i.test(v.lang))
                || null;
    } catch (e) { /* بی‌خیال */ }
  },

  // پخش روایت یک بخش: اول فایل صوتی (صدای هوش مصنوعی)، اگر نبود speechSynthesis
  play(key) {
    if (!this.enabled || typeof window === 'undefined') return;
    this.stop();
    const text = (typeof NARRATION !== 'undefined' && NARRATION[key]) ? NARRATION[key] : '';
    try {
      const a = new Audio(this.basePath + key + '.mp3');
      this._audio = a;
      a.volume = 1.0;
      let fell = false;
      const fallback = () => { if (!fell) { fell = true; if (this._audio === a) this._audio = null; this.speak(text); } };
      a.addEventListener('error', fallback, { once: true });   // فایل موجود نیست
      const p = a.play();
      if (p && p.catch) p.catch(fallback);                     // پخش مسدود شد
    } catch (e) {
      this.speak(text);
    }
  },

  // خواندن متن با صدای مرورگر (مسیر پشتیبان)
  speak(text) {
    if (!this.enabled || !this.supported || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.lang = this.voice ? this.voice.lang : 'fa-IR';
      u.rate = 0.95; u.pitch = 1.0; u.volume = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) { /* بی‌خیال */ }
  },

  stop() {
    if (this._audio) { try { this._audio.pause(); } catch (e) {} this._audio = null; }
    if (this.supported) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  }
};
