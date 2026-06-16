/**
 * Script pour lister les utilisateurs
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/documents_perdus';

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const User = require('./src/models/User');

    const users = await User.find().select('username email role createdAt');

    console.log(`📊 ${users.length} utilisateur(s) dans la base\n`);
    console.log('═'.repeat(80));

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username.padEnd(20)} | ${user.email.padEnd(30)} | ${user.role.padEnd(10)} | ${user.createdAt.toLocaleDateString('fr-FR')}`);
      });
    }

    console.log('═'.repeat(80));

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

listUsers();
