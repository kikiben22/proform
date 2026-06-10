const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  /* Coordonnées */
  telephone: { type: String, default: '+213 550 00 00 00' },
  email:     { type: String, default: 'contact@proform.com' },
  adresse:   { type: String, default: 'Alger, Algérie' },
  facebook:  { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube:   { type: String, default: '' },
  linkedin:  { type: String, default: '' },
  /* Textes de la plateforme (hero) */
  heroTitre:    { type: String, default: 'Votre carrière artistique commence ici.' },
  heroSousTitre:{ type: String, default: 'Rejoignez des milliers d\'artistes, d\'étudiants et de professionnels sur la plateforme leader des arts en Algérie et dans le monde arabe.' },
  stat1Chiffre: { type: String, default: '500+' },
  stat1Label:   { type: String, default: 'Cours en arts vivants' },
  stat2Chiffre: { type: String, default: '50 000+' },
  stat2Label:   { type: String, default: 'Artistes membres' },
  stat3Chiffre: { type: String, default: '12' },
  stat3Label:   { type: String, default: 'Instituts partenaires' },
  stat4Chiffre: { type: String, default: '100%' },
  stat4Label:   { type: String, default: 'Certifications reconnues' },
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
