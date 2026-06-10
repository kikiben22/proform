/* ============================================
   ProForm — Modèle Utilisateur (MongoDB)
   ============================================ */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [8, 'Le mot de passe doit comporter au moins 8 caractères'],
    select: false  // Never return password in queries
  },
  role: {
    type: String,
    enum: ['etudiant', 'artiste', 'formateur', 'admin'],
    default: 'etudiant'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'La biographie ne peut pas dépasser 500 caractères'],
    default: ''
  },
  discipline: {
    type: String,
    enum: ['Théâtre', 'Cinéma', 'Art Plastique', 'Musique', 'Danse', 'Littérature', 'Photographie', 'Arts numériques', 'Autre', ''],
    default: ''
  },
  coursInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  abonnement: {
    type: {
      type: String,
      enum: ['gratuit', 'basic', 'premium', 'pro'],
      default: 'gratuit'
    },
    dateDebut: Date,
    dateFin: Date,
    actif: { type: Boolean, default: false }
  },
  cvPath: {
    type: String,
    default: ''
  },
  estVerifie: {
    type: Boolean,
    default: false
  },
  tokenVerification: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/* ======== HASH PASSWORD BEFORE SAVE ======== */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ======== COMPARE PASSWORD ======== */
userSchema.methods.comparePassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/* ======== VIRTUAL: Full Name ======== */
userSchema.virtual('nomComplet').get(function() {
  return `${this.prenom} ${this.nom}`;
});

module.exports = mongoose.model('User', userSchema);
