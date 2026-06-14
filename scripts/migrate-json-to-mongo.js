/**
 * Script de migration des données JSON vers MongoDB
 *
 * Usage: node scripts/migrate-json-to-mongo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { User, Declaration } = require('../backend/src/models');

const USERS_FILE = path.join(__dirname, '../backend/users.json');
const DOCUMENTS_FILE = path.join(__dirname, '../backend/documents.json');

// Connexion à MongoDB
async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/documents_perdus';
  await mongoose.connect(mongoURI);
  console.log('✅ Connecté à MongoDB');
}

// Lecture des fichiers JSON
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Fichier non trouvé: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Erreur lecture ${filePath}:`, error.message);
    return [];
  }
}

// Migration des utilisateurs
async function migrateUsers() {
  console.log('\n📋 Migration des utilisateurs...');

  const usersData = readJsonFile(USERS_FILE);
  if (usersData.length === 0) {
    console.log('   Aucun utilisateur à migrer');
    return new Map();
  }

  const userMapping = new Map(); // oldId -> newId

  for (const userData of usersData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ username: userData.username });

      if (!user) {
        // Créer un nouvel utilisateur
        user = await User.create({
          username: userData.username,
          email: userData.email || `${userData.username}@oufarez.cm`,
          telephone: userData.telephone || '+237600000000',
          password: userData.password, // Déjà hashé avec bcrypt
          role: userData.role || 'declarant',
          isActive: true
        });
        console.log(`   ✅ Utilisateur créé: ${user.username} (${user._id})`);
      } else {
        console.log(`   ⏭️  Utilisateur existant: ${user.username} (${user._id})`);
      }

      userMapping.set(userData.id, user._id);
    } catch (error) {
      console.error(`   ❌ Erreur pour ${userData.username}:`, error.message);
    }
  }

  console.log(`   Total: ${userMapping.size} utilisateurs migrés`);
  return userMapping;
}

// Migration des documents/déclarations
async function migrateDocuments(userMapping) {
  console.log('\n📄 Migration des déclarations...');

  const documentsData = readJsonFile(DOCUMENTS_FILE);
  if (documentsData.length === 0) {
    console.log('   Aucune déclaration à migrer');
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;

  for (const docData of documentsData) {
    try {
      // Récupérer l'ID MongoDB de l'utilisateur
      const userId = userMapping.get(docData.declarantId);
      if (!userId) {
        console.warn(`   ⚠️  Utilisateur non trouvé pour la déclaration #${docData.id}`);
        skippedCount++;
        continue;
      }

      // Vérifier si la déclaration existe déjà (basé sur des critères uniques)
      const existing = await Declaration.findOne({
        utilisateur: userId,
        typeDocument: docData.typeDocument,
        nomPartiel: docData.nom,
        dateEvenement: new Date(docData.date)
      });

      if (existing) {
        console.log(`   ⏭️  Déclaration existante: ${existing._id}`);
        skippedCount++;
        continue;
      }

      // Créer la nouvelle déclaration
      const declaration = await Declaration.create({
        utilisateur: userId,
        type: docData.typeDeclaration === 'perdu' ? 'PERTE' : 'DECOUVERTE',
        typeDocument: mapDocumentType(docData.typeDocument),
        description: docData.description || `Document ${docData.typeDocument} au nom de ${docData.nom}`,
        nomPartiel: docData.nom,
        numeroPartiel: docData.numero || null,
        dateEvenement: new Date(docData.date),
        localisation: {
          ville: docData.lieu || 'Yaoundé',
          quartier: null,
          geo: {
            type: 'Point',
            coordinates: [11.5174, 3.8480] // Coordonnées par défaut (Yaoundé)
          }
        },
        statut: 'EN_ATTENTE',
        contactMasque: true,
        metadata: {
          source: 'migration-json',
          originalId: docData.id
        }
      });

      console.log(`   ✅ Déclaration créée: ${declaration._id}`);
      migratedCount++;
    } catch (error) {
      console.error(`   ❌ Erreur pour déclaration #${docData.id}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`   Total: ${migratedCount} déclarations migrées, ${skippedCount} ignorées`);
}

// Mapper les types de documents
function mapDocumentType(oldType) {
  const mapping = {
    'CNI': 'CNI',
    'Carte Nationale d\'Identité': 'CNI',
    'Passeport': 'PASSEPORT',
    'Permis de Conduire': 'PERMIS',
    'Carte Scolaire': 'CARTE_SCOLAIRE',
    'Diplôme': 'DIPLOME',
    'Acte de Naissance': 'ACTE_NAISSANCE'
  };

  return mapping[oldType] || 'AUTRE';
}

// Statistiques post-migration
async function displayStatistics() {
  console.log('\n📊 Statistiques de la base de données:');

  const usersCount = await User.countDocuments();
  const declarationsCount = await Declaration.countDocuments();
  const pertesCount = await Declaration.countDocuments({ type: 'PERTE' });
  const decouvertesCount = await Declaration.countDocuments({ type: 'DECOUVERTE' });

  console.log(`   Utilisateurs: ${usersCount}`);
  console.log(`   Déclarations: ${declarationsCount}`);
  console.log(`     - Pertes: ${pertesCount}`);
  console.log(`     - Découvertes: ${decouvertesCount}`);
}

// Fonction principale
async function main() {
  console.log('🚀 Début de la migration JSON → MongoDB\n');
  console.log('═'.repeat(50));

  try {
    // Connexion
    await connectDB();

    // Migration des utilisateurs
    const userMapping = await migrateUsers();

    // Migration des déclarations
    await migrateDocuments(userMapping);

    // Statistiques
    await displayStatistics();

    console.log('\n═'.repeat(50));
    console.log('✅ Migration terminée avec succès !\n');
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Connexion MongoDB fermée');
  }
}

// Exécution
if (require.main === module) {
  main();
}

module.exports = { migrateUsers, migrateDocuments };
