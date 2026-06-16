/**
 * Script pour vérifier les correspondances créées
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function checkCorrespondances() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Correspondance = require('../src/models/Correspondance');
    const Declaration = require('../src/models/Declaration');

    // Récupérer toutes les correspondances
    const correspondances = await Correspondance.find()
      .populate('declarationPerteId')
      .populate('declarationDecouverteId')
      .sort({ scoreGlobal: -1 });

    console.log(`📊 ${correspondances.length} correspondance(s) trouvée(s)\n`);
    console.log('═'.repeat(80));

    if (correspondances.length === 0) {
      console.log('❌ Aucune correspondance dans la base de données');
      console.log('\n💡 Raisons possibles:');
      console.log('   1. Score en dessous du seuil (72%)');
      console.log('   2. Correspondance déjà existante (skip)');
      console.log('   3. Problème dans l\'algorithme de matching');

      // Vérifier les déclarations
      console.log('\n📋 Déclarations dans la base:');
      const declarations = await Declaration.find().sort({ createdAt: -1 });
      declarations.forEach(decl => {
        console.log(`   ${decl.type.padEnd(12)} | ${decl.typeDocument.padEnd(18)} | ${decl.nomPartiel?.padEnd(20) || 'N/A'.padEnd(20)} | ${decl.numeroPartiel || 'N/A'}`);
      });
    } else {
      correspondances.forEach((corr, index) => {
        const perte = corr.declarationPerteId;
        const decouverte = corr.declarationDecouverteId;

        console.log(`\n${index + 1}. 🔗 CORRESPONDANCE #${corr._id}`);
        console.log('─'.repeat(80));
        console.log(`   📊 Score Global: ${(corr.scoreGlobal * 100).toFixed(1)}%`);
        console.log(`   📈 Détails: NLP=${(corr.scoreNLP * 100).toFixed(1)}% | LLM=${(corr.scoreLLM * 100).toFixed(1)}% | GEO=${(corr.scoreGeo * 100).toFixed(1)}%`);
        console.log(`   ⚡ Statut: ${corr.statut}`);
        console.log(`   📅 Créé le: ${corr.createdAt.toLocaleDateString('fr-FR')}`);

        if (perte) {
          console.log(`\n   🔴 PERTE:`);
          console.log(`      Type: ${perte.typeDocument}`);
          console.log(`      Nom: ${perte.nomPartiel || 'N/A'}`);
          console.log(`      Numéro: ${perte.numeroPartiel || 'N/A'}`);
          console.log(`      Lieu: ${perte.localisation?.ville || 'N/A'}`);
          console.log(`      Date: ${new Date(perte.dateEvenement).toLocaleDateString('fr-FR')}`);
        }

        if (decouverte) {
          console.log(`\n   🟢 TROUVÉ:`);
          console.log(`      Type: ${decouverte.typeDocument}`);
          console.log(`      Nom: ${decouverte.nomPartiel || 'N/A'}`);
          console.log(`      Numéro: ${decouverte.numeroPartiel || 'N/A'}`);
          console.log(`      Lieu: ${decouverte.localisation?.ville || 'N/A'}`);
          console.log(`      Date: ${new Date(decouverte.dateEvenement).toLocaleDateString('fr-FR')}`);
        }

        if (corr.metadataIA?.reasoning) {
          console.log(`\n   💡 Raisonnement: ${corr.metadataIA.reasoning}`);
        }
      });
    }

    console.log('\n' + '═'.repeat(80));

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkCorrespondances();
