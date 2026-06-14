require('dotenv').config();

const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // Base de données
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/documents_perdus',
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'votre-secret-jwt-changez-moi-en-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },

  // Bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
  },

  // Admin
  admin: {
    code: process.env.ADMIN_CODE || 'ADMIN2026'
  },

  // Service IA
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_TIMEOUT, 10) || 30000, // 30 secondes
    apiKey: process.env.AI_SERVICE_API_KEY
  },

  // LLM (Claude/GPT)
  llm: {
    provider: process.env.LLM_PROVIDER || 'anthropic', // 'anthropic' ou 'openai'
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS, 10) || 500,
    temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.3
  },

  // Notifications
  notifications: {
    email: {
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      apiKey: process.env.EMAIL_API_KEY || process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@oufarez.com',
      fromName: process.env.EMAIL_FROM_NAME || 'OUFAREZ - Documents Perdus'
    },
    sms: {
      provider: process.env.SMS_PROVIDER || 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Matching
  matching: {
    scoreThreshold: parseFloat(process.env.MATCH_THRESHOLD) || 0.72,
    windowDays: parseInt(process.env.MATCH_WINDOW_DAYS, 10) || 30,
    maxCandidates: parseInt(process.env.MATCH_MAX_CANDIDATES, 10) || 10,
    weights: {
      nlp: parseFloat(process.env.WEIGHT_NLP) || 0.4,
      llm: parseFloat(process.env.WEIGHT_LLM) || 0.5,
      geo: parseFloat(process.env.WEIGHT_GEO) || 0.1
    }
  },

  // Rate limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },

  // Upload de fichiers
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024, // 5 MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    destination: process.env.UPLOAD_DEST || './uploads'
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

// Validation de la configuration en production
if (config.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI',
    'LLM_API_KEY'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes en production:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  if (config.jwt.secret === 'votre-secret-jwt-changez-moi-en-production') {
    console.error('❌ JWT_SECRET doit être changé en production !');
    process.exit(1);
  }
}

module.exports = config;
