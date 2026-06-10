const mongoose = require('mongoose');

const institutSchema = new mongoose.Schema({
  nom:         { type: String, required: true, trim: true },
  discipline:  { type: String, enum: ['scene','cinema','art-plastique','musique','toutes'], default: 'toutes' },
  type:        { type: String, enum: ['Officiel','Certifié','Partenaire','International','Festival','Galerie'], default: 'Partenaire' },
  localisation:{ type: String, default: '' },
  telephone:   { type: String, default: '' },
  email:       { type: String, default: '' },
  specialites: { type: String, default: '' },
  icone:       { type: String, default: '🏛️' },
  couleur:     { type: String, default: 'gold' },
  estActif:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Institut', institutSchema);
