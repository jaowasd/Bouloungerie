require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const { general }          = require('./middleware/rateLimiter');
const authRoutes           = require('./routes/auth');
const orderRoutes          = require('./routes/orders');
const { verifyConnection } = require('./services/emailService');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(general);

app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'online', ts: new Date().toISOString() })
);

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Rota nao encontrada.' })
);

app.use((err, req, res, next) => {
  console.error('[Erro]', err.message);
  res.status(500).json({ success: false, message: 'Erro interno.' });
});

app.listen(PORT, async () => {
  console.log('\n Boulangerie Turbo - porta ' + PORT);
  console.log('   Health: http://localhost:' + PORT + '/api/health\n');
  await verifyConnection();
});
