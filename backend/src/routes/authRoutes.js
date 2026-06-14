const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { authLimiter, registerLimiter } = require('../middlewares/rateLimiter');
const { validateFields } = require('../middlewares/validator');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validateFields(['username', 'email', 'password', 'role']),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validateFields(['username', 'password']),
  authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
router.post(
  '/refresh-token',
  authController.refreshToken
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Mettre à jour le profil
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  validateFields(['oldPassword', 'newPassword']),
  authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

module.exports = router;
