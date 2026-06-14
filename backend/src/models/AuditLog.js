const { Schema, model, Types } = require('mongoose');

const AuditLogSchema = new Schema({
  acteurId: {
    type: Types.ObjectId,
    ref: 'User',
    index: true
  },
  acteurType: {
    type: String,
    enum: ['USER', 'SYSTEM', 'ADMIN', 'CRON'],
    default: 'USER'
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entite: {
    type: String,
    required: true,
    enum: ['USER', 'DECLARATION', 'CORRESPONDANCE', 'NOTIFICATION', 'AUTH', 'SYSTEM'],
    index: true
  },
  entiteId: {
    type: Types.ObjectId,
    index: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  resultat: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'PARTIAL'],
    default: 'SUCCESS'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String,
    statusCode: Number,
    duration: Number, // en ms
    errorMessage: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // On utilise timestamp custom
  capped: { size: 52428800, max: 100000 } // 50 MB, max 100k documents
});

// Index composites pour les requêtes d'audit
AuditLogSchema.index({ acteurId: 1, timestamp: -1 });
AuditLogSchema.index({ entite: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// Static method pour logger une action
AuditLogSchema.statics.log = async function(data) {
  try {
    return await this.create({
      acteurId: data.acteurId,
      acteurType: data.acteurType || 'USER',
      action: data.action,
      entite: data.entite,
      entiteId: data.entiteId,
      details: data.details || {},
      resultat: data.resultat || 'SUCCESS',
      metadata: data.metadata || {},
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la création du log d\'audit:', error);
    // Ne pas faire échouer l'opération principale si le logging échoue
    return null;
  }
};

// Static method pour obtenir l'historique d'une entité
AuditLogSchema.statics.getHistory = async function(entite, entiteId, limit = 50) {
  return this.find({ entite, entiteId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('acteurId', 'username email')
    .lean();
};

// Static method pour obtenir les activités d'un utilisateur
AuditLogSchema.statics.getUserActivity = async function(userId, limit = 100) {
  return this.find({ acteurId: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method pour obtenir des statistiques
AuditLogSchema.statics.getStatistics = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          entite: '$entite',
          action: '$action',
          resultat: '$resultat'
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$metadata.duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = model('AuditLog', AuditLogSchema);
