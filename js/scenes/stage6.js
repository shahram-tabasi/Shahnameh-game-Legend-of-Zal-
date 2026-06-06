// stage6.js — مرحله ۶: عشق رودابه (شهر کابل) — نفوذ مخفیانه و بالا رفتن از دیوار قصر
'use strict';

class Stage6Scene extends PlatformerStage {
  config() {
    return {
      id: 6,
      name: 'مرحله ۶ — شهر کابل',
      hasEagle: true,
      particle: 'none',
      theme: {
        skyTop: '#0e1430', skyMid: '#23204a', skyBot: '#3a2c46', mountain: '#241d3a',
        platA: '#3a3550', platB: '#201d30', platTop: '#5a5470'
      },
      // مرحلهٔ صعودی: از پایین تا بام قصر بالا برو
      level: {
        width: 1200, height: 1050,
        platforms: [
          { x: -50, y: 900, w: 1150, h: 200 },
          { x: 150, y: 790, w: 160, h: 24 },
          { x: 430, y: 690, w: 160, h: 24 },
          { x: 700, y: 600, w: 170, h: 24 },
          { x: 900, y: 500, w: 200, h: 24 },   // ایوان نگهبان‌ها
          { x: 640, y: 410, w: 160, h: 24 },
          { x: 360, y: 320, w: 170, h: 24 },
          { x: 120, y: 230, w: 220, h: 24 },   // فرمانده
          { x: 420, y: 140, w: 320, h: 30 }    // بام قصر — رودابه
        ]
      },
      start: { x: 60, y: 840 },
      enemies: [
        { x: 950, y: 460, type: 'guard', patrol: 30 },
        { x: 1020, y: 460, type: 'guard', patrol: 30 },
        { x: 210, y: 170, type: 'champion', patrol: 80 }
      ],
      bossIndices: [2],
      items: [
        { x: 470, y: 650, kind: 'water' }, { x: 720, y: 560, kind: 'fruit' },
        { x: 400, y: 280, kind: 'water' }
      ],
      goal: { x: 520, y: 40, w: 120, h: 100 },
      goalIcon: '🌹', goalColor: '#e87aa0',
      hint: '⚠ فرمانده محافظان مهراب — روی سرش بپر!',
      intro: { title: 'شهر کابل', lines: [
        'زال دلباختهٔ رودابه شده است.',
        'مخفیانه از دیوار قصر بالا برو.',
        '🦅 نگهبان‌ها را با عقاب سرگرم کن!'
      ] },
      win: { title: 'دیدار با رودابه', lines: [
        'زال به بام قصر رسید', 'و عشق او و رودابه آغاز شد.'
      ] }
    };
  }
}
