const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getUserNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const limit = parseInt(req.query.limit) || 50;

  const notifications = await notificationService.getUserNotifications(
    req.user.id,
    unreadOnly,
    limit
  );

  res.json({
    success: true,
    data: notifications
  });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.json({
    success: true,
    data: { count }
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user.id
  );

  res.json({
    success: true,
    message: 'Notification marquée comme lue',
    data: notification
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);

  res.json({
    success: true,
    message: result.message
  });
});
