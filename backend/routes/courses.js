/* ============================================
   ProForm — Routes Cours
   GET  /api/courses              — Lister
   GET  /api/courses/:id          — Détail
   POST /api/courses              — Créer (admin)
   GET  /api/courses/search?q=    — Recherche full-text
   GET  /api/courses/cat/:cat     — Par catégorie
   ============================================ */

const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

/* ====================================================
   GET /api/courses — Lister tous les cours
   ==================================================== */
router.get('/', async (req, res) => {
  try {
    const { categorie, sousCategorie, niveau, page = 1, limit = 12 } = req.query;
    const filter = { estPublie: true };

    if (categorie) filter.categorie = categorie;
    if (sousCategorie) filter.sousCategorie = sousCategorie;
    if (niveau) filter.niveaux = niveau;

    const courses = await Course.find(filter)
      .sort({ 'note.moyenne': -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-modules');

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   GET /api/courses/search?q=term — Recherche full-text
   ==================================================== */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Terme de recherche requis.' });
    }

    const courses = await Course.find(
      { $text: { $search: q }, estPublie: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json({ courses, query: q, count: courses.length });
  } catch (err) {
    // Fallback: regex search if text index not built
    try {
      const courses = await Course.find({
        estPublie: true,
        $or: [
          { titre: { $regex: req.query.q, $options: 'i' } },
          { description: { $regex: req.query.q, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.q, 'i')] } }
        ]
      }).limit(20);
      res.json({ courses, query: req.query.q, count: courses.length });
    } catch (e) {
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
});

/* ====================================================
   GET /api/courses/cat/:categorie — Cours par catégorie
   ==================================================== */
router.get('/cat/:categorie', async (req, res) => {
  try {
    const courses = await Course.find({
      categorie: req.params.categorie,
      estPublie: true
    })
      .sort({ 'note.moyenne': -1 })
      .limit(20);

    res.json({ courses, categorie: req.params.categorie });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   GET /api/courses/:id — Détail d'un cours
   ==================================================== */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.estPublie) {
      return res.status(404).json({ message: 'Cours non trouvé.' });
    }
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/* ====================================================
   POST /api/courses — Créer un cours (admin uniquement)
   ==================================================== */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ message: 'Cours créé.', course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ====================================================
   PUT /api/courses/:id — Modifier un cours (admin)
   ==================================================== */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Cours introuvable.' });
    res.json({ message: 'Cours mis à jour.', course });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* ====================================================
   DELETE /api/courses/:id — Supprimer un cours (admin)
   ==================================================== */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours introuvable.' });
    res.json({ message: 'Cours supprimé.' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

/* ====================================================
   POST /api/courses/seed — Initialiser des cours de démo
   ==================================================== */
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    await Course.deleteMany({});

    const demoCourses = [
      {
        titre: 'Cours de Performance Scénique',
        description: 'Maîtrisez l\'art de la présence sur scène à travers des exercices pratiques intensifs.',
        categorie: 'scene',
        sousCategorie: 'performance',
        dureeHeures: 40,
        niveaux: 'tous',
        note: { moyenne: 4.9, nombreAvis: 234 },
        inscrits: 1240,
        tags: ['performance', 'scène', 'théâtre', 'corps'],
        formateur: { nom: 'Dr. Ahmed Kaddour', titre: 'Directeur artistique' },
        modules: [
          { numero: 1, titre: 'Introduction à la présence scénique', dureeMin: 90 },
          { numero: 2, titre: 'Maîtrise du corps et du souffle', dureeMin: 120 },
          { numero: 3, titre: 'Expression émotionnelle authentique', dureeMin: 100 },
          { numero: 4, titre: 'Improvisation et spontanéité', dureeMin: 90 },
          { numero: 5, titre: 'Monologue et dialogue', dureeMin: 110 },
          { numero: 6, titre: 'Performance finale devant public', dureeMin: 180 }
        ]
      },
      {
        titre: 'Cours d\'Écriture Dramatique',
        description: 'Apprenez à construire des histoires puissantes, des personnages mémorables et des dialogues percutants.',
        categorie: 'scene',
        sousCategorie: 'ecriture',
        dureeHeures: 35,
        niveaux: 'intermediaire',
        note: { moyenne: 4.8, nombreAvis: 178 },
        inscrits: 890,
        tags: ['écriture', 'dramaturgie', 'scénario', 'texte'],
        formateur: { nom: 'Pr. Faouzia Bensalem', titre: 'Dramaturge' }
      },
      {
        titre: 'Cours de Scénographie',
        description: 'Concevez des espaces scéniques uniques — lumières, décors, sons — pour des spectacles inoubliables.',
        categorie: 'scene',
        sousCategorie: 'scenographie',
        dureeHeures: 45,
        niveaux: 'avance',
        note: { moyenne: 4.9, nombreAvis: 156 },
        inscrits: 620,
        tags: ['scénographie', 'décors', 'lumières', 'espace'],
        formateur: { nom: 'Mohamed Rahmani', titre: 'Scénographe professionnel' }
      },
      {
        titre: 'Réalisation Cinématographique',
        description: 'De l\'écriture du scénario à la post-production, maîtrisez l\'art du cinéma.',
        categorie: 'cinema',
        sousCategorie: 'realisation',
        dureeHeures: 60,
        niveaux: 'tous',
        note: { moyenne: 4.8, nombreAvis: 189 },
        inscrits: 1560,
        tags: ['cinéma', 'réalisation', 'film', 'audiovisuel']
      },
      {
        titre: 'Peinture Contemporaine',
        description: 'Développez votre style personnel à travers différentes techniques picturales modernes.',
        categorie: 'art-plastique',
        sousCategorie: 'peinture',
        dureeHeures: 35,
        niveaux: 'debutant',
        note: { moyenne: 4.7, nombreAvis: 312 },
        inscrits: 2100,
        tags: ['peinture', 'art', 'couleur', 'contemporain']
      },
      {
        titre: 'Composition Musicale',
        description: 'Apprenez à composer de la musique originale pour différents genres et supports.',
        categorie: 'musique',
        sousCategorie: 'composition',
        dureeHeures: 50,
        niveaux: 'intermediaire',
        note: { moyenne: 4.8, nombreAvis: 145 },
        inscrits: 780,
        tags: ['musique', 'composition', 'harmonie', 'création']
      }
    ];

    const courses = await Course.insertMany(demoCourses);
    res.json({ message: `${courses.length} cours de démo créés.`, courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
