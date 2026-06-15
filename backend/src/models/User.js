const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [50, 'Le nom d\'utilisateur ne peut dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  telephone: {
    type: String,
    trim: true,
    required: false,
    match: [/^\+?[0-9]{9,15}$/, 'Numéro de téléphone invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'declarant'],
      message: 'Le rôle doit être soit "admin" soit "declarant"'
    },
    default: 'declarant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notificationEmail: { type: Boolean, default: true },
    notificationSMS: { type: Boolean, default: false },
    notificationPush: { type: Boolean, default: true },
    langue: { type: String, default: 'fr', enum: ['fr', 'en'] }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index pour optimiser les recherches
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Méthode pour masquer le mot de passe lors de la sérialisation
UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = model('User', UserSchema);
