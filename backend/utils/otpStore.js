const bcrypt = require('bcryptjs');

const store = new Map();
const expiry   = () => (parseInt(process.env.OTP_EXPIRES_MINUTES) || 5) * 60 * 1000;
const maxAttempts = () => parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

async function createOTP(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(code, 10);
  store.set(email.toLowerCase(), { hash, expiresAt: Date.now() + expiry(), attempts: 0 });
  return code;
}

async function verifyOTP(email, code) {
  const key   = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) return { valid: false, reason: 'Codigo nao encontrado ou ja utilizado.' };
  if (Date.now() > entry.expiresAt) { store.delete(key); return { valid: false, reason: 'Codigo expirado.' }; }
  if (entry.attempts >= maxAttempts()) { store.delete(key); return { valid: false, reason: 'Tentativas excedidas.' }; }

  const match = await bcrypt.compare(String(code), entry.hash);
  if (!match) {
    entry.attempts++;
    return { valid: false, reason: `Codigo incorreto. ${maxAttempts() - entry.attempts} tentativa(s).` };
  }

  store.delete(key);
  return { valid: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) if (now > v.expiresAt) store.delete(k);
}, 10 * 60 * 1000);

module.exports = { createOTP, verifyOTP };
