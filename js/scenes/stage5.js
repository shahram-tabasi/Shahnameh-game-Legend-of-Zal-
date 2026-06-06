// stage5.js — مرحله ۵: کفتار دشت زابل (زابلستان) — تعقیب و شکار کفتار غول‌پیکر
'use strict';

class Stage5Scene extends PlatformerStage {
  config() {
    return {
      id: 5,
      name: 'مرحله ۵ — دشت زابل',
      hasEagle: true,
      particle: 'sand',
      theme: {
        skyTop: '#e2bd7e', skyMid: '#d8aa64', skyBot: '#c89a56', mountain: '#b8945a',
        platA: '#c2a060', platB: '#86663a', platTop: '#e6cf98'
      },
      level: {
        width: 3500, height: 800,
        platforms: [
          { x: -50, y: 640, w: 1000, h: 200 },
          { x: 1050, y: 640, w: 900, h: 200 },
          { x: 2050, y: 640, w: 1500, h: 200 },
          { x: 620, y: 510, w: 150, h: 24 },
          { x: 1500, y: 490, w: 170, h: 24 },
          { x: 2300, y: 500, w: 170, h: 24 }
        ]
      },
      start: { x: 80, y: 560 },
      enemies: [
        { x: 520, y: 606, type: 'wolf', patrol: 150 },
        { x: 1300, y: 606, type: 'wolf', patrol: 130 },
        { x: 1750, y: 606, type: 'wolf', patrol: 140 },
        { x: 2900, y: 582, type: 'hyena', patrol: 280 }
      ],
      bossIndices: [3],
      items: [
        { x: 660, y: 470, kind: 'water' }, { x: 1540, y: 450, kind: 'fruit' },
        { x: 1000, y: 590, kind: 'fruit' }, { x: 2340, y: 460, kind: 'water' },
        { x: 2500, y: 590, kind: 'fruit' }
      ],
      goal: { x: 3350, y: 540, w: 120, h: 100 },
      goalIcon: '🦴', goalColor: '#efe0bc',
      hint: '⚠ کفتار غول‌پیکر — سریع باش، تند می‌دود!',
      intro: { title: 'دشت زابل', lines: [
        'کفتاری غول‌پیکر روستاها را نابود می‌کند.',
        'ردپایش را دنبال کن و شکارش کن.'
      ] },
      win: { title: 'کفتار شکست خورد!', lines: [
        'زال هیولا را از پای درآورد', 'و زابلستان را ایمن کرد.'
      ] }
    };
  }
}
