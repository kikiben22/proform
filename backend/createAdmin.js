/* ============================================
   ProForm — Créer le compte Admin
   Lancer UNE SEULE FOIS : node createAdmin.js
   ============================================ */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN = {
  nom:       'Admin',
  prenom:    'ProForm',
  email:     'admin@proform.com',
  telephone: '0550000000',
  password:  'Admin@2026',
  role:      'admin'
};

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Rôle mis à jour → admin pour :', ADMIN.email);
      } else {
        console.log('ℹ️  Admin existe déjà :', ADMIN.email);
      }
    } else {
      await User.create(ADMIN);
      console.log('✅ Compte admin créé avec succès !');
    }

    console.log('\n📋 Identifiants admin :');
    console.log('   Email    :', ADMIN.email);
    console.log('   Password :', ADMIN.password);
    console.log('\n🌐 Connectez-vous sur : http://127.0.0.1:5500/admin.html\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

createAdmin();
