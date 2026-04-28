const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createOTP, verifyOTP } = require('../utils/otpStore');
const { sendOTP } = require('../services/emailService');

const users = new Map(); // Troque por banco de dados em producao

async function requestOTP(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const email = req.body.email.toLowerCase().trim();
  const min   = parseInt(process.env.OTP_EXPIRES_MINUTES) || 5;

  try {
    const code = await createOTP(email);
    await sendOTP(email, code, min);
    if (process.env.NODE_ENV === 'development')
      console.log('[DEV] OTP para ' + email + ': ' + code);
    return res.json({ success: true, message: 'Codigo enviado para ' + email + '. Expira em ' + min + ' minutos.' });
  } catch (err) {
    console.error('[OTP]', err.message);
    return res.status(500).json({ success: false, message: 'Erro ao enviar codigo. Verifique o .env e tente novamente.' });
  }
}

async function verifyOTPHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const email = req.body.email.toLowerCase().trim();
  const code  = String(req.body.code).trim();
  const result = await verifyOTP(email, code);

  if (!result.valid) return res.status(401).json({ success: false, message: result.reason });

  if (!users.has(email))
    users.set(email, { email, name: email.split('@')[0], createdAt: new Date().toISOString() });

  const user  = users.get(email);
  const token = jwt.sign(
    { email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return res.json({ success: true, message: 'Autenticado.', token, user: { email: user.email, name: user.name } });
}

function getMe(req, res) {
  return res.json({ success: true, user: req.user });
}

module.exports = { requestOTP, verifyOTPHandler, getMe };
