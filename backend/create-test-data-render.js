/**
 * Script pour créer des données de test sur le serveur RENDER (Production)
 *
 * Ce script va créer 3 documents PERTE et 3 documents DECOUVERTE
 * sur la base de données MongoDB Atlas liée à Render
 */

const API_URL = 'https://smartsearch-backend-pxw5.onrender.com';

// Vous devez remplacer ces identifiants par un compte admin valide
const ADMIN_USERNAME = 'admin';  // À remplacer
const ADMIN_PASSWORD = 'admin';  // À remplacer

const testDeclarations = [
    // DOCUMENTS PERDUS
    {
        type: 'PERTE',
        typeDocument: 'ACTE_NAISSANCE',
        nomPartiel: 'DJANGA Kymia',
        numeroPartiel: 'AN203/25',
        localisation: { ville: 'Yaoundé', quartier: 'Bastos' },
        dateEvenement: '2025-10-31',
        description: 'Acte de naissance perdu lors d\'un déménagement'
    },
    {
        type: 'PERTE',
        typeDocument: 'PERMIS',
        nomPartiel: 'MEUPIE',
        numeroPartiel: 'Pe4325',
        localisation: { ville: 'Yaoundé', quartier: 'Centre-ville' },
        dateEvenement: '2026-05-19',
        description: 'Permis de conduire perdu au marché central'
    },
    {
        type: 'PERTE',
        typeDocument: 'PASSEPORT',
        nomPartiel: 'FOSSI',
        numeroPartiel: 'Pass12345678',
        localisation: { ville: 'Nkongsamba', quartier: '' },
        dateEvenement: '2026-05-21',
        description: 'Passeport perdu lors d\'un voyage'
    },

    // DOCUMENTS TROUVÉS
    {
        type: 'DECOUVERTE',
        typeDocument: 'ACTE_NAISSANCE',
        nomPartiel: 'DJANGA Kymia',
        numeroPartiel: 'AN203/25',
        localisation: { ville: 'Yaoundé', quartier: 'Essos' },
        dateEvenement: '2025-11-03',
        description: 'Acte de naissance trouvé dans une gare routière'
    },
    {
        type: 'DECOUVERTE',
        typeDocument: 'PERMIS',
        nomPartiel: 'MEUPIE',
        numeroPartiel: 'Pe4325',
        localisation: { ville: 'Yaoundé', quartier: 'Messa' },
        dateEvenement: '2026-05-19',
        description: 'Permis de conduire retrouvé à un arrêt de bus'
    },
    {
        type: 'DECOUVERTE',
        typeDocument: 'ACTE_NAISSANCE',
        nomPartiel: 'MAFO Krystie',
        numeroPartiel: 'AN239/21',
        localisation: { ville: 'Yaoundé', quartier: 'Mokolo' },
        dateEvenement: '2026-01-15',
        description: 'Acte de naissance trouvé dans un taxi'
    }
];

async function login() {
    console.log('🔐 Connexion à l\'API Render...');

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erreur de connexion: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        const token = data.data?.accessToken || data.token;

        console.log('✅ Connexion réussie');
        return token;
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        throw error;
    }
}

async function createDeclaration(token, declaration) {
    try {
        const response = await fetch(`${API_URL}/api/declarations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(declaration)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || response.statusText);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('❌ Erreur création:', error.message);
        throw error;
    }
}

async function main() {
    console.log('🚀 Création de données de test sur Render...\n');
    console.log(`⚠️  IMPORTANT: Assurez-vous d'avoir mis à jour les identifiants admin dans le script\n`);

    try {
        // 1. Connexion
        const token = await login();

        // 2. Créer chaque déclaration
        console.log('\n📝 Création des déclarations...\n');
        let created = 0;
        let errors = 0;

        for (const declaration of testDeclarations) {
            try {
                const result = await createDeclaration(token, declaration);
                console.log(`✅ ${declaration.type} - ${declaration.typeDocument} - ${declaration.nomPartiel}`);
                created++;
            } catch (error) {
                console.error(`❌ ${declaration.type} - ${declaration.typeDocument} - ${declaration.nomPartiel}: ${error.message}`);
                errors++;
            }
        }

        // 3. Résumé
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ');
        console.log('='.repeat(60));
        console.log(`✅ Créées avec succès : ${created}`);
        console.log(`❌ Erreurs : ${errors}`);
        console.log('='.repeat(60));

        if (created > 0) {
            console.log('\n🎉 Données de test créées sur Render !');
            console.log('🌐 Vous pouvez maintenant tester sur: https://votre-frontend-render.com');
            console.log('\n💡 Pour vérifier les données:');
            console.log(`   - Ouvrez: ${API_URL}/api/declarations`);
            console.log(`   - Dashboard: Vérifiez que les stats affichent ${Math.floor(created/2)} PERTE et ${Math.ceil(created/2)} DECOUVERTE`);
        }

    } catch (error) {
        console.error('\n❌ Erreur fatale:', error.message);
        console.log('\n💡 Vérifications:');
        console.log('   1. Le serveur Render est-il en ligne?');
        console.log('   2. Les identifiants admin sont-ils corrects?');
        console.log('   3. Avez-vous un compte admin sur Render?');
    }
}

// Exécution
main();
