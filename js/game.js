// game.js — هسته بازی: حلقه اصلی و راه‌اندازی
'use strict';

class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.lastT = 0;

    this.scenes = new SceneManager(this);
    this.scenes.register('menu', MenuScene);
    this.scenes.register('about', AboutScene);
    this.scenes.register('stageSelect', StageSelectScene);
    this.scenes.register('stage1', Stage1Scene);
    this.scenes.register('stage2', Stage2Scene);
    this.scenes.register('stage3', Stage3Scene);
    this.scenes.register('stage4', Stage4Scene);
    this.scenes.register('stage5', Stage5Scene);
    this.scenes.register('stage6', Stage6Scene);
    this.scenes.register('stage7', Stage7Scene);
    this.scenes.register('stage8', Stage8Scene);
    this.scenes.register('placeholder', PlaceholderScene);
  }

  start() {
    Input.init(this.canvas);
    Sound.init();
    this._resize();
    window.addEventListener('resize', () => this._resize());

    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');

    this.scenes.go('menu');
    requestAnimationFrame((t) => this._loop(t));
  }

  // مقیاس‌بندی بوم متناسب با صفحه با حفظ نسبت ۱۶:۹
  _resize() {
    const wrap = document.getElementById('game-wrap');
    const aspect = this.width / this.height;
    let w = wrap.clientWidth, h = wrap.clientHeight;
    if (w / h > aspect) w = h * aspect; else h = w / aspect;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
  }

  _loop(t) {
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (dt > 0.05) dt = 0.05;        // جلوگیری از پرش بزرگ زمانی

    this.scenes.update(dt);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.scenes.render(this.ctx);
    Input.lateUpdate();

    requestAnimationFrame((nt) => this._loop(nt));
  }
}

window.addEventListener('load', () => {
  const game = new Game('game');
  game.start();
});
