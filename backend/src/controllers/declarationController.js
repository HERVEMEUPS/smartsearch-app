const declarationService = require('../services/declarationService');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const declaration = await declarationService.create(req.user.id, {
    ...req.body,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });

  res.status(201).json({
    success: true,
    message: 'Déclaration créée avec succès. Le matching automatique est en cours...',
    data: declaration
  });
});

exports.getAll = asyncHandler(async (req, res) => {
  const result = await declarationService.getAll(req.query, req.query.page, req.query.limit);

  res.json({
    success: true,
    data: result.declarations,
    pagination: result.pagination
  });
});

exports.getUserDeclarations = asyncHandler(async (req, res) => {
  const result = await declarationService.getUserDeclarations(
    req.user.id,
    req.query.page,
    req.query.limit
  );

  res.json({
    success: true,
    data: result.declarations,
    pagination: result.pagination
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const declaration = await declarationService.getById(req.params.id);

  res.json({
    success: true,
    data: declaration
  });
});

exports.update = asyncHandler(async (req, res) => {
  const declaration = await declarationService.update(
    req.params.id,
    req.user.id,
    req.body
  );

  res.json({
    success: true,
    message: 'Déclaration mise à jour',
    data: declaration
  });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await declarationService.delete(req.params.id, req.user.id);

  res.json({
    success: true,
    message: result.message
  });
});

exports.getStatistics = asyncHandler(async (req, res) => {
  const stats = await declarationService.getStatistics(req.query);

  res.json({
    success: true,
    data: stats
  });
});
