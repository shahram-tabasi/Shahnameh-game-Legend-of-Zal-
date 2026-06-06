// stage7.js — مرحله ۷: فرمانروای زابل — دفاع از مرزها و نبرد با دیو و سرداران
'use strict';

class Stage7Scene extends PlatformerStage {
  config() {
    return {
      id: 7,
      name: 'مرحله ۷ — فرمانروای زابل',
      hasEagle: true,
      particle: 'none',
      theme: {
        skyTop: '#3a2a4a', skyMid: '#6a4a5a', skyBot: '#c8906a', mountain: '#4a3a52',
        platA: '#5a4a52', platB: '#322a36', platTop: '#8a7a82'
      },
      level: {
        width: 4100, height: 800,
        platforms: [
          { x: -50, y: 640, w: 1250, h: 200 },
          { x: 1300, y: 640, w: 1000, h: 200 },
          { x: 2400, y: 640, w: 1750, h: 200 },
          { x: 750, y: 500, w: 170, h: 24 },
          { x: 1600, y: 490, w: 180, h: 24 },
          { x: 2700, y: 500, w: 180, h: 24 }
        ]
      },
      start: { x: 80, y: 560 },
      enemies: [
        { x: 1000, y: 544, type: 'div', patrol: 220 },        // دیو کوهستان
        { x: 2100, y: 580, type: 'champion', patrol: 220 },   // سردار شورشی
        { x: 3250, y: 580, type: 'champion', patrol: 220 },   // شاهزاده مهاجم کابل
        { x: 500, y: 600, type: 'guard', patrol: 120 },
        { x: 1500, y: 606, type: 'wolf', patrol: 130 },
        { x: 2600, y: 606, type: 'wolf', patrol: 130 }
      ],
      bossIndices: [0, 1, 2],
      items: [
        { x: 790, y: 460, kind: 'fruit' }, { x: 1640, y: 450, kind: 'water' },
        { x: 1200, y: 590, kind: 'fruit' }, { x: 2740, y: 460, kind: 'water' },
        { x: 2300, y: 590, kind: 'fruit' }, { x: 3500, y: 590, kind: 'water' }
      ],
      goal: { x: 3950, y: 540, w: 120, h: 100 },
      goalIcon: '👑', goalColor: '#f1c40f',
      hint: '⚠ دیو و سرداران — یکی‌یکی شکستشان بده!',
      intro: { title: 'فرمانروای زابل', lines: [
        'زال فرمانروای زابل شد.',
        'از مرزها دفاع کن: دیو و سرداران شورشی را شکست بده.'
      ] },
      win: { title: 'زابل در امان است', lines: [
        'زال دیو و شورشیان را سرکوب کرد', 'و فرمانروایی‌اش را تثبیت کرد.'
      ] }
    };
  }
}
