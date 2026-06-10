/* ============================================
   ProForm — Routes Actualités
   GET    /api/news        — Lister (public)
   POST   /api/news        — Créer (admin)
   PUT    /api/news/:id    — Modifier (admin)
   DELETE /api/news/:id    — Supprimer (admin)
   ============================================ */

const express = require('express');
const router  = express.Router();
const News    = require('../models/News');
const { protect, adminOnly } = require('../middleware/auth');

/* GET /api/news — public */
router.get('/', async (req, res) => {
  try {
    const filter = { estPublie: true };
    if (req.query.type)       filter.type       = req.query.type;
    if (req.query.discipline) filter.discipline  = req.query.discipline;

    const news = await News.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 50);

    res.json({ news, total: news.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* POST /api/news — admin only */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { titre, contenu, type, discipline, image, contact } = req.body;
    const item = await News.create({ titre, contenu, type, discipline, image, contact });
    res.status(201).json({ message: 'Actualité créée.', news: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* PUT /api/news/:id — admin only */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Actualité introuvable.' });
    res.json({ message: 'Actualité mise à jour.', news: item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* DELETE /api/news/:id — admin only */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Actualité introuvable.' });
    res.json({ message: 'Actualité supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
