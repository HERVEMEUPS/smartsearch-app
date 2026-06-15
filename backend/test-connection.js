require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à MongoDB...');
    console.log('📍 URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connexion MongoDB réussie !');
    console.log('📊 Base de données:', mongoose.connection.db.databaseName);

    // Lister les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Collections disponibles:', collections.map(c => c.name).join(', '));

    // Compter les utilisateurs
    const User = mongoose.connection.collection('users');
    const userCount = await User.countDocuments();
    console.log('👥 Nombre d\'utilisateurs:', userCount);

    if (userCount > 0) {
      const users = await User.find({}).project({ username: 1, email: 1, role: 1 }).limit(5).toArray();
      console.log('👤 Utilisateurs:', users);
    }

    await mongoose.connection.close();
    console.log('✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

testConnection();
