const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticateToken } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/correspondances
 * @desc    Obtenir toutes les correspondances (avec filtres)
 * @access  Private
 */
router.get('/', matchingController.getAll);

/**
 * @route   GET /api/correspondances/statistiques
 * @desc    Obtenir les statistiques de matching
 * @access  Private
 */
router.get('/statistiques', matchingController.getStatistics);

/**
 * @route   GET /api/correspondances/declaration/:declarationId
 * @desc    Obtenir les correspondances pour une déclaration
 * @access  Private
 */
router.get('/declaration/:declarationId', matchingController.getForDeclaration);

/**
 * @route   GET /api/correspondances/:id
 * @desc    Obtenir une correspondance par ID
 * @access  Private
 */
router.get('/:id', matchingController.getById);

/**
 * @route   POST /api/correspondances/:id/accept
 * @desc    Accepter une correspondance
 * @access  Private
 */
router.post('/:id/accept', matchingController.accept);

/**
 * @route   POST /api/correspondances/:id/reject
 * @desc    Rejeter une correspondance
 * @access  Private
 */
router.post('/:id/reject', matchingController.reject);

/**
 * @route   POST /api/correspondances/:id/confirm
 * @desc    Confirmer la récupération du document
 * @access  Private (déclarant de la perte uniquement)
 */
router.post('/:id/confirm', matchingController.confirm);

/**
 * @route   POST /api/correspondances/:id/feedback
 * @desc    Ajouter un feedback sur la qualité du matching
 * @access  Private
 */
router.post('/:id/feedback', matchingController.addFeedback);

module.exports = router;
