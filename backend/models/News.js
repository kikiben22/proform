/* ============================================
   ProForm — Modèle Actualité (MongoDB)
   ============================================ */

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [200, 'Titre trop long']
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Annonce', 'Événement', 'Article', 'Offre'],
    default: 'Article'
  },
  discipline: {
    type: String,
    enum: ['scene', 'cinema', 'art-plastique', 'musique', ''],
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  estPublie: {
    type: Boolean,
    default: true
  },
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
