const express = require('express');
const router  = express.Router();
const Institut = require('../models/Institut');

/* GET /api/instituts?discipline=scene */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.discipline) filter.discipline = req.query.discipline;
    const instituts = await Institut.find(filter).sort({ createdAt: -1 });
    res.json({ instituts, total: instituts.length });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

/* POST /api/instituts */
router.post('/', async (req, res) => {
  try {
    const inst = await Institut.create(req.body);
    res.status(201).json({ message: 'Institut créé.', institut: inst });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/instituts/:id */
router.put('/:id', async (req, res) => {
  try {
    const inst = await Institut.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inst) return res.status(404).json({ message: 'Institut introuvable.' });
    res.json({ message: 'Institut mis à jour.', institut: inst });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* DELETE /api/instituts/:id */
router.delete('/:id', async (req, res) => {
  try {
    const inst = await Institut.findByIdAndDelete(req.params.id);
    if (!inst) return res.status(404).json({ message: 'Institut introuvable.' });
    res.json({ message: 'Institut supprimé.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

module.exports = router;
