/**
 * Script pour déclencher manuellement le matching sur les déclarations existantes
 */
const mongoose = require('mongoose');
require('dotenv').config();

// Charger les modèles
require('./src/models');
const Declaration = require('./src/models/Declaration');
const matchingService = require('./src/services/matchingService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function triggerMatching() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les déclarations EN_ATTENTE
    const declarations = await Declaration.find({
      statut: { $in: ['EN_ATTENTE', 'EN_MATCH'] }
    });

    console.log(`📊 ${declarations.length} déclaration(s) à analyser\n`);

    if (declarations.length === 0) {
      console.log('⚠️  Aucune déclaration à traiter');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🔍 Lancement du matching automatique...\n');

    // Déclencher le matching pour chaque déclaration
    for (const declaration of declarations) {
      console.log(`\n📄 Traitement: ${declaration.type} - ${declaration.typeDocument} - ${declaration.nomPartiel || 'N/A'}`);

      try {
        await matchingService.findMatchesFor(declaration._id);
        console.log(`   ✅ Matching terminé`);
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }

    console.log('\n\n✅ Matching terminé pour toutes les déclarations');
    console.log('💡 Vérifiez le dashboard pour voir les correspondances trouvées\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

triggerMatching();
