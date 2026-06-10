/* Test connexion MongoDB Atlas */
require('dotenv').config();
const mongoose = require('mongoose');

const URI = process.env.MONGO_URI;
console.log('\n🔍 URI utilisée :');
console.log('   ' + URI.replace(/:([^@]+)@/, ':***@'));  // masque le mot de passe
console.log('\n⏳ Test de connexion...\n');

mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log('✅ CONNECTÉ ! Connexion MongoDB Atlas réussie.\n');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections existantes :');
    if (collections.length === 0) {
      console.log('   (aucune collection — base vide)');
    } else {
      collections.forEach(c => console.log('   •', c.name));
    }
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ÉCHEC :', err.message, '\n');
    if (err.message.includes('bad auth') || err.message.includes('authentication failed')) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔑 PROBLÈME : Le mot de passe dans .env est incorrect.');
      console.log('\n   Allez sur cloud.mongodb.com :');
      console.log('   1. Menu gauche → "Database Access"');
      console.log('   2. Cliquez "Edit" sur proformdz_db_user');
      console.log('   3. Cliquez "Edit Password"');
      console.log('   4. Tapez un nouveau mot de passe, ex: ProForm2026!');
      console.log('   5. Cliquez "Update User"');
      console.log('   6. Attendez 30 secondes');
      console.log('   7. Mettez ce mot de passe dans backend/.env (MONGO_URI)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('getaddrinfo')) {
      console.log('🌐 PROBLÈME : Pas de connexion réseau ou URI incorrecte.');
    } else if (err.message.includes('timed out')) {
      console.log('🌐 PROBLÈME : Timeout — vérifiez que votre IP est whitelistée dans Atlas → Network Access.');
    }
    process.exit(1);
  });
