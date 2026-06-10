/* ============================================
   ProForm — Routes Utilisateurs
   GET   /api/users/profile   — Mon profil
   PUT   /api/users/profile   — Modifier profil
   POST  /api/users/enroll/:courseId — S'inscrire à un cours
   GET   /api/users           — Lister (admin)
   ============================================ */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

/* ====================================================
   GET /api/users/profile — Mon profil complet
   ==================================================== */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('coursInscrits', 'titre categorie image note dureeHeures');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   PUT /api/users/profile — Modifier mon profil
   ==================================================== */
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['nom', 'prenom', 'telephone', 'bio', 'discipline', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profil mis à jour.', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ====================================================
   POST /api/users/enroll/:courseId — S'inscrire à un cours
   ==================================================== */
router.post('/enroll/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé.' });
    }

    const user = await User.findById(req.user._id);
    if (user.coursInscrits.includes(req.params.courseId)) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce cours.' });
    }

    user.coursInscrits.push(req.params.courseId);
    await user.save();

    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { inscrits: 1 } });

    res.json({ message: `Inscription réussie au cours "${course.titre}" !` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   GET /api/users — Lister tous les utilisateurs (admin)
   ==================================================== */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   PUT /api/users/:id/role — Changer le rôle (admin)
   ==================================================== */
router.put('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Rôle mis à jour.', user });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* ====================================================
   PUT /api/users/:id/approve — Approuver/rejeter un utilisateur (admin)
   ==================================================== */
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { estVerifie } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { estVerifie: !!estVerifie },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: estVerifie ? 'Utilisateur approuvé.' : 'Approbation retirée.', user });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* ====================================================
   DELETE /api/users/:id — Supprimer un utilisateur (admin)
   ==================================================== */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

module.exports = router;
