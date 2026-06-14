const { Schema, model, Types } = require('mongoose');

const NotificationSchema = new Schema({
  destinataireId: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Le destinataire est requis'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: [
        'MATCH_TROUVE',
        'NOUVEAU_CONTACT',
        'CONFIRMATION_RECUP',
        'STATUT_CHANGE',
        'RAPPEL',
        'SYSTEME'
      ],
      message: 'Type de notification invalide'
    },
    required: true,
    index: true
  },
  canal: {
    type: String,
    enum: {
      values: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
      message: 'Canal de notification invalide'
    },
    required: true
  },
  titre: {
    type: String,
    required: true,
    maxlength: 200
  },
  contenu: {
    type: String,
    required: true,
    maxlength: 1000
  },
  statut: {
    type: String,
    enum: {
      values: ['EN_ATTENTE', 'ENVOYEE', 'ECHEC', 'LUE'],
      message: 'Statut de notification invalide'
    },
    default: 'EN_ATTENTE',
    index: true
  },
  correspondanceId: {
    type: Types.ObjectId,
    ref: 'Correspondance',
    index: true
  },
  declarationId: {
    type: Types.ObjectId,
    ref: 'Declaration'
  },
  metadata: {
    tentatives: { type: Number, default: 0 },
    derniereTentative: Date,
    errorMessage: String,
    provider: String, // 'sendgrid', 'twilio', etc.
    externalId: String
  },
  sentAt: Date,
  readAt: Date,
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Index composites
NotificationSchema.index({ destinataireId: 1, statut: 1, createdAt: -1 });
NotificationSchema.index({ statut: 1, canal: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Méthode pour marquer comme envoyée
NotificationSchema.methods.markAsSent = async function(externalId = null) {
  this.statut = 'ENVOYEE';
  this.sentAt = new Date();
  if (externalId) {
    this.metadata.externalId = externalId;
  }
  await this.save();
  return this;
};

// Méthode pour marquer comme échec
NotificationSchema.methods.markAsFailed = async function(errorMessage) {
  this.statut = 'ECHEC';
  this.metadata.tentatives += 1;
  this.metadata.derniereTentative = new Date();
  this.metadata.errorMessage = errorMessage;
  await this.save();
  return this;
};

// Méthode pour marquer comme lue
NotificationSchema.methods.markAsRead = async function() {
  if (this.statut === 'ENVOYEE') {
    this.statut = 'LUE';
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Méthode pour vérifier si on peut réessayer
NotificationSchema.methods.canRetry = function(maxAttempts = 3) {
  return this.statut === 'ECHEC' && this.metadata.tentatives < maxAttempts;
};

// Query helper pour les notifications non lues
NotificationSchema.query.unread = function(userId) {
  return this.find({
    destinataireId: userId,
    statut: { $in: ['EN_ATTENTE', 'ENVOYEE'] },
    canal: { $in: ['PUSH', 'IN_APP'] }
  }).sort({ createdAt: -1 });
};

// Static method pour obtenir le nombre de notifications non lues
NotificationSchema.statics.countUnread = async function(userId) {
  return this.countDocuments({
    destinataireId: userId,
    statut: { $in: ['EN_ATTENTE', 'ENVOYEE'] },
    canal: { $in: ['PUSH', 'IN_APP'] }
  });
};

module.exports = model('Notification', NotificationSchema);
