const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Limiteur de taux général
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard"
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limiteur strict pour les routes d'authentification
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    success: false,
    message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes"
  },
  skipSuccessfulRequests: true
});

/**
 * Limiteur pour les routes d'inscription
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions max par heure
  message: {
    success: false,
    message: "Trop d'inscriptions, veuillez réessayer plus tard"
  }
});

/**
 * Limiteur pour les déclarations
 */
const declarationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 déclarations max par heure
  message: {
    success: false,
    message: "Trop de déclarations, veuillez patienter"
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  declarationLimiter
};
