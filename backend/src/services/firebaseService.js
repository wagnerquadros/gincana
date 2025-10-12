// Serviço com fallback: Firestore se configurado, caso contrário usa DB local (data/local_users.json)
const fs = require('fs').promises;
const path = require('path');

const USE_FIREBASE = (process.env.USE_FIREBASE || 'false').toLowerCase() === 'true';
let db = null;

if (USE_FIREBASE) {
  try {
    const admin = require('firebase-admin');
    const serviceAccount = require('../config/serviceAccountLoader').serviceAccount;
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
    console.log('Firebase inicializado');
  } catch (err) {
    console.error('Erro ao inicializar Firebase:', err.message);
    console.error('Voltando para DB local.');
    db = null;
  }
}

async function getUserByUsername(username) {
  if (!username) return null;
  if (db) {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();
    if (snapshot.empty) return null;
    let user = null;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });
    return user;
  } else {
    // fallback local JSON
    const p = path.join(__dirname, '..', 'data', 'local_users.json');
    try {
      const content = await fs.readFile(p, 'utf8');
      const users = JSON.parse(content);
      return users.find(u => u.username === username) || null;
    } catch (err) {
      return null;
    }
  }
}

async function getUserByEmail(email) {
  if (!email) return null;
  if (db) {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) return null;
    let user = null;
    snapshot.forEach(doc => {
      user = { id: doc.id, ...doc.data() };
    });
    return user;
  } else {
    // fallback local JSON
    const p = path.join(__dirname, '..', 'data', 'local_users.json');
    try {
      const content = await fs.readFile(p, 'utf8');
      const users = JSON.parse(content);
      return users.find(u => u.email === email) || null;
    } catch (err) {
      return null;
    }
  }
}

module.exports = { getUserByUsername, getUserByEmail };
