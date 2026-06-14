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
