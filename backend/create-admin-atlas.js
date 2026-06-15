require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createAdminOnAtlas() {
  try {
    // Utiliser l'URI MongoDB Atlas depuis les variables d'environnement
    const MONGODB_URI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

    if (!MONGODB_URI || !MONGODB_URI.includes('mongodb+srv')) {
      console.error('❌ MONGODB_ATLAS_URI non configuré dans .env');
      console.log('💡 Ajoutez cette ligne dans backend/.env:');
      console.log('MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      process.exit(1);
    }

    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    const User = mongoose.connection.collection('users');

    // Vérifier si meupie_admin existe déjà
    const existingAdmin = await User.findOne({ username: 'meupie_admin' });

    if (existingAdmin) {
      console.log('⚠️  L\'utilisateur "meupie_admin" existe déjà');
      console.log('📝 Informations:');
      console.log('   Username:', existingAdmin.username);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);

      // Proposer de réinitialiser le mot de passe
      console.log('\n💡 Pour réinitialiser le mot de passe, utilisez:');
      console.log('   node backend/reset-password.js meupie_admin nouveau_mot_de_passe');
    } else {
      // Créer l'admin meupie_admin
      const adminUser = {
        username: 'meupie_admin',
        email: 'admin@smartsearch.com',
        password: await bcrypt.hash('Admin@2026', 10),
        role: 'admin',
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          notificationPush: true,
          langue: 'fr'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await User.insertOne(adminUser);
      console.log('✅ Administrateur créé avec succès !');
      console.log('\n📝 Informations de connexion:');
      console.log('━'.repeat(50));
      console.log('👑 Administrateur:');
      console.log('   Username: meupie_admin');
      console.log('   Password: Admin@2026');
      console.log('   Email: admin@smartsearch.com');
      console.log('━'.repeat(50));
    }

    // Lister tous les utilisateurs
    console.log('\n👥 Tous les utilisateurs dans la base:');
    const allUsers = await User.find({}).project({ username: 1, email: 1, role: 1 }).toArray();
    console.table(allUsers);

    await mongoose.connection.close();
    console.log('\n✅ Terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Vérifiez:');
      console.log('   1. Le nom d\'utilisateur et mot de passe MongoDB Atlas');
      console.log('   2. Que l\'IP est autorisée (0.0.0.0/0)');
      console.log('   3. Le nom de la base de données dans l\'URI');
    }
    process.exit(1);
  }
}

createAdminOnAtlas();
