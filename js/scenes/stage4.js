// stage4.js — مرحله ۴: بازگشت به ایران (دربار شاه) — آموزش رزم و دوئل با پهلوان
'use strict';

class Stage4Scene extends PlatformerStage {
  config() {
    return {
      id: 4,
      name: 'مرحله ۴ — دربار شاه',
      hasEagle: true,
      particle: 'none',
      theme: {
        skyTop: '#caa46a', skyMid: '#d8b87e', skyBot: '#e8d2a0', mountain: '#9a7e54',
        platA: '#9a7344', platB: '#5e4423', platTop: '#d8b878'
      },
      level: {
        width: 3300, height: 800,
        platforms: [
          { x: -50, y: 640, w: 1100, h: 200 },
          { x: 1150, y: 640, w: 900, h: 200 },
          { x: 2150, y: 640, w: 1200, h: 200 },
          { x: 700, y: 500, w: 160, h: 24 },
          { x: 1300, y: 480, w: 180, h: 24 },
          { x: 1820, y: 500, w: 180, h: 24 }
        ]
      },
      start: { x: 80, y: 560 },
      enemies: [
        { x: 520, y: 590, type: 'guard', patrol: 120 },
        { x: 920, y: 590, type: 'guard', patrol: 120 },
        { x: 1420, y: 590, type: 'guard', patrol: 130 },
        { x: 1900, y: 590, type: 'guard', patrol: 120 },
        { x: 2900, y: 580, type: 'champion', patrol: 260 }
      ],
      bossIndices: [4],
      items: [
        { x: 740, y: 460, kind: 'fruit' }, { x: 1350, y: 440, kind: 'water' },
        { x: 1000, y: 590, kind: 'fruit' }, { x: 1860, y: 460, kind: 'water' },
        { x: 2400, y: 590, kind: 'fruit' }
      ],
      goal: { x: 3120, y: 540, w: 120, h: 100 },
      goalIcon: '🏅', goalColor: '#f1c40f',
      hint: '⚠ پهلوان نامدار دربار — روی سرش بپر!',
      intro: { title: 'دربار شاه', lines: [
        'سام پشیمان شد و زال را بازگرداند.',
        'کشتی، شمشیر و تیر بیاموز و پهلوانان را شکست بده.'
      ] },
      win: { title: 'پهلوان زابل!', lines: [
        'زال در نبردهای نمایشی پیروز شد', 'و لقب «پهلوان زابل» گرفت.'
      ] }
    };
  }
}
