/* ============================================
   ProForm — Routes d'authentification
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/me
   ============================================ */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadBuffer } = require('../utils/gridfs');

/* ---- Multer pour CV PDF — stockage en mémoire puis GridFS (persiste sur Render) ---- */
const uploadCV = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf'),
  limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB max
});

/* ---- Génère un JWT (sans expiration) ---- */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

/* ====================================================
   POST /api/auth/register — Créer un compte
   ==================================================== */
router.post(
  '/register',
  uploadCV.single('cv'),
  [
    body('nom').trim().notEmpty().withMessage('Nom obligatoire'),
    body('prenom').trim().notEmpty().withMessage('Prénom obligatoire'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone obligatoire'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit comporter au moins 8 caractères')
  ],
  async (req, res) => {
    /* Validation errors */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { nom, prenom, email, telephone, password, role, discipline } = req.body;

    try {
      /* Check existing email */
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({
          message: 'Un compte avec cet email existe déjà.'
        });
      }

      /* Create user */
      const userData = { nom, prenom, email, telephone, password };
      if (role && ['etudiant','artiste','formateur'].includes(role)) userData.role = role;
      if (discipline) userData.discipline = discipline;
      if (req.file) {
        const safe = (nom || 'cv').replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'');
        const cvId = await uploadBuffer(req.file.buffer, Date.now() + '_' + safe + '.pdf', 'application/pdf');
        userData.cvPath = '/api/files/' + cvId;
      }
      const user = await User.create(userData);

      const token = generateToken(user._id);

      res.status(201).json({
        message: 'Compte créé ! En attente de validation par l\'administrateur.',
        token,
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          discipline: user.discipline,
          cvPath: user.cvPath,
          estVerifie: user.estVerifie,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
    }
  }
);

/* ====================================================
   POST /api/auth/login — Se connecter
   ==================================================== */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe obligatoire')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Connexion réussie. Bienvenue ' + user.prenom + ' !',
        token,
        user: {
          id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          abonnement: user.abonnement,
          estVerifie: user.estVerifie
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

/* ====================================================
   GET /api/auth/me — Profil de l'utilisateur connecté
   ==================================================== */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('coursInscrits', 'titre categorie image');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
