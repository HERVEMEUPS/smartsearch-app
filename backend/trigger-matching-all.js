/**
 * Script pour déclencher le matching sur TOUS les documents existants
 *
 * Ce script va:
 * 1. Se connecter à MongoDB
 * 2. Récupérer toutes les déclarations PERTE
 * 3. Lancer le matching pour chacune
 * 4. Afficher les correspondances créées
 */

const mongoose = require('mongoose');
const { Declaration } = require('./src/models');
const matchingService = require('./src/services/matchingService');
const config = require('./src/config');

async function triggerMatchingAll() {
    console.log('🚀 Démarrage du matching automatique pour tous les documents...\n');

    try {
        // Connexion à MongoDB
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('✅ Connecté à MongoDB\n');

        // Récupérer toutes les déclarations PERTE
        const declarationsPerte = await Declaration.find({ type: 'PERTE' });
        console.log(`📋 ${declarationsPerte.length} déclaration(s) PERTE trouvée(s)\n`);

        if (declarationsPerte.length === 0) {
            console.log('⚠️  Aucune déclaration PERTE trouvée. Créez d\'abord des déclarations.');
            return;
        }

        // Pour chaque déclaration PERTE, lancer le matching
        let totalMatches = 0;
        let totalErrors = 0;

        for (const declaration of declarationsPerte) {
            try {
                console.log(`🔍 Matching pour: ${declaration.typeDocument} - ${declaration.nomPartiel}`);
                await matchingService.findMatchesFor(declaration._id);
                totalMatches++;
                console.log(`   ✅ Matching terminé\n`);
            } catch (error) {
                totalErrors++;
                console.log(`   ❌ Erreur: ${error.message}\n`);
            }
        }

        // Récupérer et afficher toutes les correspondances créées
        const Correspondance = mongoose.model('Correspondance');
        const correspondances = await Correspondance.find()
            .populate('declarationPerteId')
            .populate('declarationDecouverteId')
            .sort({ scoreGlobal: -1 });

        console.log('='.repeat(70));
        console.log('📊 RÉSUMÉ DU MATCHING');
        console.log('='.repeat(70));
        console.log(`✅ Documents traités: ${totalMatches}`);
        console.log(`❌ Erreurs: ${totalErrors}`);
        console.log(`🔗 Correspondances créées: ${correspondances.length}`);
        console.log('='.repeat(70));

        if (correspondances.length > 0) {
            console.log('\n🎯 CORRESPONDANCES DÉTECTÉES:\n');

            correspondances.forEach((match, index) => {
                const perte = match.declarationPerteId;
                const decouverte = match.declarationDecouverteId;
                const score = (match.scoreGlobal * 100).toFixed(1);

                console.log(`${index + 1}. Score: ${score}% | Statut: ${match.statut}`);
                console.log(`   📍 PERDU:  ${perte.typeDocument} - ${perte.nomPartiel} (${perte.numeroPartiel || 'N/A'})`);
                console.log(`   ✅ TROUVÉ: ${decouverte.typeDocument} - ${decouverte.nomPartiel} (${decouverte.numeroPartiel || 'N/A'})`);
                console.log(`   📅 Dates: ${new Date(perte.dateEvenement).toLocaleDateString()} ↔ ${new Date(decouverte.dateEvenement).toLocaleDateString()}`);
                console.log(`   📍 Lieux: ${perte.localisation?.ville || 'N/A'} ↔ ${decouverte.localisation?.ville || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('\n⚠️  Aucune correspondance détectée.');
            console.log('💡 Vérifiez que vous avez des déclarations PERTE et DECOUVERTE similaires.\n');

            // Afficher les documents disponibles
            const allDeclarations = await Declaration.find().select('type typeDocument nomPartiel numeroPartiel');
            console.log('📋 Documents disponibles:');
            allDeclarations.forEach(d => {
                console.log(`   ${d.type === 'PERTE' ? '📍' : '✅'} ${d.type} - ${d.typeDocument} - ${d.nomPartiel} (${d.numeroPartiel || 'N/A'})`);
            });
        }

        console.log('\n🎉 Matching terminé !');

    } catch (error) {
        console.error('\n❌ Erreur fatale:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Déconnecté de MongoDB');
    }
}

// Exécution
triggerMatchingAll()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur lors de l\'exécution:', error.message);
        process.exit(1);
    });
