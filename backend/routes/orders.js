const router = require('express').Router();
const { body } = require('express-validator');
const { orders: ordersLimit } = require('../middleware/rateLimiter');
const { requireAuth }         = require('../middleware/auth');
const { createOrder, listOrders } = require('../controllers/orderController');

router.post('/', ordersLimit,
  [
    body('clientName').trim().notEmpty().withMessage('Nome obrigatorio.').isLength({ max: 100 }),
    body('clientEmail').isEmail().withMessage('E-mail invalido.').normalizeEmail(),
    body('total').trim().notEmpty().withMessage('Total obrigatorio.'),
    body('modelo').optional().trim().isLength({ max: 100 }),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  createOrder
);

router.get('/', requireAuth, listOrders);

module.exports = router;
