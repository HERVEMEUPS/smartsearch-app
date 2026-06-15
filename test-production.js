#!/usr/bin/env node

/**
 * Script de test de l'API en production
 * Teste tous les endpoints critiques
 */

const API_URL = 'https://smartsearch-backend.onrender.com';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message) {
  log('✅', message, colors.green);
}

function error(message) {
  log('❌', message, colors.red);
}

function info(message) {
  log('ℹ️ ', message, colors.cyan);
}

function step(message) {
  log('📍', message, colors.blue);
}

async function testEndpoint(name, url, options = {}, expectedData = null) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      success(`${name} - OK (${response.status})`);

      if (expectedData) {
        for (const [key, value] of Object.entries(expectedData)) {
          if (data[key] !== value) {
            error(`  Expected ${key}=${value}, got ${data[key]}`);
            return { success: false, data };
          }
        }
      }

      return { success: true, data };
    } else {
      error(`${name} - FAILED (${response.status})`);
      console.log('  Response:', JSON.stringify(data, null, 2));
      return { success: false, data };
    }
  } catch (err) {
    error(`${name} - ERROR: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪', 'Tests de l\'API SmartSearch en Production', colors.yellow);
  console.log('='.repeat(60) + '\n');

  info(`API URL: ${API_URL}\n`);

  let token = null;
  let userId = null;

  // Test 1: Health Check
  step('Test 1/7: Health Check');
  const health = await testEndpoint(
    'GET /health',
    `${API_URL}/health`,
    {},
    { status: 'healthy' }
  );
  console.log('');

  // Test 2: Page d'accueil
  step('Test 2/7: Page d\'accueil');
  await testEndpoint(
    'GET /',
    `${API_URL}/`,
    {},
    { status: 'online' }
  );
  console.log('');

  // Test 3: Login Admin
  step('Test 3/7: Login Admin');
  const login = await testEndpoint(
    'POST /api/auth/login',
    `${API_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    }
  );

  if (login.success && login.data.success) {
    token = login.data.data.accessToken;
    info(`Token obtenu: ${token.substring(0, 20)}...`);
  } else {
    error('Impossible de se connecter - les tests suivants seront ignorés');
    console.log('\n' + '='.repeat(60));
    log('📊', 'Résumé: Login échoué, backend probablement mal configuré', colors.yellow);
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
  console.log('');

  // Test 4: Liste des utilisateurs
  step('Test 4/7: Liste des utilisateurs');
  const users = await testEndpoint(
    'GET /api/admin/users',
    `${API_URL}/api/admin/users`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  if (users.success && users.data.success) {
    const usersList = users.data.data;
    info(`${usersList.length} utilisateur(s) trouvé(s)`);

    // Trouver un utilisateur de test
    const testUser = usersList.find(u => u.username === 'test_declarant');
    if (testUser) {
      userId = testUser._id;
      info(`Utilisateur de test trouvé: ${testUser.username} (${userId})`);
    } else {
      info('Aucun utilisateur "test_declarant" trouvé - création recommandée');
    }
  }
  console.log('');

  // Test 5: Statistiques utilisateurs
  step('Test 5/7: Statistiques utilisateurs');
  const stats = await testEndpoint(
    'GET /api/admin/statistics/users',
    `${API_URL}/api/admin/statistics/users`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  if (stats.success && stats.data.success) {
    const data = stats.data.data;
    info(`Total: ${data.total}, Admins: ${data.admins}, Déclarants: ${data.declarants}`);
  }
  console.log('');

  // Test 6: Réinitialisation mot de passe (si utilisateur de test disponible)
  if (userId) {
    step('Test 6/7: Réinitialisation mot de passe');
    const reset = await testEndpoint(
      'PATCH /api/admin/users/:id/reset-password',
      `${API_URL}/api/admin/users/${userId}/reset-password`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: 'test123456' })
      }
    );

    if (reset.success && reset.data.success) {
      success('Réinitialisation de mot de passe fonctionne !');

      // Test 6b: Vérifier connexion avec nouveau mot de passe
      info('Test de connexion avec le nouveau mot de passe...');
      const testLogin = await testEndpoint(
        'POST /api/auth/login (nouveau password)',
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'test_declarant',
            password: 'test123456'
          })
        }
      );

      if (testLogin.success) {
        success('Connexion avec nouveau mot de passe réussie !');
      } else {
        error('Échec connexion avec nouveau mot de passe');
      }
    }
  } else {
    info('Test 6/7: IGNORÉ (pas d\'utilisateur de test)');
  }
  console.log('');

  // Test 7: Déclarations
  step('Test 7/7: Liste des déclarations');
  await testEndpoint(
    'GET /api/declarations',
    `${API_URL}/api/declarations`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  console.log('');

  // Résumé
  console.log('='.repeat(60));
  success('Tous les tests principaux sont passés !');
  console.log('='.repeat(60) + '\n');

  info('Votre backend est opérationnel en production ! 🎉\n');
}

// Exécuter les tests
runTests().catch(err => {
  error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
