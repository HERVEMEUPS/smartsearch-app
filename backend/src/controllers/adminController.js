const userService = require('../services/userService');
const declarationService = require('../services/declarationService');
const matchingService = require('../services/matchingService');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query, req.query.page, req.query.limit);

  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination
  });
});

exports.deactivateUser = asyncHandler(async (req, res) => {
  const result = await userService.deactivateUser(req.user.id, req.params.userId);

  res.json({
    success: true,
    message: result.message
  });
});

exports.changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const result = await userService.changeUserRole(req.params.userId, role);

  res.json({
    success: true,
    message: result.message || 'Rôle modifié avec succès'
  });
});

exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const result = await userService.resetUserPassword(req.params.userId, newPassword);

  res.json({
    success: true,
    message: result.message || 'Mot de passe réinitialisé avec succès'
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.user.id, req.params.userId);

  res.json({
    success: true,
    message: result.message || 'Utilisateur supprimé avec succès'
  });
});

exports.getUserStatistics = asyncHandler(async (req, res) => {
  const stats = await userService.getStatistics();

  res.json({
    success: true,
    data: stats
  });
});

exports.getDeclarationStatistics = asyncHandler(async (req, res) => {
  const stats = await declarationService.getStatistics(req.query);

  res.json({
    success: true,
    data: stats
  });
});

exports.getMatchingStatistics = asyncHandler(async (req, res) => {
  const stats = await matchingService.getStatistics();

  res.json({
    success: true,
    data: stats
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const [userStats, declStats, matchStats] = await Promise.all([
    userService.getStatistics(),
    declarationService.getStatistics(),
    matchingService.getStatistics()
  ]);

  res.json({
    success: true,
    data: {
      users: userStats,
      declarations: declStats,
      matching: matchStats,
      timestamp: new Date()
    }
  });
});
