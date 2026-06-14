const express = require('express');
const router = express.Router();
const declarationController = require('../controllers/declarationController');
const { authenticateToken } = require('../middlewares/auth');
const { declarationLimiter } = require('../middlewares/rateLimiter');
const { validateFields } = require('../middlewares/validator');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   POST /api/declarations
 * @desc    Créer une nouvelle déclaration
 * @access  Private
 */
router.post(
  '/',
  declarationLimiter,
  validateFields(['type', 'typeDocument', 'description', 'dateEvenement', 'localisation']),
  declarationController.create
);

/**
 * @route   GET /api/declarations
 * @desc    Obtenir toutes les déclarations (avec filtres)
 * @access  Private
 */
router.get('/', declarationController.getAll);

/**
 * @route   GET /api/declarations/mes-declarations
 * @desc    Obtenir les déclarations de l'utilisateur connecté
 * @access  Private
 */
router.get('/mes-declarations', declarationController.getUserDeclarations);

/**
 * @route   GET /api/declarations/statistiques
 * @desc    Obtenir les statistiques des déclarations
 * @access  Private
 */
router.get('/statistiques', declarationController.getStatistics);

/**
 * @route   GET /api/declarations/:id
 * @desc    Obtenir une déclaration par ID
 * @access  Private
 */
router.get('/:id', declarationController.getById);

/**
 * @route   PUT /api/declarations/:id
 * @desc    Mettre à jour une déclaration
 * @access  Private (propriétaire uniquement)
 */
router.put('/:id', declarationController.update);

/**
 * @route   DELETE /api/declarations/:id
 * @desc    Supprimer une déclaration
 * @access  Private (propriétaire uniquement)
 */
router.delete('/:id', declarationController.delete);

module.exports = router;
