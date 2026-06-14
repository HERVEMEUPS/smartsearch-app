const { Schema, model, Types } = require('mongoose');

const CorrespondanceSchema = new Schema({
  declarationPerteId: {
    type: Types.ObjectId,
    ref: 'Declaration',
    required: [true, 'La déclaration de perte est requise'],
    index: true
  },
  declarationDecouverteId: {
    type: Types.ObjectId,
    ref: 'Declaration',
    required: [true, 'La déclaration de découverte est requise'],
    index: true
  },
  scoreGlobal: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    index: true
  },
  scoreNLP: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  scoreLLM: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  scoreGeo: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  statut: {
    type: String,
    enum: {
      values: ['PROPOSEE', 'VUE', 'ACCEPTEE', 'REJETEE', 'CONFIRMEE', 'EXPIREE'],
      message: 'Statut de correspondance invalide'
    },
    default: 'PROPOSEE',
    index: true
  },
  metadataIA: {
    modelUsed: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasoning: {
      type: String,
      maxlength: 1000
    },
    processingTimeMs: Number,
    version: String
  },
  notificationEnvoyee: {
    type: Boolean,
    default: false
  },
  dateVue: Date,
  dateReponse: Date,
  commentaireUtilisateur: {
    type: String,
    maxlength: 500
  },
  feedbackQualite: {
    pertinent: Boolean,
    commentaire: String
  }
}, {
  timestamps: true
});

// Index composites pour les requêtes fréquentes
CorrespondanceSchema.index({ declarationPerteId: 1, statut: 1 });
CorrespondanceSchema.index({ declarationDecouverteId: 1, statut: 1 });
CorrespondanceSchema.index({ scoreGlobal: -1, statut: 1 });
CorrespondanceSchema.index({ statut: 1, createdAt: -1 });

// Index unique pour éviter les doublons
CorrespondanceSchema.index(
  { declarationPerteId: 1, declarationDecouverteId: 1 },
  { unique: true }
);

// Méthode pour vérifier si la correspondance est active
CorrespondanceSchema.methods.isActive = function() {
  return ['PROPOSEE', 'VUE', 'ACCEPTEE'].includes(this.statut);
};

// Méthode pour marquer comme vue
CorrespondanceSchema.methods.markAsViewed = async function() {
  if (this.statut === 'PROPOSEE') {
    this.statut = 'VUE';
    this.dateVue = new Date();
    await this.save();
  }
  return this;
};

// Méthode pour accepter la correspondance
CorrespondanceSchema.methods.accept = async function(commentaire = null) {
  this.statut = 'ACCEPTEE';
  this.dateReponse = new Date();
  if (commentaire) {
    this.commentaireUtilisateur = commentaire;
  }
  await this.save();
  return this;
};

// Méthode pour rejeter la correspondance
CorrespondanceSchema.methods.reject = async function(commentaire = null) {
  this.statut = 'REJETEE';
  this.dateReponse = new Date();
  if (commentaire) {
    this.commentaireUtilisateur = commentaire;
  }
  await this.save();
  return this;
};

// Méthode pour confirmer la récupération
CorrespondanceSchema.methods.confirm = async function() {
  this.statut = 'CONFIRMEE';
  await this.save();
  return this;
};

// Query helper pour trouver les correspondances d'une déclaration
CorrespondanceSchema.query.forDeclaration = function(declarationId) {
  return this.find({
    $or: [
      { declarationPerteId: declarationId },
      { declarationDecouverteId: declarationId }
    ]
  }).sort({ scoreGlobal: -1 });
};

// Query helper pour les correspondances de haute qualité
CorrespondanceSchema.query.highQuality = function(threshold = 0.8) {
  return this.find({
    scoreGlobal: { $gte: threshold },
    statut: { $in: ['PROPOSEE', 'VUE', 'ACCEPTEE'] }
  });
};

// Static method pour obtenir des statistiques
CorrespondanceSchema.statics.getStatistics = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$statut',
        count: { $sum: 1 },
        avgScore: { $avg: '$scoreGlobal' }
      }
    }
  ]);
};

module.exports = model('Correspondance', CorrespondanceSchema);
