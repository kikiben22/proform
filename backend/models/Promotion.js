/* ============================================
   ProForm — Modèle Candidature Promotion
   ============================================ */

const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  discipline: {
    type: String,
    required: [true, 'La discipline est obligatoire'],
    enum: [
      'Théâtre / Scène',
      'Cinéma / Audiovisuel',
      'Art Plastique / Peinture',
      'Musique / Composition',
      'Danse',
      'Littérature / Écriture',
      'Photographie',
      'Arts numériques',
      'Autre'
    ]
  },
  bio: {
    type: String,
    required: [true, 'La biographie est obligatoire'],
    maxlength: [1000, 'La biographie est trop longue']
  },
  cv: {
    filename: String,
    originalName: String,
    path: String,
    size: Number
  },
  travaux: [{
    filename: String,
    originalName: String,
    path: String,
    type: String
  }],
  portfolio: {
    type: String,
    default: ''
  },
  reseauxSociaux: {
    type: String,
    default: ''
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours_examen', 'approuvee', 'refusee'],
    default: 'en_attente'
  },
  notesAdmin: {
    type: String,
    default: ''
  },
  dateTraitement: Date,

  // Lien avec un compte utilisateur si inscrit
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Promotion', promotionSchema);
