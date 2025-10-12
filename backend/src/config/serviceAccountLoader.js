// Simple loader that reads serviceAccountKey.json from project root if present.
const fs = require('fs');
const path = require('path');

let serviceAccount = null;
const p = path.join(process.cwd(), 'serviceAccountKey.json');
if (fs.existsSync(p)) {
  serviceAccount = require(p);
} else {
  console.warn('serviceAccountKey.json not found in project root. Firebase will not be used.');
}

module.exports = { serviceAccount };
