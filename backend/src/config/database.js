const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documents_perdus';

    const options = {
      // useNewUrlParser: true, // Deprecated in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated in Mongoose 6+
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    };

    await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB connecté avec succès');
    console.log(`📍 Base de données: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose déconnecté de MongoDB');
    });

    // Fermeture propre lors de l'arrêt de l'application
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    console.error('💡 Assurez-vous que MongoDB est en cours d\'exécution');
    console.error('   Commande: mongod --dbpath /path/to/data');
    process.exit(1);
  }
};

// Fonction pour vérifier la santé de la connexion
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'déconnecté',
    1: 'connecté',
    2: 'en connexion',
    3: 'en déconnexion'
  };
  return {
    isConnected: state === 1,
    state: states[state] || 'inconnu',
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

module.exports = {
  connectDB,
  checkConnection
};
