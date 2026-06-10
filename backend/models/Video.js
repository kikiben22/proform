const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  discipline: {
    type: String,
    required: true,
    enum: ['scene', 'cinema', 'art-plastique', 'musique']
  },
  categorie: {
    type: String,
    required: true
    // scene: performance, ecriture, scenographie, mise-en-scene, improvisation
    // cinema: realisation, scenario, montage, photo, documentaire
    // art-plastique: peinture, sculpture, numerique, dessin
    // musique: guitare, piano, chant, production
  },
  formateur: { type: String, default: '' },
  videoPath: { type: String, required: true },
  thumbnailPath: { type: String, default: '' },
  duree: { type: String, default: '' },
  vues: { type: Number, default: 0 },
  estPublie: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
