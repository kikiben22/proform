/* ============================================
   ProForm — Modèle Cours
   ============================================ */

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  categorie: {
    type: String,
    required: true,
    enum: ['scene', 'cinema', 'art-plastique', 'musique']
  },
  sousCategorie: {
    type: String,
    enum: [
      'performance', 'ecriture', 'scenographie', 'mise-en-scene', 'improvisation',
      'realisation', 'scenario', 'montage', 'photo', 'documentaire',
      'peinture', 'sculpture', 'numerique', 'dessin',
      'guitare', 'piano', 'chant', 'production', 'composition',
      'autre'
    ],
    default: 'autre'
  },
  formateur: {
    nom: String,
    titre: String,
    avatar: String
  },
  dureeHeures: {
    type: Number,
    required: true
  },
  niveaux: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance', 'tous'],
    default: 'tous'
  },
  image: {
    type: String,
    default: ''
  },
  videoIntro: {
    type: String,
    default: ''
  },
  modules: [{
    numero: Number,
    titre: String,
    dureeMin: Number,
    videoUrl: String
  }],
  prix: {
    type: Number,
    default: 0
  },
  estGratuit: {
    type: Boolean,
    default: false
  },
  abonnementRequis: {
    type: String,
    enum: ['gratuit', 'basic', 'premium', 'pro'],
    default: 'basic'
  },
  note: {
    moyenne: { type: Number, default: 0 },
    nombreAvis: { type: Number, default: 0 }
  },
  inscrits: {
    type: Number,
    default: 0
  },
  institut: {
    nom: String,
    ville: String,
    logo: String
  },
  tags: [String],
  estPublie: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Text search index
courseSchema.index({ titre: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
