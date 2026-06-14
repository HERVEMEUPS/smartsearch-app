const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Obtenir les notifications de l'utilisateur
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtenir le nombre de notifications non lues
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
