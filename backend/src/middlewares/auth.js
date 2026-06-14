const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

/**
 * Middleware d'authentification JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification manquant"
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Utilisateur introuvable ou désactivé"
      });
    }

    // Attacher les infos utilisateur à la requête
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: "Token expiré",
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: "Token invalide"
      });
    }

    console.error('Erreur authentification:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'authentification"
    });
  }
};

/**
 * Middleware de vérification de rôle
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : privilèges insuffisants",
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification (ne bloque pas si pas de token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Ignore les erreurs et continue sans user
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
