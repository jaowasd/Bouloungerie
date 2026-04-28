const router = require('express').Router();
const { body } = require('express-validator');
const { otpRequest, otpVerify } = require('../middleware/rateLimiter');
const { requireAuth }           = require('../middleware/auth');
const { requestOTP, verifyOTPHandler, getMe } = require('../controllers/authController');

router.post('/request-otp', otpRequest,
  [body('email').isEmail().withMessage('E-mail invalido.').normalizeEmail()],
  requestOTP
);

router.post('/verify-otp', otpVerify,
  [
    body('email').isEmail().withMessage('E-mail invalido.').normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Codigo invalido.'),
  ],
  verifyOTPHandler
);

router.get('/me', requireAuth, getMe);

module.exports = router;
