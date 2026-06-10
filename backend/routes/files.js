/* ============================================
   ProForm — Routes Fichiers (GridFS)
   GET /api/files/:id
   ============================================ */

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getBucket } = require('../utils/gridfs');

router.get('/:id', async (req, res) => {
  let id;
  try {
    id = new ObjectId(req.params.id);
  } catch (e) {
    return res.status(404).json({ message: 'Fichier introuvable.' });
  }

  try {
    const bucket = getBucket();
    const files = await bucket.find({ _id: id }).toArray();
    if (!files.length) return res.status(404).json({ message: 'Fichier introuvable.' });

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);
    res.set('Cache-Control', 'public, max-age=31536000');

    bucket.openDownloadStream(id)
      .on('error', () => res.status(404).end())
      .pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
