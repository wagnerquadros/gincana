// Utility to hash a password from CLI: node scripts/hashPassword.js 123456
const bcrypt = require('bcrypt');
const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}
(async () => {
  const hash = await bcrypt.hash(pwd, 10);
  console.log(hash);
})();
