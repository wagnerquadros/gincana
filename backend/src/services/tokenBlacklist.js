// Simple in-memory blacklist. For production, use a persistent store (Redis).
const jwt = require('jsonwebtoken');

const blacklist = new Map(); // token => expiry (unix ms)

function addToBlacklist(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      // set a default short expiry (1 hour)
      const exp = Date.now() + 3600*1000;
      blacklist.set(token, exp);
    } else {
      const expMs = decoded.exp * 1000;
      blacklist.set(token, expMs);
    }
  } catch (err) {
    blacklist.set(token, Date.now() + 3600*1000);
  }
}

function isBlacklisted(token) {
  if (!blacklist.has(token)) return false;
  const exp = blacklist.get(token);
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

module.exports = { addToBlacklist, isBlacklisted };
