const { Schema, model, Types } = require('mongoose');

const DeclarationSchema = new Schema({
  utilisateur: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: ['PERTE', 'DECOUVERTE'],
      message: 'Le type doit être "PERTE" ou "DECOUVERTE"'
    },
    required: [true, 'Le type de déclaration est requis'],
    index: true
  },
  typeDocument: {
    type: String,
    enum: {
      values: ['CNI', 'PASSEPORT', 'PERMIS', 'CARTE_SCOLAIRE', 'DIPLOME', 'ACTE_NAISSANCE', 'AUTRE'],
      message: 'Type de document invalide'
    },
    required: [true, 'Le type de document est requis'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut dépasser 2000 caractères'],
    trim: true
  },
  nomPartiel: {
    type: String,
    trim: true,
    index: true
  },
  numeroPartiel: {
    type: String,
    trim: true,
    index: true
  },
  dateEvenement: {
    type: Date,
    required: [true, 'La date de l\'événement est requise'],
    index: true
  },
  localisation: {
    ville: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
      index: true
    },
    quartier: {
      type: String,
      trim: true
    },
    pointRepere: {
      type: String,
      trim: true
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(coords) {
            return coords && coords.length === 2;
          },
          message: 'Les coordonnées doivent contenir longitude et latitude'
        }
      }
    }
  },
  statut: {
    type: String,
    enum: {
      values: ['EN_ATTENTE', 'EN_MATCH', 'CLOTUREE', 'ARCHIVEE'],
      message: 'Statut invalide'
    },
    default: 'EN_ATTENTE',
    index: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  contactMasque: {
    type: Boolean,
    default: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: { type: String, default: 'web' }
  }
}, {
  timestamps: true
});

// Index géospatial pour les recherches par proximité
DeclarationSchema.index({ 'localisation.geo': '2dsphere' });

// Index composite pour les requêtes de matching
DeclarationSchema.index({ type: 1, typeDocument: 1, dateEvenement: -1 });
DeclarationSchema.index({ statut: 1, createdAt: -1 });
DeclarationSchema.index({ 'localisation.ville': 1, typeDocument: 1 });

// Index texte pour la recherche full-text
DeclarationSchema.index({
  description: 'text',
  nomPartiel: 'text',
  'localisation.ville': 'text',
  'localisation.quartier': 'text'
});

// Méthode pour vérifier si une déclaration peut être matchée
DeclarationSchema.methods.canBeMatched = function() {
  return this.statut === 'EN_ATTENTE' || this.statut === 'EN_MATCH';
};

// Méthode pour obtenir le type opposé (PERTE <-> DECOUVERTE)
DeclarationSchema.methods.getOppositeType = function() {
  return this.type === 'PERTE' ? 'DECOUVERTE' : 'PERTE';
};

// Query helper pour trouver les candidats au matching
DeclarationSchema.query.matchCandidates = function(declaration, windowDays = 30) {
  const dateMin = new Date(declaration.dateEvenement);
  dateMin.setDate(dateMin.getDate() - windowDays);

  const dateMax = new Date(declaration.dateEvenement);
  dateMax.setDate(dateMax.getDate() + windowDays);

  return this.find({
    _id: { $ne: declaration._id },
    type: declaration.getOppositeType(),
    typeDocument: declaration.typeDocument,
    'localisation.ville': declaration.localisation.ville,
    dateEvenement: { $gte: dateMin, $lte: dateMax },
    statut: { $in: ['EN_ATTENTE', 'EN_MATCH'] }
  });
};

module.exports = model('Declaration', DeclarationSchema);
