// Script pour hacher les mots de passe existants
const bcrypt = require('bcrypt');
const fs = require('fs');

const SALT_ROUNDS = 10;

async function hashPasswords() {
    try {
        // Lire le fichier users.json
        const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

        console.log('🔐 Hachage des mots de passe en cours...\n');

        // Hacher chaque mot de passe
        for (let user of users) {
            const plainPassword = user.password;

            // Vérifier si déjà haché (commence par $2b$)
            if (plainPassword.startsWith('$2b$')) {
                console.log(`✅ ${user.username} - Déjà haché`);
                continue;
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
            user.password = hashedPassword;

            console.log(`✅ ${user.username} - Mot de passe haché`);
            console.log(`   Ancien: ${plainPassword}`);
            console.log(`   Nouveau: ${hashedPassword.substring(0, 30)}...\n`);
        }

        // Sauvegarder le fichier
        fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

        console.log('✅ Tous les mots de passe ont été hachés !');
        console.log('✅ Fichier users.json mis à jour\n');

        console.log('📋 Comptes disponibles :');
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

hashPasswords();
