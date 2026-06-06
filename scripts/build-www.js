#!/usr/bin/env node
// build-www.js — کپی فایل‌های استاتیک بازی به پوشه www/ برای Capacitor
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');

// مواردی که باید در اپ نهایی باشند
const INCLUDE = ['index.html', 'css', 'js', 'assets'];

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) copy(path.join(src, name), path.join(dest, name));
  } else {
    fs.copyFileSync(src, dest);
  }
}

rmrf(out);
fs.mkdirSync(out, { recursive: true });
for (const item of INCLUDE) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) copy(src, path.join(out, item));
}

console.log('✓ www/ ساخته شد — آماده برای Capacitor');
