const userService = require('../services/userService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, email, telephone, password, role, adminCode } = req.body;

  const user = await userService.register({
    username,
    email,
    telephone,
    password,
    role,
    adminCode
  });

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: user
  });
});

/**
 * Connexion d'un utilisateur
 */
exports.login = asyncHandler(async (req, res) => {
  console.log('📝 Tentative de connexion:', { username: req.body.username });

  const { username, password } = req.body;

  const metadata = {
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  };

  const result = await userService.login(username, password, metadata);

  console.log('✅ Connexion réussie pour:', username);

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});

/**
 * Rafraîchir le token d'accès
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token manquant'
    });
  }

  const result = await userService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Obtenir le profil de l'utilisateur connecté
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.json({
    success: true,
    data: user
  });
});

/**
 * Mettre à jour le profil
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = req.body;

  const user = await userService.updateProfile(req.user.id, updates);

  res.json({
    success: true,
    message: 'Profil mis à jour',
    data: user
  });
});

/**
 * Changer le mot de passe
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Ancien et nouveau mot de passe requis'
    });
  }

  const result = await userService.changePassword(
    req.user.id,
    oldPassword,
    newPassword
  );

  res.json({
    success: true,
    message: result.message
  });
});

/**
 * Déconnexion (côté client surtout)
 */
exports.logout = asyncHandler(async (req, res) => {
  // La déconnexion est gérée côté client en supprimant le token
  // Ici on peut logger l'événement

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});
