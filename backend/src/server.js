require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const config = require('./config');

const app = express();

// Middlewares de sécurité et logging
app.use(helmet());
app.use(cors(config.cors));
app.use(morgan(config.logging.format));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Route de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'API OUFAREZ - Documents Perdus V3',
    version: '2.0.0',
    status: 'online',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      declarations: '/api/declarations/*',
      correspondances: '/api/correspondances/*',
      notifications: '/api/notifications/*',
      admin: '/api/admin/*'
    }
  });
});

// Routes API
const authRoutes = require('./routes/authRoutes');
const declarationRoutes = require('./routes/declarationRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/correspondances', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Gestion 404
app.use(notFound);

// Gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log('═'.repeat(50));
      console.log('🚀 Serveur OUFAREZ démarré avec succès !');
      console.log('═'.repeat(50));
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Configuré' : 'Non configuré'}`);
      console.log(`🤖 Service IA: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
      console.log('═'.repeat(50));
      console.log('');
      console.log('📋 Endpoints disponibles:');
      console.log(`  GET    http://localhost:${PORT}/health`);
      console.log(`  GET    http://localhost:${PORT}/`);
      console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`  POST   http://localhost:${PORT}/api/declarations`);
      console.log(`  GET    http://localhost:${PORT}/api/declarations`);
      console.log(`  GET    http://localhost:${PORT}/api/correspondances`);
      console.log(`  GET    http://localhost:${PORT}/api/notifications`);
      console.log('');
      console.log('💡 Prochaines étapes:');
      console.log('  1. Créer un compte: POST /api/auth/register');
      console.log('  2. Se connecter: POST /api/auth/login');
      console.log('  3. Créer une déclaration: POST /api/declarations');
      console.log('  4. (Optionnel) Migrer les anciennes données: npm run migrate');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error.message);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

startServer();
