/**
 * Script pour tester l'API des correspondances
 */
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('🧪 TEST: API Correspondances\n');
    console.log('═'.repeat(80));

    // 1. Login en tant qu'admin (essayer plusieurs mots de passe)
    console.log('\n1️⃣ Connexion admin...');

    const passwords = ['Admin@2026', 'Admin2026', 'admin123', 'admin', 'Admin123!', 'password'];
    let token = null;

    for (const password of passwords) {
      try {
        console.log(`   Essai: ${password}`);
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          username: 'admin',
          password: password
        });
        token = loginResponse.data.data.accessToken;
        console.log(`   ✅ Connecté avec: ${password}`);
        break;
      } catch (error) {
        // Ignorer
      }
    }

    if (!token) {
      throw new Error('Impossible de se connecter');
    }

    // 2. Récupérer toutes les correspondances
    console.log('\n2️⃣ Récupération des correspondances...');
    const correspondancesResponse = await axios.get(`${API_URL}/api/correspondances`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const correspondances = correspondancesResponse.data.data;
    console.log(`   ✅ ${correspondances.length} correspondance(s) récupérée(s)`);

    // 3. Afficher les détails
    console.log('\n' + '═'.repeat(80));
    console.log('📋 CORRESPONDANCES DÉTECTÉES:\n');

    if (correspondances.length === 0) {
      console.log('❌ Aucune correspondance trouvée');
    } else {
      correspondances.forEach((corr, index) => {
        const perte = corr.declarationPerteId;
        const decouverte = corr.declarationDecouverteId;
        const scorePercent = Math.round((corr.scoreGlobal || 0) * 100);

        console.log(`${index + 1}. 🔗 Match ${scorePercent}% - ${corr.statut}`);
        console.log(`   📄 ${perte?.typeDocument || 'N/A'}`);
        console.log(`   🔴 Perdu: ${perte?.nomPartiel || 'N/A'} (${perte?.numeroPartiel || 'N/A'})`);
        console.log(`   🟢 Trouvé: ${decouverte?.nomPartiel || 'N/A'} (${decouverte?.numeroPartiel || 'N/A'})`);
        console.log('');
      });
    }

    console.log('═'.repeat(80));

    // 4. Test endpoint sans authentification (doit échouer)
    console.log('\n3️⃣ Test sans authentification (doit échouer)...');
    try {
      await axios.get(`${API_URL}/api/correspondances`);
      console.log('   ❌ ERREUR: Endpoint accessible sans token !');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Endpoint protégé correctement (401 Unauthorized)');
      } else {
        console.log(`   ⚠️  Erreur inattendue: ${error.response?.status}`);
      }
    }

    console.log('\n✅ Tests terminés !\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
