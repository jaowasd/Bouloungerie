const { validationResult } = require('express-validator');
const { sendOrderNotification, sendOrderConfirmation } = require('../services/emailService');

const orders = [];
let counter  = 1;

async function createOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { clientName, clientEmail, modelo, recheio, cobertura, camadas, cor, total, notes } = req.body;

  const order = {
    id:          'BT-' + String(counter++).padStart(4, '0'),
    clientName:  clientName.trim(),
    clientEmail: clientEmail.toLowerCase().trim(),
    modelo:      modelo    || 'Personalizado',
    recheio:     recheio   || 'Nao informado',
    cobertura:   cobertura || 'Nao informado',
    camadas:     camadas   || 'Nao informado',
    cor:         cor       || 'Nao informado',
    total:       total     || 'A confirmar',
    notes:       notes ? notes.trim().slice(0, 500) : '',
    createdAt:   new Date().toISOString(),
  };

  orders.push(order);

  const results = await Promise.allSettled([
    sendOrderNotification(order),
    sendOrderConfirmation(order),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected')
      console.error('[Order] Email ' + (i === 0 ? 'owner' : 'client') + ' falhou:', r.reason?.message);
  });

  return res.status(201).json({ success: true, message: 'Pedido recebido!', orderId: order.id });
}

function listOrders(req, res) {
  return res.json({ success: true, total: orders.length, orders });
}

module.exports = { createOrder, listOrders };
