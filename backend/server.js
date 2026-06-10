/* ============================================
   ProForm.COM — Serveur Express + MongoDB Atlas
   ============================================ */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

/* ======== MIDDLEWARE ======== */
app.use(cors({
  origin: (origin, cb) => cb(null, true), // allow file:// (null origin) and all others
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads/cvs')));

/* ======== DATABASE CONNECTION ======== */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB non disponible : ${error.message}`);
    console.log(`🔄 Serveur démarré en mode dégradé (sans base de données persistante).`);
    console.log(`   → Vérifiez que votre IP est whitelistée dans MongoDB Atlas Network Access.`);
    /* Ne pas quitter — le serveur reste actif pour les routes JWT */
  }
};

/* ======== ROUTES ======== */
const authRoutes       = require('./routes/auth');
const promoRoutes      = require('./routes/promotion');
const coursesRoutes    = require('./routes/courses');
const usersRoutes      = require('./routes/users');
const videosRoutes     = require('./routes/videos');
const institutsRoutes  = require('./routes/instituts');
const newsRoutes       = require('./routes/news');
const siteConfigRoutes = require('./routes/siteconfig');

app.use('/api/auth',       authRoutes);
app.use('/api/promotion',  promoRoutes);
app.use('/api/courses',    coursesRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/videos',     videosRoutes);
app.use('/api/instituts',  institutsRoutes);
app.use('/api/news',       newsRoutes);
app.use('/api/siteconfig', siteConfigRoutes);

// Serve uploaded videos and thumbnails
app.use('/uploads/videos',     require('express').static(require('path').join(__dirname, 'uploads/videos')));
app.use('/uploads/thumbnails', require('express').static(require('path').join(__dirname, 'uploads/thumbnails')));

/* ======== HEALTH CHECK ======== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    platform: 'ProForm.COM',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté',
    timestamp: new Date().toISOString()
  });
});

/* ======== 404 HANDLER ======== */
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

/* ======== ERROR HANDLER ======== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/* ======== START ======== */
const PORT = process.env.PORT || 5000;

/* Démarrer le serveur même si MongoDB est hors ligne */
app.listen(PORT, async () => {
  console.log(`\n🎭 ProForm.COM Backend démarré`);
  console.log(`🌐 Serveur : http://localhost:${PORT}`);
  console.log(`📡 API     : http://localhost:${PORT}/api`);
  console.log(`❤️  Health  : http://localhost:${PORT}/api/health\n`);
  await connectDB();
});
