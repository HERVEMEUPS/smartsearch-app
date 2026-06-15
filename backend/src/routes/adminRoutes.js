const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification ET le rôle admin
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Obtenir toutes les statistiques pour le dashboard admin
 * @access  Private (Admin only)
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    Obtenir tous les utilisateurs
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   PUT /api/admin/users/:userId/deactivate
 * @desc    Désactiver un utilisateur
 * @access  Private (Admin only)
 */
router.put('/users/:userId/deactivate', adminController.deactivateUser);

/**
 * @route   PATCH /api/admin/users/:userId/role
 * @desc    Modifier le rôle d'un utilisateur
 * @access  Private (Admin only)
 */
router.patch('/users/:userId/role', adminController.changeUserRole);

/**
 * @route   PATCH /api/admin/users/:userId/reset-password
 * @desc    Réinitialiser le mot de passe d'un utilisateur
 * @access  Private (Admin only)
 */
router.patch('/users/:userId/reset-password', adminController.resetUserPassword);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Supprimer un utilisateur
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @route   GET /api/admin/statistics/users
 * @desc    Obtenir les statistiques des utilisateurs
 * @access  Private (Admin only)
 */
router.get('/statistics/users', adminController.getUserStatistics);

/**
 * @route   GET /api/admin/statistics/declarations
 * @desc    Obtenir les statistiques des déclarations
 * @access  Private (Admin only)
 */
router.get('/statistics/declarations', adminController.getDeclarationStatistics);

/**
 * @route   GET /api/admin/statistics/matching
 * @desc    Obtenir les statistiques de matching
 * @access  Private (Admin only)
 */
router.get('/statistics/matching', adminController.getMatchingStatistics);

module.exports = router;
