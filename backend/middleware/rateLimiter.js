const rateLimit = require('express-rate-limit');

const general = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Muitas requisicoes. Tente em 15 minutos.' },
});

const otpRequest = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Limite de codigos. Aguarde 10 minutos.' },
});

const otpVerify = rateLimit({
  windowMs: 5 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Muitas tentativas. Aguarde 5 minutos.' },
});

const orders = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Limite de pedidos. Tente em 1 hora.' },
});

module.exports = { general, otpRequest, otpVerify, orders };
