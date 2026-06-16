/**
 * Script pour FORCER la suppression et recréation des correspondances
 * Utiliser si les correspondances ne s'affichent pas
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function forceRecreateMatches() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Declaration = require('./src/models/Declaration');
    const Correspondance = require('./src/models/Correspondance');
    const matchingService = require('./src/services/matchingService');

    // ÉTAPE 1: Supprimer TOUTES les correspondances existantes
    console.log('🗑️  ÉTAPE 1: Suppression des anciennes correspondances...');
    const deleteResult = await Correspondance.deleteMany({});
    console.log(`   ✅ ${deleteResult.deletedCount} correspondance(s) supprimée(s)\n`);

    // ÉTAPE 2: Réinitialiser les statuts des déclarations
    console.log('🔄 ÉTAPE 2: Réinitialisation des statuts...');
    await Declaration.updateMany(
      { statut: { $in: ['EN_MATCH', 'CLOTUREE'] } },
      { statut: 'EN_ATTENTE' }
    );
    console.log('   ✅ Statuts réinitialisés\n');

    // ÉTAPE 3: Récupérer toutes les déclarations
    console.log('📋 ÉTAPE 3: Récupération des déclarations...');
    const declarations = await Declaration.find({
      statut: 'EN_ATTENTE'
    }).sort({ createdAt: -1 });

    console.log(`   📊 ${declarations.length} déclaration(s) trouvée(s):\n`);

    declarations.forEach(decl => {
      console.log(`   ${decl.type.padEnd(12)} | ${decl.typeDocument.padEnd(18)} | ${(decl.nomPartiel || 'N/A').padEnd(20)} | ${decl.numeroPartiel || 'N/A'}`);
    });

    // ÉTAPE 4: Lancer le matching pour chaque déclaration
    console.log('\n🔍 ÉTAPE 4: Lancement du matching...\n');

    let matchesCreated = 0;

    for (const declaration of declarations) {
      console.log(`\n📄 Traitement: ${declaration.type} - ${declaration.typeDocument} - ${declaration.nomPartiel || 'N/A'}`);

      try {
        // Trouver les candidats
        const candidates = await Declaration
          .find()
          .matchCandidates(declaration, 30);

        console.log(`   🔍 ${candidates.length} candidat(s) trouvé(s)`);

        if (candidates.length === 0) {
          console.log('   ⏭️  Aucun candidat, passage au suivant');
          continue;
        }

        // Pour chaque candidat, calculer le score
        for (const candidate of candidates) {
          console.log(`\n   🧮 Calcul du match avec: ${candidate.type} - ${candidate.nomPartiel || 'N/A'}`);

          const matchResult = await matchingService.computeMatch(declaration, candidate);

          console.log(`      Score: ${(matchResult.score_global * 100).toFixed(1)}%`);
          console.log(`      Au-dessus du seuil (72%): ${matchResult.au_dessus_du_seuil ? '✅ OUI' : '❌ NON'}`);

          if (matchResult.au_dessus_du_seuil) {
            // Créer la correspondance
            const declPerte = declaration.type === 'PERTE' ? declaration : candidate;
            const declDecouverte = declaration.type === 'DECOUVERTE' ? declaration : candidate;

            const correspondance = await Correspondance.create({
              declarationPerteId: declPerte._id,
              declarationDecouverteId: declDecouverte._id,
              scoreGlobal: matchResult.score_global,
              scoreNLP: matchResult.score_nlp,
              scoreLLM: matchResult.score_llm,
              scoreGeo: matchResult.score_geo,
              statut: 'PROPOSEE',
              metadataIA: {
                modelUsed: 'basic-algorithm',
                confidence: matchResult.score_global,
                reasoning: matchResult.justification,
                version: '3.2'
              }
            });

            console.log(`      ✅ Correspondance créée: ${correspondance._id}`);
            matchesCreated++;

            // Mettre à jour les statuts
            await Declaration.updateMany(
              { _id: { $in: [declPerte._id, declDecouverte._id] } },
              { statut: 'EN_MATCH' }
            );
          } else {
            console.log(`      ⏭️  Score trop faible, ignoré`);
          }
        }

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
      }
    }

    // ÉTAPE 5: Vérifier les résultats
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 RÉSULTAT FINAL');
    console.log('═'.repeat(80));

    const finalCount = await Correspondance.countDocuments();
    console.log(`\n✅ ${finalCount} correspondance(s) créée(s) au total\n`);

    if (finalCount > 0) {
      const correspondances = await Correspondance.find()
        .populate('declarationPerteId')
        .populate('declarationDecouverteId')
        .sort({ scoreGlobal: -1 });

      correspondances.forEach((corr, index) => {
        const perte = corr.declarationPerteId;
        const decouverte = corr.declarationDecouverteId;
        console.log(`${index + 1}. 🔗 Match ${(corr.scoreGlobal * 100).toFixed(0)}% - ${perte?.typeDocument || 'N/A'}`);
        console.log(`   🔴 ${perte?.nomPartiel || 'N/A'} (${perte?.numeroPartiel || 'N/A'})`);
        console.log(`   🟢 ${decouverte?.nomPartiel || 'N/A'} (${decouverte?.numeroPartiel || 'N/A'})`);
        console.log('');
      });
    } else {
      console.log('⚠️  AUCUNE correspondance créée !');
      console.log('\n💡 Raisons possibles:');
      console.log('   - Pas de documents avec le même type');
      console.log('   - Pas de documents avec PERTE ↔ DECOUVERTE');
      console.log('   - Scores tous en dessous de 72%');
    }

    console.log('═'.repeat(80));
    console.log('\n✅ Script terminé !');
    console.log('💡 Actualisez maintenant le dashboard: http://localhost:3000/frontend/dashboard.html\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

forceRecreateMatches();
