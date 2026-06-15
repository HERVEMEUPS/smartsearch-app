// Script de test pour la réinitialisation du mot de passe
const API_URL = 'https://smartsearch-backend.onrender.com';

async function testResetPassword() {
  console.log('🧪 Test de réinitialisation du mot de passe...\n');

  // 1. Se connecter en tant qu'admin
  console.log('1️⃣ Connexion admin...');
  const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  console.log('Réponse login:', JSON.stringify(loginData, null, 2));

  if (!loginResponse.ok || !loginData.success) {
    console.error('❌ Échec de connexion');
    return;
  }

  const token = loginData.data.accessToken;
  console.log('✅ Connexion réussie\n');

  // 2. Obtenir la liste des utilisateurs
  console.log('2️⃣ Récupération des utilisateurs...');
  const usersResponse = await fetch(`${API_URL}/api/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const usersData = await usersResponse.json();
  console.log('Réponse users:', JSON.stringify(usersData, null, 2));

  if (!usersResponse.ok) {
    console.error('❌ Échec récupération utilisateurs');
    return;
  }

  const users = usersData.success ? usersData.data : usersData;
  const testUser = users.find(u => u.username === 'test_declarant');

  if (!testUser) {
    console.error('❌ Utilisateur test_declarant non trouvé');
    console.log('Utilisateurs disponibles:', users.map(u => u.username));
    return;
  }

  console.log(`✅ Utilisateur trouvé: ${testUser.username} (ID: ${testUser._id})\n`);

  // 3. Réinitialiser le mot de passe
  console.log('3️⃣ Réinitialisation du mot de passe...');
  const resetResponse = await fetch(`${API_URL}/api/admin/users/${testUser._id}/reset-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      newPassword: 'newpass123'
    })
  });

  console.log('Status:', resetResponse.status, resetResponse.statusText);
  console.log('Headers:', Object.fromEntries(resetResponse.headers.entries()));

  const resetData = await resetResponse.json();
  console.log('Réponse reset:', JSON.stringify(resetData, null, 2));

  if (resetResponse.ok && resetData.success) {
    console.log('✅ Mot de passe réinitialisé avec succès\n');

    // 4. Tester la connexion avec le nouveau mot de passe
    console.log('4️⃣ Test connexion avec nouveau mot de passe...');
    const testLoginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test_declarant',
        password: 'newpass123'
      })
    });

    const testLoginData = await testLoginResponse.json();
    console.log('Réponse test login:', JSON.stringify(testLoginData, null, 2));

    if (testLoginResponse.ok && testLoginData.success) {
      console.log('✅ Connexion avec nouveau mot de passe réussie');
    } else {
      console.log('❌ Échec connexion avec nouveau mot de passe');
    }
  } else {
    console.error('❌ Échec réinitialisation:', resetData.message || resetData);
  }
}

testResetPassword().catch(console.error);
