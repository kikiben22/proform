/* ============================================
   ProForm — Routes Promotion
   POST /api/promotion       — Soumettre candidature
   GET  /api/promotion       — Lister (admin)
   GET  /api/promotion/:id   — Détail (admin)
   PATCH /api/promotion/:id  — Mettre à jour statut (admin)
   ============================================ */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Promotion = require('../models/Promotion');
const { protect, adminOnly } = require('../middleware/auth');

/* ---- Multer config for file uploads ---- */
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'promotion');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

/* ====================================================
   POST /api/promotion — Soumettre une candidature
   ==================================================== */
router.post(
  '/',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'travaux', maxCount: 5 }
  ]),
  [
    body('nom').trim().notEmpty().withMessage('Nom obligatoire'),
    body('prenom').trim().notEmpty().withMessage('Prénom obligatoire'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone obligatoire'),
    body('discipline').notEmpty().withMessage('Discipline obligatoire'),
    body('bio').notEmpty().withMessage('Biographie obligatoire')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { nom, prenom, email, telephone, discipline, bio, portfolio, reseauxSociaux } = req.body;

    try {
      const promoData = {
        nom, prenom, email, telephone, discipline, bio,
        portfolio: portfolio || '',
        reseauxSociaux: reseauxSociaux || ''
      };

      // Attach uploaded CV
      if (req.files?.cv?.[0]) {
        const f = req.files.cv[0];
        promoData.cv = {
          filename: f.filename,
          originalName: f.originalname,
          path: f.path,
          size: f.size
        };
      }

      // Attach uploaded work samples
      if (req.files?.travaux) {
        promoData.travaux = req.files.travaux.map(f => ({
          filename: f.filename,
          originalName: f.originalname,
          path: f.path,
          type: f.mimetype
        }));
      }

      const candidature = await Promotion.create(promoData);

      res.status(201).json({
        message: 'Candidature soumise avec succès ! Notre équipe vous contactera sous 5 à 7 jours ouvrables.',
        id: candidature._id,
        statut: candidature.statut
      });
    } catch (err) {
      console.error('Promotion error:', err);
      res.status(500).json({ message: 'Erreur lors de la soumission. Veuillez réessayer.' });
    }
  }
);

/* ====================================================
   GET /api/promotion — Lister toutes les candidatures (admin)
   ==================================================== */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;

    const candidatures = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Promotion.countDocuments(filter);

    res.json({
      candidatures,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   PATCH /api/promotion/:id — Mettre à jour le statut (admin)
   ==================================================== */
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { statut, notesAdmin } = req.body;
    const candidature = await Promotion.findByIdAndUpdate(
      req.params.id,
      {
        statut,
        notesAdmin,
        dateTraitement: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée.' });
    }

    res.json({ message: 'Statut mis à jour.', candidature });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
