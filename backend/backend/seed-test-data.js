const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Créer le schéma User
    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: String,
      role: { type: String, default: 'user' },
      telephone: String,
      statut: { type: String, default: 'actif' }
    }, { timestamps: true });

    // Créer le schéma Declaration
    const DeclarationSchema = new mongoose.Schema({
      utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { type: String, enum: ['PERTE', 'DECOUVERTE'], required: true },
      typeDocument: { type: String, required: true },
      description: { type: String, required: true },
      nomPartiel: String,
      numeroPartiel: String,
      dateEvenement: { type: Date, required: true },
      localisation: {
        ville: { type: String, required: true },
        quartier: String,
        pointRepere: String
      },
      statut: { type: String, default: 'EN_ATTENTE' },
      photoUrl: String,
      contactMasque: { type: Boolean, default: true }
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Declaration = mongoose.models.Declaration || mongoose.model('Declaration', DeclarationSchema);

    // Vérifier s'il existe déjà des données
    const existingDeclarations = await Declaration.countDocuments();
    if (existingDeclarations > 0) {
      console.log(`⚠️  ${existingDeclarations} déclaration(s) existante(s) trouvée(s).`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Voulez-vous tout supprimer et réinitialiser ? (oui/non): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'oui') {
        console.log('Opération annulée.');
        process.exit(0);
      }

      await Declaration.deleteMany({});
      console.log('✅ Anciennes déclarations supprimées\n');
    }

    // Créer ou récupérer des utilisateurs de test
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        username: 'test_declarant',
        email: 'test@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Hash fictif
        telephone: '670000000',
        role: 'user'
      });
      console.log('✅ Utilisateur test_declarant créé');
    } else {
      console.log('✅ Utilisateur test existant trouvé:', testUser.username);
    }

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@smartsearch.cm',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        telephone: '690000000',
        role: 'admin'
      });
      console.log('✅ Utilisateur admin créé');
    } else {
      console.log('✅ Admin existant trouvé:', admin.username);
    }

    console.log('📝 Création de déclarations de test...\n');

    // 1. Document PERDU - CNI de DJANGA Kymia
    await Declaration.create({
      utilisateur: testUser._id,
      type: 'PERTE',
      typeDocument: 'ACTE_NAISSANCE',
      description: 'Acte de naissance perdu lors d\'un déplacement. Contient les informations de DJANGA Kymia.',
      nomPartiel: 'DJANGA Kymia',
      numeroPartiel: 'AN203/25',
      dateEvenement: new Date('2025-11-01'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Centre-ville',
        pointRepere: 'Près du marché central'
      },
      statut: 'EN_ATTENTE'
    });

    // 2. Document TROUVÉ correspondant - CNI de DJANGA Kymia
    await Declaration.create({
      utilisateur: admin._id,
      type: 'DECOUVERTE',
      typeDocument: 'ACTE_NAISSANCE',
      description: 'Acte de naissance trouvé dans un taxi. Nom: DJANGA Kymia, numéro AN203/25.',
      nomPartiel: 'DJANGA Kymia',
      numeroPartiel: 'AN203/25',
      dateEvenement: new Date('2025-11-03'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Tsinga',
        pointRepere: 'Station taxi'
      },
      statut: 'EN_ATTENTE'
    });

    // 3. Document PERDU - Permis de conduire
    await Declaration.create({
      utilisateur: testUser._id,
      type: 'PERTE',
      typeDocument: 'PERMIS',
      description: 'Permis de conduire perdu. Propriétaire: MEUPIE',
      nomPartiel: 'MEUPIE',
      numeroPartiel: 'Pe4325',
      dateEvenement: new Date('2026-05-18'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Essos',
        pointRepere: 'Restaurant Le Paradis'
      },
      statut: 'EN_ATTENTE'
    });

    // 4. Document TROUVÉ correspondant - Permis
    await Declaration.create({
      utilisateur: admin._id,
      type: 'DECOUVERTE',
      typeDocument: 'PERMIS',
      description: 'Permis de conduire trouvé dans un parking. Numéro Pe4325, nom MEUPIE.',
      nomPartiel: 'MEUPIE',
      numeroPartiel: 'Pe4325',
      dateEvenement: new Date('2026-05-19'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Omnisport',
        pointRepere: 'Parking du stade'
      },
      statut: 'EN_ATTENTE'
    });

    // 5. Document PERDU sans correspondance
    await Declaration.create({
      utilisateur: testUser._id,
      type: 'PERTE',
      typeDocument: 'PASSEPORT',
      description: 'Passeport perdu lors d\'un voyage. Propriétaire: FOSSI',
      nomPartiel: 'FOSSI',
      numeroPartiel: 'Pass12345678',
      dateEvenement: new Date('2026-05-20'),
      localisation: {
        ville: 'Nkongsamba',
        quartier: 'Centre',
        pointRepere: 'Gare routière'
      },
      statut: 'EN_ATTENTE'
    });

    // 6. Document TROUVÉ - Acte de naissance MAFO
    await Declaration.create({
      utilisateur: admin._id,
      type: 'DECOUVERTE',
      typeDocument: 'ACTE_NAISSANCE',
      description: 'Acte de naissance trouvé dans la rue. Nom: MAFO Krystie',
      nomPartiel: 'MAFO Krystie',
      numeroPartiel: 'AN239/21',
      dateEvenement: new Date('2026-01-14'),
      localisation: {
        ville: 'Yaoundé',
        quartier: 'Bastos',
        pointRepere: 'Avenue Kennedy'
      },
      statut: 'EN_ATTENTE'
    });

    const totalCreated = await Declaration.countDocuments();
    const pertes = await Declaration.countDocuments({ type: 'PERTE' });
    const decouvertes = await Declaration.countDocuments({ type: 'DECOUVERTE' });

    console.log('✅ Données de test créées avec succès!\n');
    console.log('📊 RÉSUMÉ:');
    console.log(`  Total: ${totalCreated} déclarations`);
    console.log(`  PERTE: ${pertes} documents perdus`);
    console.log(`  DECOUVERTE: ${decouvertes} documents trouvés\n`);

    console.log('💡 CORRESPONDANCES POTENTIELLES:');
    console.log('  1. DJANGA Kymia (AN203/25) - Acte de naissance');
    console.log('  2. MEUPIE (Pe4325) - Permis de conduire\n');

    console.log('🚀 PROCHAINES ÉTAPES:');
    console.log('  1. Démarrez le backend: cd backend && npm start');
    console.log('  2. Le système créera automatiquement les correspondances');
    console.log('  3. Consultez le dashboard admin pour voir les résultats\n');

    await mongoose.disconnect();
    console.log('✅ Terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
