#!/usr/bin/env node
// build-narration-data.js — ساخت js/narrationData.js از assets/narration.json
// تا متن روایت‌ها روی file:// هم بدون fetch در دسترس باشد (متن پشتیبان speechSynthesis).
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'narration.json'), 'utf8'));

const entries = Object.keys(data)
  .filter(k => !k.startsWith('_'))
  .map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(data[k])}`)
  .join(',\n');

const out = `// narrationData.js — تولید خودکار از assets/narration.json (دستی ویرایش نکنید)
'use strict';
const NARRATION = {
${entries}
};
`;
fs.writeFileSync(path.join(root, 'js', 'narrationData.js'), out);
console.log('✓ js/narrationData.js ساخته شد (' + (Object.keys(data).length - 2) + ' بخش)');
