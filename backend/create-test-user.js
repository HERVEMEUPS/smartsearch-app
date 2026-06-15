require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = mongoose.connection.collection('users');

    // Créer un utilisateur de test
    const testUser = {
      username: 'test',
      email: 'test@example.com',
      password: await bcrypt.hash('test123', 10),
      role: 'declarant',
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

    // Créer un admin de test
    const adminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
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

    // Vérifier si les utilisateurs existent déjà
    const existingTest = await User.findOne({ username: 'test' });
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (existingTest) {
      console.log('⚠️  L\'utilisateur "test" existe déjà');
    } else {
      await User.insertOne(testUser);
      console.log('✅ Utilisateur créé: test / test123');
    }

    if (existingAdmin) {
      console.log('⚠️  L\'utilisateur "admin" existe déjà');
    } else {
      await User.insertOne(adminUser);
      console.log('✅ Admin créé: admin / admin123');
    }

    console.log('\n📝 Informations de connexion:');
    console.log('━'.repeat(50));
    console.log('👤 Utilisateur normal:');
    console.log('   Username: test');
    console.log('   Password: test123');
    console.log('');
    console.log('👑 Administrateur:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('━'.repeat(50));

    await mongoose.connection.close();
    console.log('\n✅ Terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createTestUser();
