const config = require('../config');

/**
 * Middleware de gestion centralisée des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur capturée:', err.message);
  console.error('📍 Route:', req.method, req.originalUrl);
  console.error(err.stack);

  // Erreurs Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: "Erreur de validation des données",
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "ID invalide",
      field: err.path
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Ce ${field} est déjà utilisé`,
      field
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Token invalide"
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Token expiré"
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur serveur interne";

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware 404 - Route non trouvée
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Wrapper async pour gérer les erreurs dans les routes async
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
