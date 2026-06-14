const matchingService = require('../services/matchingService');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const result = await matchingService.getAll(req.query, req.query.page, req.query.limit);

  res.json({
    success: true,
    data: result.correspondances,
    pagination: result.pagination
  });
});

exports.getForDeclaration = asyncHandler(async (req, res) => {
  const correspondances = await matchingService.getForDeclaration(req.params.declarationId);

  res.json({
    success: true,
    data: correspondances
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const correspondance = await matchingService.getById(req.params.id);

  res.json({
    success: true,
    data: correspondance
  });
});

exports.accept = asyncHandler(async (req, res) => {
  const { commentaire } = req.body;

  const correspondance = await matchingService.accept(
    req.params.id,
    req.user.id,
    commentaire
  );

  res.json({
    success: true,
    message: 'Correspondance acceptée',
    data: correspondance
  });
});

exports.reject = asyncHandler(async (req, res) => {
  const { commentaire } = req.body;

  const correspondance = await matchingService.reject(
    req.params.id,
    req.user.id,
    commentaire
  );

  res.json({
    success: true,
    message: 'Correspondance rejetée',
    data: correspondance
  });
});

exports.confirm = asyncHandler(async (req, res) => {
  const correspondance = await matchingService.confirm(req.params.id, req.user.id);

  res.json({
    success: true,
    message: 'Récupération confirmée ! 🎉',
    data: correspondance
  });
});

exports.addFeedback = asyncHandler(async (req, res) => {
  const { pertinent, commentaire } = req.body;

  const correspondance = await matchingService.addFeedback(req.params.id, req.user.id, {
    pertinent,
    commentaire
  });

  res.json({
    success: true,
    message: 'Merci pour votre feedback !',
    data: correspondance
  });
});

exports.getStatistics = asyncHandler(async (req, res) => {
  const stats = await matchingService.getStatistics();

  res.json({
    success: true,
    data: stats
  });
});
