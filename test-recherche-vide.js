#!/usr/bin/env node

const API_URL = 'https://smartsearch-backend-pxw5.onrender.com';

async function testRechercheVide() {
  console.log('🧪 Test recherche SANS critères\n');

  // 1. Test sans authentification (pour voir si c'est ça le problème)
  console.log('1️⃣ Test SANS token...');
  const response1 = await fetch(`${API_URL}/api/declarations`);
  console.log('Status:', response1.status);

  if (response1.status === 401) {
    console.log('❌ 401 - Authentification requise\n');

    // 2. Se connecter
    console.log('2️⃣ Connexion...');

    // Essayer avec différents comptes
    const accounts = [
      { username: 'admin', password: 'admin123' },
      { username: 'test_declarant', password: 'test123' }
    ];

    let token = null;

    for (const account of accounts) {
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });

      const loginData = await loginResponse.json();
      console.log(`Essai ${account.username}:`, loginData.success ? '✅' : '❌', loginData.message || '');

      if (loginResponse.ok && loginData.success) {
        token = loginData.data.accessToken;
        console.log(`✅ Connecté avec ${account.username}\n`);
        break;
      }
    }

    if (!token) {
      console.log('❌ Aucun compte ne fonctionne. Il faut créer un utilisateur.\n');
      return;
    }

    // 3. Rechercher SANS critères
    console.log('3️⃣ Recherche de TOUS les documents...');
    const response2 = await fetch(`${API_URL}/api/declarations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Status:', response2.status);

    if (!response2.ok) {
      console.log('❌ Erreur');
      return;
    }

    const data = await response2.json();
    console.log('\n📦 Résultats:', JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log(`\n✅ ${data.data.length} document(s) trouvé(s)\n`);

      data.data.forEach((doc, i) => {
        console.log(`Document ${i + 1}:`);
        console.log(`  ID: ${doc._id}`);
        console.log(`  Type: ${doc.type}`);
        console.log(`  Type doc: ${doc.typeDocument}`);
        console.log(`  Nom: ${doc.nomPartiel || 'N/A'}`);
        console.log(`  Numéro: ${doc.numeroPartiel || 'N/A'}`);
        console.log(`  Lieu: ${doc.localisation?.ville || 'N/A'}, ${doc.localisation?.quartier || 'N/A'}`);
        console.log(`  Date: ${doc.dateEvenement}`);
        console.log(`  Statut: ${doc.statut}`);
        console.log('');
      });

      // 4. Test avec les critères spécifiques
      console.log('4️⃣ Test avec critères spécifiques...');

      const params = new URLSearchParams({
        search: 'DJANGA Kymia AN203/25',
        ville: 'Yaoundé',
        dateDebut: '2025-11-08',
        dateFin: '2026-06-15'
      });

      console.log('Paramètres:', Object.fromEntries(params));

      const response3 = await fetch(`${API_URL}/api/declarations?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data3 = await response3.json();
      console.log('Résultats avec critères:', data3.success ? `${data3.data.length} trouvé(s)` : 'Erreur');

      if (data3.success && data3.data.length === 0) {
        console.log('\n⚠️ Aucun résultat avec ces critères. Essayons séparément:\n');

        // Test chaque critère séparément
        const tests = [
          { search: 'DJANGA' },
          { search: 'Kymia' },
          { search: 'AN203' },
          { ville: 'Yaoundé' },
          { ville: 'Yaounde' }, // sans accent
          { dateDebut: '2025-11-08', dateFin: '2026-06-15' }
        ];

        for (const test of tests) {
          const p = new URLSearchParams(test);
          const r = await fetch(`${API_URL}/api/declarations?${p.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const d = await r.json();
          console.log(`  ${JSON.stringify(test)}: ${d.data?.length || 0} résultat(s)`);
        }
      }
    }
  }
}

testRechercheVide().catch(console.error);
