/**
 * Script automatique pour créer un admin
 * Usage: node create-admin-auto.js "VOTRE_URI_MONGODB"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.argv[2];

if (!MONGODB_URI) {
  console.log('❌ Erreur : URI MongoDB manquante\n');
  console.log('Usage: node create-admin-auto.js "mongodb+srv://..."\n');
  console.log('📋 Pour récupérer l\'URI:');
  console.log('   1. Allez sur https://dashboard.render.com');
  console.log('   2. Cliquez sur smartsearch-backend');
  console.log('   3. Allez dans Environment');
  console.log('   4. Copiez MONGODB_URI\n');
  process.exit(1);
}

async function createAdminAuto() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté avec succès\n');

    const User = mongoose.connection.collection('users');

    // Vérifier utilisateurs existants
    const existing = await User.find({}).toArray();
    console.log(`📊 ${existing.length} utilisateur(s) existant(s)`);

    if (existing.length > 0) {
      console.log('\nUtilisateurs:');
      existing.forEach(u => console.log(`  - ${u.username} (${u.role})`));
      console.log('');
    }

    // Créer admin si inexistant
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('⚠️  L\'utilisateur "admin" existe déjà');
      console.log('✅ Réinitialisation du mot de passe...');

      await User.updateOne(
        { username: 'admin' },
        {
          $set: {
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            isActive: true,
            updatedAt: new Date()
          }
        }
      );

      console.log('✅ Mot de passe réinitialisé à "admin123"');
    } else {
      console.log('📝 Création de l\'administrateur...\n');

      const adminUser = {
        username: 'admin',
        email: 'admin@smartsearch.com',
        telephone: '+237600000000',
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

      await User.insertOne(adminUser);
      console.log('✅ Admin créé avec succès !');
    }

    // Créer test_declarant si inexistant
    const testExists = await User.findOne({ username: 'test_declarant' });

    if (!testExists) {
      console.log('\n📝 Création de l\'utilisateur test...');

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

      await User.insertOne(testUser);
      console.log('✅ Utilisateur test créé');
    } else {
      console.log('\n⚠️  L\'utilisateur "test_declarant" existe déjà');
    }

    console.log('\n━'.repeat(60));
    console.log('✅ CONFIGURATION TERMINÉE');
    console.log('━'.repeat(60));
    console.log('\n📝 Comptes disponibles:\n');
    console.log('👑 Administrateur:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   URL: https://smartsearch-frontend.onrender.com/login.html\n');
    console.log('👤 Utilisateur Test:');
    console.log('   Username: test_declarant');
    console.log('   Password: test123\n');
    console.log('━'.repeat(60));

    // Créer une déclaration test
    console.log('\n📄 Création d\'une déclaration test...');

    const Declaration = mongoose.connection.collection('declarations');

    const testDeclaration = {
      utilisateur: (await User.findOne({ username: 'test_declarant' }))._id,
      type: 'DECOUVERTE',
      typeDocument: 'ACTE_NAISSANCE',
      description: 'Acte de naissance trouvé à Yaoundé',
      nomPartiel: 'DJANGA Kymia',
      numeroPartiel: 'AN203/25',
      dateEvenement: new Date('2025-12-01'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Centre-ville',
        adresseComplete: 'Près de la poste centrale'
      },
      statut: 'ACTIF',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const declExists = await Declaration.findOne({ numeroPartiel: 'AN203/25' });

    if (!declExists) {
      await Declaration.insertOne(testDeclaration);
      console.log('✅ Déclaration test créée (Acte de naissance - DJANGA Kymia)');
    } else {
      console.log('⚠️  La déclaration test existe déjà');
    }

    await mongoose.connection.close();
    console.log('\n🎉 Tout est prêt ! Vous pouvez maintenant utiliser l\'application\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Vérifications:');
      console.log('   1. Le mot de passe dans l\'URI est correct');
      console.log('   2. L\'IP 0.0.0.0/0 est autorisée dans MongoDB Atlas Network Access');
      console.log('   3. L\'URI contient bien le nom de la base de données');
    }

    process.exit(1);
  }
}

createAdminAuto().catch(console.error);
