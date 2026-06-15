const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function diagnostic() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Charger les modèles
    const Declaration = mongoose.model('Declaration', new mongoose.Schema({}, { strict: false }));
    const Correspondance = mongoose.model('Correspondance', new mongoose.Schema({}, { strict: false }));

    // 1. Statistiques des déclarations
    console.log('📊 STATISTIQUES DES DÉCLARATIONS:');
    const total = await Declaration.countDocuments();
    const pertes = await Declaration.countDocuments({ type: 'PERTE' });
    const decouvertes = await Declaration.countDocuments({ type: 'DECOUVERTE' });

    console.log(`  Total: ${total}`);
    console.log(`  PERTE (documents perdus): ${pertes}`);
    console.log(`  DECOUVERTE (documents trouvés): ${decouvertes}\n`);

    // 2. Exemples de déclarations
    if (total > 0) {
      console.log('📄 EXEMPLES DE DÉCLARATIONS:');
      const examples = await Declaration.find()
        .limit(10)
        .select('type typeDocument nomPartiel numeroPartiel localisation.ville')
        .lean();

      examples.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. ${doc.type} | ${doc.typeDocument} | ${doc.nomPartiel || 'N/A'} | ${doc.numeroPartiel || 'N/A'} | ${doc.localisation?.ville || 'N/A'}`);
      });
      console.log('');
    }

    // 3. Statistiques des correspondances
    console.log('🔗 STATISTIQUES DES CORRESPONDANCES:');
    const totalCorrespondances = await Correspondance.countDocuments();
    const proposees = await Correspondance.countDocuments({ statut: 'PROPOSEE' });
    const acceptees = await Correspondance.countDocuments({ statut: 'ACCEPTEE' });
    const confirmees = await Correspondance.countDocuments({ statut: 'CONFIRMEE' });
    const rejetees = await Correspondance.countDocuments({ statut: 'REJETEE' });

    console.log(`  Total correspondances: ${totalCorrespondances}`);
    console.log(`  PROPOSEE: ${proposees}`);
    console.log(`  ACCEPTEE: ${acceptees}`);
    console.log(`  CONFIRMEE: ${confirmees}`);
    console.log(`  REJETEE: ${rejetees}\n`);

    // 4. Exemples de correspondances
    if (totalCorrespondances > 0) {
      console.log('🔍 EXEMPLES DE CORRESPONDANCES:');
      const matches = await Correspondance.find()
        .populate('declarationPerteId', 'type typeDocument nomPartiel numeroPartiel')
        .populate('declarationDecouverteId', 'type typeDocument nomPartiel numeroPartiel')
        .limit(5)
        .lean();

      matches.forEach((match, idx) => {
        const perte = match.declarationPerteId || {};
        const decouverte = match.declarationDecouverteId || {};
        const score = Math.round((match.scoreGlobal || 0) * 100);

        console.log(`  ${idx + 1}. Score: ${score}% | Statut: ${match.statut}`);
        console.log(`     PERTE: ${perte.typeDocument} - ${perte.nomPartiel || 'N/A'}`);
        console.log(`     DECOUVERTE: ${decouverte.typeDocument} - ${decouverte.nomPartiel || 'N/A'}`);
      });
      console.log('');
    }

    // 5. Diagnostic
    console.log('💡 DIAGNOSTIC:');
    if (pertes === 0 && decouvertes === 0) {
      console.log('  ⚠️  Aucune déclaration dans la base de données.');
      console.log('  👉 Créez des déclarations via le formulaire frontend.');
    } else if (pertes === 0) {
      console.log('  ⚠️  Aucun document PERTE (perdu) dans la base.');
      console.log('  👉 Déclarez au moins un document perdu pour créer des correspondances.');
    } else if (decouvertes === 0) {
      console.log('  ⚠️  Aucun document DECOUVERTE (trouvé) dans la base.');
      console.log('  👉 Déclarez au moins un document trouvé pour créer des correspondances.');
    } else if (totalCorrespondances === 0) {
      console.log('  ⚠️  Des documents existent mais aucune correspondance n\'a été créée.');
      console.log('  👉 Causes possibles:');
      console.log('     - Les documents sont trop différents (noms, numéros, lieux, dates)');
      console.log('     - Le service de matching automatique n\'a pas été exécuté');
      console.log('     - Le service IA de matching n\'est pas disponible');
      console.log('  👉 Solution: Vérifiez les logs backend et le service IA');
    } else {
      console.log(`  ✅ Tout fonctionne ! ${totalCorrespondances} correspondance(s) trouvée(s).`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Diagnostic terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

diagnostic();
