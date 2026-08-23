/**
 * Forensic Blood Assets Generator / Fetcher (Node.js fallback script)
 * Generates or verifies public/vfx/blood/ assets.
 */
const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), 'public', 'vfx', 'blood');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Forensic blood asset directory verified:', targetDir);
