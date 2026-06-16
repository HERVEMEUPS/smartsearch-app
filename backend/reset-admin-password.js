/**
 * Script pour réinitialiser le mot de passe admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('./src/config');

async function resetAdminPassword() {
    console.log('🔐 Réinitialisation du mot de passe admin...\n');

    try {
        // Connexion à MongoDB
        console.log('📡 Connexion à MongoDB...');
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('✅ Connecté à MongoDB\n');

        // Charger le modèle User
        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            email: String,
            password: String,
            role: String
        }, { strict: false, collection: 'users' }));

        // Chercher l'utilisateur admin
        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            console.log('❌ Utilisateur admin non trouvé.');
            console.log('💡 Création d\'un nouvel utilisateur admin...\n');

            // Créer un nouvel admin
            const hashedPassword = await bcrypt.hash('admin', config.bcrypt.saltRounds);

            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                emailVerified: true,
                isActive: true
            });

            console.log('✅ Nouvel utilisateur admin créé !');
            console.log('   Username: admin');
            console.log('   Password: admin');
            console.log('   Email: admin@example.com');
        } else {
            console.log('✅ Utilisateur admin trouvé !');
            console.log(`   ID: ${admin._id}`);
            console.log(`   Username: ${admin.username}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}\n`);

            // Générer un nouveau hash du mot de passe
            const newPassword = 'admin';
            console.log('🔄 Réinitialisation du mot de passe...');
            const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

            // Mettre à jour le mot de passe
            admin.password = hashedPassword;
            admin.isActive = true;
            admin.emailVerified = true;
            await admin.save();

            console.log('✅ Mot de passe réinitialisé avec succès !\n');
            console.log('📋 Nouvelles informations de connexion:');
            console.log('   Username: admin');
            console.log('   Password: admin');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCÈS');
        console.log('='.repeat(60));
        console.log('Vous pouvez maintenant vous connecter avec:');
        console.log('   Username: admin');
        console.log('   Password: admin');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Erreur:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Déconnecté de MongoDB');
    }
}

// Exécution
resetAdminPassword()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur lors de l\'exécution:', error.message);
        process.exit(1);
    });
