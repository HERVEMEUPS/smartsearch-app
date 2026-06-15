/**
 * Script pour créer un admin directement sur MongoDB Atlas
 * Utilisez l'URI MongoDB de Render
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🎯 Création d\'un utilisateur admin sur MongoDB Atlas\n');

  // Demander l'URI MongoDB
  console.log('📋 Récupérez l\'URI MongoDB depuis Render:');
  console.log('   1. Allez sur https://dashboard.render.com');
  console.log('   2. Cliquez sur smartsearch-backend');
  console.log('   3. Allez dans Environment');
  console.log('   4. Copiez la valeur de MONGODB_URI\n');

  const uri = await question('Collez l\'URI MongoDB ici: ');

  if (!uri || !uri.includes('mongodb')) {
    console.log('❌ URI invalide');
    rl.close();
    return;
  }

  console.log('\n✅ URI reçue');
  console.log('🔄 Connexion à MongoDB...\n');

  // Charger mongoose et bcrypt
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');

  try {
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB Atlas\n');

    const User = mongoose.connection.collection('users');

    // Vérifier s'il y a déjà des utilisateurs
    const existingUsers = await User.find({}).toArray();
    console.log(`📊 ${existingUsers.length} utilisateur(s) existant(s)\n`);

    if (existingUsers.length > 0) {
      console.log('Utilisateurs existants:');
      existingUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.role})`);
      });
      console.log('');
    }

    // Demander les infos du nouvel admin
    const username = await question('Nom d\'utilisateur admin (par défaut: admin): ') || 'admin';
    const password = await question('Mot de passe admin (par défaut: admin123): ') || 'admin123';

    // Vérifier si l'utilisateur existe
    const existing = await User.findOne({ username });

    if (existing) {
      console.log(`\n⚠️  L'utilisateur "${username}" existe déjà`);
      const confirm = await question('Voulez-vous réinitialiser son mot de passe ? (oui/non): ');

      if (confirm.toLowerCase() === 'oui' || confirm.toLowerCase() === 'o') {
        await User.updateOne(
          { username },
          {
            $set: {
              password: await bcrypt.hash(password, 10),
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ Mot de passe réinitialisé avec succès !');
      } else {
        console.log('❌ Annulé');
      }
    } else {
      // Créer le nouvel admin
      const adminUser = {
        username,
        email: `${username}@smartsearch.com`,
        telephone: '+237600000000',
        password: await bcrypt.hash(password, 10),
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
      console.log('\n✅ Administrateur créé avec succès !');
    }

    console.log('\n━'.repeat(50));
    console.log('📝 Informations de connexion:');
    console.log('━'.repeat(50));
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('━'.repeat(50));

    // Créer aussi un utilisateur test
    const createTest = await question('\nVoulez-vous créer un utilisateur test déclarant ? (oui/non): ');

    if (createTest.toLowerCase() === 'oui' || createTest.toLowerCase() === 'o') {
      const testUser = {
        username: 'test_declarant',
        email: 'test@smartsearch.com',
        telephone: '+237611111111',
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

      const existingTest = await User.findOne({ username: 'test_declarant' });

      if (!existingTest) {
        await User.insertOne(testUser);
        console.log('✅ Utilisateur test créé:');
        console.log('   Username: test_declarant');
        console.log('   Password: test123');
      } else {
        console.log('⚠️  L\'utilisateur test existe déjà');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Terminé avec succès\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Vérifications:');
      console.log('   1. Le mot de passe MongoDB Atlas est correct');
      console.log('   2. L\'IP 0.0.0.0/0 est autorisée dans Network Access');
      console.log('   3. Le nom de la base de données est dans l\'URI');
    }
  }

  rl.close();
}

createAdmin().catch(console.error);
