/* ============================================
   ProForm — Routes Vidéos
   POST /api/videos/upload
   GET  /api/videos
   GET  /api/videos/:id
   DELETE /api/videos/:id
   ============================================ */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const { uploadBuffer, deleteFileByPath } = require('../utils/gridfs');

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  } else {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
};

/* ---- Stockage en mémoire — les fichiers sont ensuite écrits dans MongoDB GridFS
   (persiste après redéploiement, contrairement au disque Render gratuit) ---- */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB max (quota MongoDB Atlas gratuit = 512 Mo)
});

/* ====================================================
   POST /api/videos/upload — Uploader une vidéo
   ==================================================== */
router.post('/upload', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Fichier vidéo obligatoire.' });
    }

    const { titre, description, discipline, categorie, formateur, duree } = req.body;

    if (!titre || !discipline || !categorie) {
      return res.status(400).json({ message: 'Titre, discipline et catégorie sont obligatoires.' });
    }

    const videoFile = req.files.video[0];
    const videoId = await uploadBuffer(videoFile.buffer, videoFile.originalname, videoFile.mimetype);

    let thumbnailPath = '';
    if (req.files.thumbnail) {
      const thumbFile = req.files.thumbnail[0];
      const thumbId = await uploadBuffer(thumbFile.buffer, thumbFile.originalname, thumbFile.mimetype);
      thumbnailPath = '/api/files/' + thumbId;
    }

    const video = await Video.create({
      titre,
      description: description || '',
      discipline,
      categorie,
      formateur: formateur || '',
      duree: duree || '',
      videoPath: '/api/files/' + videoId,
      thumbnailPath
    });

    res.status(201).json({
      message: 'Vidéo uploadée avec succès !',
      video
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'upload.' });
  }
});

/* ====================================================
   GET /api/videos — Lister les vidéos
   Filtres: ?discipline=scene&categorie=performance
   ==================================================== */
router.get('/', async (req, res) => {
  try {
    const filter = { estPublie: true };
    if (req.query.discipline) filter.discipline = req.query.discipline;
    if (req.query.categorie) filter.categorie = req.query.categorie;

    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json({ videos, total: videos.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   GET /api/videos/:id — Une vidéo (+ incrémente vues)
   ==================================================== */
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { vues: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: 'Vidéo introuvable.' });
    res.json({ video });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   DELETE /api/videos/:id — Supprimer une vidéo
   ==================================================== */
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo introuvable.' });

    // Supprimer les fichiers GridFS
    await deleteFileByPath(video.videoPath);
    await deleteFileByPath(video.thumbnailPath);

    await video.deleteOne();
    res.json({ message: 'Vidéo supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
