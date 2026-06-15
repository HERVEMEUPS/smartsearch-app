const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');
const config = require('../config');

class UserService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData) {
    const { username, email, telephone, password, role, adminCode } = userData;

    // Vérifier le code admin si rôle admin
    if (role === 'admin' && adminCode !== config.admin.code) {
      throw new Error('Code administrateur incorrect');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }
      if (existingUser.email === email) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      telephone,
      password: hashedPassword,
      role: role || 'declarant'
    });

    // Log d'audit
    await AuditLog.log({
      acteurId: user._id,
      action: 'REGISTER',
      entite: 'USER',
      entiteId: user._id,
      details: { username, email, role: user.role }
    });

    return user.toSafeObject();
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(username, password, metadata = {}) {
    console.log('🔍 Recherche utilisateur:', username);

    // Trouver l'utilisateur
    const user = await User.findOne({ username });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', username);
      throw new Error('Identifiants incorrects');
    }

    if (!user.isActive) {
      console.log('❌ Compte désactivé:', username);
      throw new Error('Compte désactivé');
    }

    console.log('🔐 Vérification mot de passe pour:', username);

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', username);

      // Log d'échec
      await AuditLog.log({
        acteurId: user._id,
        action: 'LOGIN_FAILED',
        entite: 'AUTH',
        resultat: 'FAILURE',
        metadata
      });

      throw new Error('Identifiants incorrects');
    }

    // Générer les tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Log de succès
    await AuditLog.log({
      acteurId: user._id,
      action: 'LOGIN_SUCCESS',
      entite: 'AUTH',
      resultat: 'SUCCESS',
      metadata
    });

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Générer un access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );
  }

  /**
   * Générer un refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshTokenExpiry }
    );
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('Utilisateur introuvable');
      }

      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Token de rafraîchissement invalide');
    }
  }

  /**
   * Obtenir le profil d'un utilisateur
   */
  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user.toSafeObject();
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(userId, updates) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Champs autorisés à être modifiés
    const allowedFields = ['email', 'telephone', 'preferences'];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    await AuditLog.log({
      acteurId: userId,
      action: 'UPDATE_PROFILE',
      entite: 'USER',
      entiteId: userId,
      details: { updatedFields: Object.keys(updates) }
    });

    return user.toSafeObject();
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hasher et enregistrer le nouveau
    user.password = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await user.save();

    await AuditLog.log({
      acteurId: userId,
      action: 'CHANGE_PASSWORD',
      entite: 'USER',
      entiteId: userId
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  /**
   * Obtenir tous les utilisateurs (admin)
   */
  async getAllUsers(filters = {}, page = 1, limit = 20) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { username: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Désactiver un utilisateur (admin)
   */
  async deactivateUser(adminId, userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    user.isActive = false;
    await user.save();

    await AuditLog.log({
      acteurId: adminId,
      action: 'DEACTIVATE_USER',
      entite: 'USER',
      entiteId: userId
    });

    return { message: 'Utilisateur désactivé' };
  }

  /**
   * Changer le rôle d'un utilisateur (admin)
   */
  async changeUserRole(userId, newRole) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (!['admin', 'declarant'].includes(newRole)) {
      throw new Error('Rôle invalide');
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    await AuditLog.log({
      action: 'CHANGE_USER_ROLE',
      entite: 'USER',
      entiteId: userId,
      details: { oldRole, newRole }
    });

    return { message: `Rôle modifié de ${oldRole} à ${newRole}` };
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur (admin)
   */
  async resetUserPassword(userId, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Le mot de passe doit faire au moins 6 caractères');
    }

    // Hasher et enregistrer le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await user.save();

    await AuditLog.log({
      action: 'RESET_USER_PASSWORD',
      entite: 'USER',
      entiteId: userId
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  /**
   * Supprimer un utilisateur (admin)
   */
  async deleteUser(adminId, userId) {
    // Empêcher l'admin de se supprimer lui-même
    if (adminId.toString() === userId.toString()) {
      throw new Error('Vous ne pouvez pas supprimer votre propre compte');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    await AuditLog.log({
      acteurId: adminId,
      action: 'DELETE_USER',
      entite: 'USER',
      entiteId: userId,
      details: { username: user.username, email: user.email }
    });

    await User.findByIdAndDelete(userId);

    return { message: `Utilisateur ${user.username} supprimé avec succès` };
  }

  /**
   * Obtenir les statistiques utilisateurs
   */
  async getStatistics() {
    const Declaration = require('./declarationService');

    const [totalUsers, activeUsers, roleStats, topDeclarants] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      // Top déclarants avec nombre de déclarations
      User.aggregate([
        {
          $lookup: {
            from: 'declarations',
            localField: '_id',
            foreignField: 'declarantId',
            as: 'declarations'
          }
        },
        {
          $addFields: {
            declarationsCount: { $size: '$declarations' }
          }
        },
        {
          $match: {
            declarationsCount: { $gt: 0 }
          }
        },
        {
          $sort: { declarationsCount: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            username: 1,
            role: 1,
            declarations: '$declarationsCount'
          }
        }
      ])
    ]);

    const roleStatsObj = roleStats.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      admins: roleStatsObj.admin || 0,
      declarants: roleStatsObj.declarant || 0,
      usersWithDeclarations: topDeclarants.length,
      byRole: roleStatsObj,
      topDeclarants: topDeclarants
    };
  }
}

module.exports = new UserService();
