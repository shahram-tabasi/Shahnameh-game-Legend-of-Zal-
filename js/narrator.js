// narrator.js — روایت داستان اول و آخر هر مرحله با صدای مرورگر (Web Speech API)
// بدون نیاز به فایل صوتی؛ متن فارسی را بلند می‌خواند.
'use strict';

const Narrator = {
  enabled: true,
  supported: false,
  voice: null,

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
      // اولویت با صدای فارسی، سپس عربی (نزدیک‌ترین آوا)، وگرنه پیش‌فرض
      this.voice = vs.find(v => /fa|persian|farsi/i.test(v.lang + ' ' + v.name))
                || vs.find(v => /^ar/i.test(v.lang))
                || null;
    } catch (e) { /* بی‌خیال */ }
  },

  // متن را بلند می‌خواند (روایت قبلی را قطع می‌کند)
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
    if (this.supported) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  }
};
