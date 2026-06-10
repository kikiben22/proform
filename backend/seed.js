/* ============================================================
   ProForm — Script de peuplement initial de MongoDB Atlas
   Usage : node seed.js
   ============================================================ */

require('dotenv').config();
const mongoose = require('mongoose');

const User       = require('./models/User');
const Course     = require('./models/Course');
const Institut   = require('./models/Institut');
const News       = require('./models/News');
const SiteConfig = require('./models/SiteConfig');

const URI = process.env.MONGO_URI;

/* ── Données ────────────────────────────────────────────── */

const COURSES = [
  /* ── Scène & Théâtre ── */
  { titre:'Art du Théâtre — Débutant', categorie:'scene', sousCategorie:'performance',
    description:'Découvrez les fondamentaux du jeu d\'acteur, la présence scénique et l\'improvisation.', dureeHeures:24, niveaux:'debutant',
    formateur:{nom:'Karim Benaissa', titre:'Metteur en scène'}, note:{moyenne:4.7,nombreAvis:234}, estPublie:true,
    tags:['théâtre','débutant','scène'] },
  { titre:'Mise en Scène — Avancé', categorie:'scene', sousCategorie:'mise-en-scene',
    description:'Maîtrisez la direction d\'acteurs, la scénographie et la gestion du plateau.', dureeHeures:40, niveaux:'avance',
    formateur:{nom:'Samia Meziane', titre:'Directrice artistique'}, note:{moyenne:4.9,nombreAvis:87}, estPublie:true,
    tags:['mise en scène','avancé'] },
  { titre:'Improvisation & Performance', categorie:'scene', sousCategorie:'improvisation',
    description:'Libérez votre créativité à travers l\'improvisation scénique et les techniques de jeu instantané.', dureeHeures:18, niveaux:'tous',
    formateur:{nom:'Amine Zerrouki', titre:'Comédien'}, note:{moyenne:4.6,nombreAvis:112}, estPublie:true,
    tags:['impro','performance'] },
  { titre:'Écriture Dramaturgique', categorie:'scene', sousCategorie:'ecriture',
    description:'Apprenez à écrire pour la scène : structure dramatique, dialogue, tension narrative.', dureeHeures:30, niveaux:'intermediaire',
    formateur:{nom:'Yasmine Kaci', titre:'Dramaturge'}, note:{moyenne:4.8,nombreAvis:65}, estPublie:true,
    tags:['écriture','dramaturgie'] },
  /* ── Cinéma ── */
  { titre:'Réalisation Cinéma — Les Bases', categorie:'cinema', sousCategorie:'realisation',
    description:'Tout pour réaliser votre premier court-métrage : cadrage, lumière, montage.', dureeHeures:36, niveaux:'debutant',
    formateur:{nom:'Yacine Boudiaf', titre:'Réalisateur'}, note:{moyenne:4.8,nombreAvis:198}, estPublie:true,
    tags:['cinéma','réalisation'] },
  { titre:'Écriture de Scénario', categorie:'cinema', sousCategorie:'scenario',
    description:'Méthode Hollywood : structure en 3 actes, personnages mémorables, dialogues percutants.', dureeHeures:28, niveaux:'intermediaire',
    formateur:{nom:'Rania Khalil', titre:'Scénariste'}, note:{moyenne:4.7,nombreAvis:156}, estPublie:true,
    tags:['scénario','cinéma'] },
  { titre:'Montage Vidéo — Premiere Pro', categorie:'cinema', sousCategorie:'montage',
    description:'Maîtrisez Adobe Premiere Pro de A à Z pour un montage professionnel.', dureeHeures:32, niveaux:'tous',
    formateur:{nom:'Sami Laib', titre:'Monteur'}, note:{moyenne:4.9,nombreAvis:203}, estPublie:true,
    tags:['montage','Premiere'] },
  { titre:'Documentaire — Technique et Narration', categorie:'cinema', sousCategorie:'documentaire',
    description:'Créez des documentaires percutants sur la culture algérienne : terrain, récit, image.', dureeHeures:40, niveaux:'intermediaire',
    formateur:{nom:'Leila Mansouri', titre:'Réalisatrice documentaire'}, note:{moyenne:4.8,nombreAvis:88}, estPublie:true,
    tags:['documentaire','narration'] },
  /* ── Art Plastique ── */
  { titre:'Peinture Acrylique — Débutant', categorie:'art-plastique', sousCategorie:'peinture',
    description:'Initiez-vous à la peinture acrylique : couleurs, textures, style personnel.', dureeHeures:20, niveaux:'debutant',
    formateur:{nom:'Amina Hadj-Ali', titre:'Peintre'}, note:{moyenne:4.8,nombreAvis:321}, estPublie:true,
    tags:['peinture','acrylique'] },
  { titre:'Art Numérique — Procreate', categorie:'art-plastique', sousCategorie:'numerique',
    description:'Illustrations professionnelles sur iPad : brosses, calques, exportation.', dureeHeures:25, niveaux:'tous',
    formateur:{nom:'Sonia Brahim', titre:'Illustratrice digitale'}, note:{moyenne:4.9,nombreAvis:267}, estPublie:true,
    tags:['numérique','Procreate'] },
  { titre:'Sculpture Contemporaine', categorie:'art-plastique', sousCategorie:'sculpture',
    description:'Explorez la sculpture moderne avec argile, plâtre et matériaux recyclés.', dureeHeures:35, niveaux:'intermediaire',
    formateur:{nom:'Rachid Aïssaoui', titre:'Sculpteur'}, note:{moyenne:4.7,nombreAvis:89}, estPublie:true,
    tags:['sculpture','art contemporain'] },
  { titre:'Dessin Académique — Maîtrise du geste', categorie:'art-plastique', sousCategorie:'dessin',
    description:'Du croquis au dessin technique : proportions, ombre/lumière, composition.', dureeHeures:22, niveaux:'debutant',
    formateur:{nom:'Farid Benali', titre:'Dessinateur'}, note:{moyenne:4.8,nombreAvis:178}, estPublie:true,
    tags:['dessin','académique'] },
  /* ── Musique ── */
  { titre:'Guitare Acoustique — Débutant', categorie:'musique', sousCategorie:'guitare',
    description:'Apprenez la guitare de zéro : accords de base, rythmes, premières chansons.', dureeHeures:30, niveaux:'debutant',
    formateur:{nom:'Djamel Ferhat', titre:'Guitariste'}, note:{moyenne:4.8,nombreAvis:445}, estPublie:true,
    tags:['guitare','débutant'] },
  { titre:'Production Musicale — FL Studio', categorie:'musique', sousCategorie:'production',
    description:'Produisez vos beats et morceaux de A à Z : drums, synthés, mixage, mastering.', dureeHeures:40, niveaux:'tous',
    formateur:{nom:'Sofiane Belkadi', titre:'Beatmaker'}, note:{moyenne:4.8,nombreAvis:203}, estPublie:true,
    tags:['FL Studio','production'] },
  { titre:'Chant & Technique Vocale', categorie:'musique', sousCategorie:'chant',
    description:'Développez votre voix : respiration, justesse, interprétation, répertoire algérien.', dureeHeures:28, niveaux:'tous',
    formateur:{nom:'Nadia Cherifi', titre:'Soprano'}, note:{moyenne:4.9,nombreAvis:167}, estPublie:true,
    tags:['chant','voix'] },
  { titre:'Piano — Classique & Jazz', categorie:'musique', sousCategorie:'piano',
    description:'Piano de zéro au niveau intermédiaire : lecture de notes, solfège, morceaux classiques.', dureeHeures:36, niveaux:'debutant',
    formateur:{nom:'Khaled Benmerabet', titre:'Pianiste'}, note:{moyenne:4.8,nombreAvis:134}, estPublie:true,
    tags:['piano','classique','jazz'] },
];

const INSTITUTS = [
  { nom:'Institut National des Arts Dramatiques', discipline:'scene', type:'Officiel', icone:'🎭', couleur:'gold',
    localisation:'Alger — Rue Didouche Mourad', telephone:'021 63 47 89', email:'contact@inad.dz', specialites:'Théâtre, Scénographie, Mise en scène' },
  { nom:'Conservatoire National d\'Art Dramatique', discipline:'scene', type:'Certifié', icone:'🎭', couleur:'purple',
    localisation:'Oran — Boulevard de la Soummam', telephone:'041 33 12 56', email:'conservatoire@cnad.dz', specialites:'Jeu d\'acteur, Improvisation' },
  { nom:'École Nationale de Théâtre', discipline:'scene', type:'Officiel', icone:'🎭', couleur:'teal',
    localisation:'Annaba — Rue Hocine Aït Ahmed', telephone:'038 86 54 21', email:'info@ent-annaba.dz', specialites:'Arts dramatiques, Dramaturgie' },
  { nom:'Institut National du Cinéma (INCA)', discipline:'cinema', type:'Officiel', icone:'🎬', couleur:'teal',
    localisation:'Alger — Hydra, Villa Hamou Boutlélis', telephone:'021 69 31 47', email:'inca@culture.dz', specialites:'Réalisation, Scénario, Production' },
  { nom:'Académie du Cinéma Méditerranéen', discipline:'cinema', type:'Certifié', icone:'🎬', couleur:'blue',
    localisation:'Constantine — Rue Larbi Ben M\'hidi', telephone:'031 92 44 78', email:'acm@cinema-med.dz', specialites:'Coproductions, Documentaire' },
  { nom:'Centre de Formation Audiovisuel', discipline:'cinema', type:'Partenaire', icone:'🎬', couleur:'gold',
    localisation:'Oran — Zone industrielle Es-Sénia', telephone:'041 55 23 90', email:'cfa@audiovisuel.dz', specialites:'Montage, Post-production' },
  { nom:'École des Beaux-Arts d\'Alger', discipline:'art-plastique', type:'Officiel', icone:'🎨', couleur:'red',
    localisation:'Alger — Palais de la Culture', telephone:'021 67 14 33', email:'beaux-arts@algercity.dz', specialites:'Peinture, Sculpture, Design' },
  { nom:'Institut National des Arts Plastiques', discipline:'art-plastique', type:'Officiel', icone:'🎨', couleur:'orange',
    localisation:'Tlemcen — Vieux Tlemcen', telephone:'043 26 71 15', email:'inap@tlemcen.dz', specialites:'Arts traditionnels, Calligraphie' },
  { nom:'Digital Arts Academy', discipline:'art-plastique', type:'Partenaire', icone:'🎨', couleur:'purple',
    localisation:'Oran — Technopole d\'Oran', telephone:'0550 88 12 34', email:'hello@digitalarts.dz', specialites:'Art numérique, Illustration' },
  { nom:'Conservatoire Central d\'Oran', discipline:'musique', type:'Officiel', icone:'🎵', couleur:'gold',
    localisation:'Oran — Rue des Frères Bellil', telephone:'041 41 22 67', email:'conservatoire@oran-musique.dz', specialites:'Guitare, Piano, Chant, Orchestre' },
  { nom:'Académie de Musique d\'Alger', discipline:'musique', type:'Certifié', icone:'🎵', couleur:'purple',
    localisation:'Alger — El Biar', telephone:'0550 77 34 56', email:'contact@musique-alger.dz', specialites:'Composition, Production, Jazz' },
  { nom:'École de Musique Traditionnelle', discipline:'musique', type:'Officiel', icone:'🎵', couleur:'teal',
    localisation:'Constantine — Médina, Rue Sidi Mabrouk', telephone:'031 98 56 12', email:'musique-trad@constantine.dz', specialites:'Chaâbi, Musique andalouse' },
];

const NEWS = [
  { titre:'Ouverture des inscriptions — Saison 2026', type:'Annonce', discipline:'',
    contenu:'Les inscriptions pour la saison artistique 2026 sont officiellement ouvertes sur ProForm. Accédez à plus de 500 cours en ligne dispensés par les meilleurs experts du domaine artistique algérien.',
    contact:'0550 123 456 — inscriptions@proform.com', estPublie:true },
  { titre:'Festival National du Théâtre — Alger 2026', type:'Événement', discipline:'scene',
    contenu:'Le Festival National du Théâtre professionnel se tiendra du 15 au 22 avril 2026 au Théâtre National Algérien (TNA). Entrée gratuite pour les membres ProForm.',
    contact:'0770 456 789 — theatre@proform.com', estPublie:true },
  { titre:'Nouveau programme : Réalisation cinématographique avancée', type:'Offre', discipline:'cinema',
    contenu:'ProForm lance un nouveau programme de formation en réalisation cinématographique avancée, dispensé par des professionnels internationaux. 60 heures de cours intensifs.',
    contact:'cinema@proform.com', estPublie:true },
  { titre:'Exposition nationale Art Plastique — Constantine', type:'Événement', discipline:'art-plastique',
    contenu:'La 5ème exposition nationale d\'art plastique contemporain se tiendra du 1er au 15 mai 2026 au Centre Culturel de Constantine. Les artistes membres d\'ProForm bénéficient d\'un espace prioritaire.',
    contact:'0560 789 012 — arts@proform.com', estPublie:true },
  { titre:'Masterclass Production Musicale — Places limitées', type:'Annonce', discipline:'musique',
    contenu:'ProForm organise une masterclass exceptionnelle de 3 jours intensifs (production, mixage, mastering). Places limitées à 20 participants avec accès au studio professionnel.',
    contact:'0550 321 654 — musique@proform.com', estPublie:true },
];

/* ── 32 Utilisateurs démo ───────────────────────────────── */
const DEMO_USERS = [
  /* 20 Étudiants */
  { nom:'Benali',    prenom:'Yacine',   email:'yacine.benali@etud.dz',    telephone:'+213550001001', role:'etudiant',  discipline:'Théâtre',       password:'Etud@2026', estVerifie:true },
  { nom:'Meziani',   prenom:'Sara',     email:'sara.meziani@etud.dz',     telephone:'+213550001002', role:'etudiant',  discipline:'Cinéma',        password:'Etud@2026', estVerifie:true },
  { nom:'Hadj',      prenom:'Karim',    email:'karim.hadj@etud.dz',       telephone:'+213550001003', role:'etudiant',  discipline:'Art Plastique', password:'Etud@2026', estVerifie:true },
  { nom:'Boukhors',  prenom:'Amina',    email:'amina.boukhors@etud.dz',   telephone:'+213550001004', role:'etudiant',  discipline:'Musique',       password:'Etud@2026', estVerifie:true },
  { nom:'Kaci',      prenom:'Lamine',   email:'lamine.kaci@etud.dz',      telephone:'+213550001005', role:'etudiant',  discipline:'Théâtre',       password:'Etud@2026', estVerifie:true },
  { nom:'Ferhat',    prenom:'Nadia',    email:'nadia.ferhat@etud.dz',     telephone:'+213550001006', role:'etudiant',  discipline:'Musique',       password:'Etud@2026', estVerifie:true },
  { nom:'Zerrouki',  prenom:'Anis',     email:'anis.zerrouki@etud.dz',    telephone:'+213550001007', role:'etudiant',  discipline:'Cinéma',        password:'Etud@2026', estVerifie:true },
  { nom:'Brahim',    prenom:'Dalila',   email:'dalila.brahim@etud.dz',    telephone:'+213550001008', role:'etudiant',  discipline:'Art Plastique', password:'Etud@2026', estVerifie:true },
  { nom:'Ait',       prenom:'Omar',     email:'omar.ait@etud.dz',         telephone:'+213550001009', role:'etudiant',  discipline:'Musique',       password:'Etud@2026', estVerifie:true },
  { nom:'Mansouri',  prenom:'Rania',    email:'rania.mansouri@etud.dz',   telephone:'+213550001010', role:'etudiant',  discipline:'Théâtre',       password:'Etud@2026', estVerifie:true },
  { nom:'Djaafri',   prenom:'Nour',     email:'nour.djaafri@etud.dz',     telephone:'+213550001011', role:'etudiant',  discipline:'Art Plastique', password:'Etud@2026', estVerifie:true },
  { nom:'Belabbas',  prenom:'Mohamed',  email:'med.belabbas@etud.dz',     telephone:'+213550001012', role:'etudiant',  discipline:'Cinéma',        password:'Etud@2026', estVerifie:true },
  { nom:'Saidi',     prenom:'Fatima',   email:'fatima.saidi@etud.dz',     telephone:'+213550001013', role:'etudiant',  discipline:'Musique',       password:'Etud@2026', estVerifie:true },
  { nom:'Lounis',    prenom:'Bilal',    email:'bilal.lounis@etud.dz',     telephone:'+213550001014', role:'etudiant',  discipline:'Théâtre',       password:'Etud@2026', estVerifie:true },
  { nom:'Tahir',     prenom:'Sonia',    email:'sonia.tahir@etud.dz',      telephone:'+213550001015', role:'etudiant',  discipline:'Art Plastique', password:'Etud@2026', estVerifie:true },
  { nom:'Chouaib',   prenom:'Ismail',   email:'ismail.chouaib@etud.dz',   telephone:'+213550001016', role:'etudiant',  discipline:'Cinéma',        password:'Etud@2026', estVerifie:true },
  { nom:'Benzehra',  prenom:'Lamia',    email:'lamia.benzehra@etud.dz',   telephone:'+213550001017', role:'etudiant',  discipline:'Musique',       password:'Etud@2026', estVerifie:true },
  { nom:'Mesbahi',   prenom:'Tarek',    email:'tarek.mesbahi@etud.dz',    telephone:'+213550001018', role:'etudiant',  discipline:'Théâtre',       password:'Etud@2026', estVerifie:true },
  { nom:'Aouali',    prenom:'Imane',    email:'imane.aouali@etud.dz',     telephone:'+213550001019', role:'etudiant',  discipline:'Art Plastique', password:'Etud@2026', estVerifie:true },
  { nom:'Boufara',   prenom:'Zakaria',  email:'zakaria.boufara@etud.dz',  telephone:'+213550001020', role:'etudiant',  discipline:'Cinéma',        password:'Etud@2026', estVerifie:true },
  /* 4 Artistes */
  { nom:'Berber',    prenom:'Sofiane',  email:'sofiane.berber@art.dz',    telephone:'+213661002001', role:'artiste',   discipline:'Art Plastique', password:'Art@2026', estVerifie:true, bio:'Peintre contemporain, expositions nationales et internationales.' },
  { nom:'Larbi',     prenom:'Yasmine',  email:'yasmine.larbi@art.dz',     telephone:'+213661002002', role:'artiste',   discipline:'Musique',       password:'Art@2026', estVerifie:true, bio:'Chanteuse de musique chaâbi et jazz-fusion.' },
  { nom:'Allou',     prenom:'Rachid',   email:'rachid.allou@art.dz',      telephone:'+213661002003', role:'artiste',   discipline:'Cinéma',        password:'Art@2026', estVerifie:true, bio:'Réalisateur de courts-métrages primés au festival national.' },
  { nom:'Makhlouf',  prenom:'Ibtissam', email:'ibtissam.makhlouf@art.dz', telephone:'+213661002004', role:'artiste',   discipline:'Théâtre',       password:'Art@2026', estVerifie:true, bio:'Comédienne et metteuse en scène, primée au Festival d\'Alger.' },
  /* 8 Formateurs */
  { nom:'Benaissa',  prenom:'Karim',    email:'karim.benaissa@form.dz',   telephone:'+213770003001', role:'formateur', discipline:'Théâtre',       password:'Form@2026', estVerifie:true, bio:'Metteur en scène, 15 ans d\'expérience professionnelle.' },
  { nom:'Boudiaf',   prenom:'Yacine',   email:'yacine.boudiaf@form.dz',   telephone:'+213770003002', role:'formateur', discipline:'Cinéma',        password:'Form@2026', estVerifie:true, bio:'Réalisateur certifié INCA, formateur depuis 2018.' },
  { nom:'Hadj-Ali',  prenom:'Amina',    email:'amina.hadjali@form.dz',    telephone:'+213770003003', role:'formateur', discipline:'Art Plastique', password:'Form@2026', estVerifie:true, bio:'Peintre et illustratrice, diplômée des Beaux-Arts d\'Alger.' },
  { nom:'Ferhat',    prenom:'Djamel',   email:'djamel.ferhat@form.dz',    telephone:'+213770003004', role:'formateur', discipline:'Musique',       password:'Form@2026', estVerifie:true, bio:'Guitariste professionnel, 20 ans de scène.' },
  { nom:'Cherifi',   prenom:'Nadia',    email:'nadia.cherifi@form.dz',    telephone:'+213770003005', role:'formateur', discipline:'Musique',       password:'Form@2026', estVerifie:true, bio:'Soprano et professeure de chant lyrique.' },
  { nom:'Laib',      prenom:'Sami',     email:'sami.laib@form.dz',        telephone:'+213770003006', role:'formateur', discipline:'Cinéma',        password:'Form@2026', estVerifie:true, bio:'Monteur professionnel, 12 ans d\'expérience en post-production.' },
  { nom:'Zerrouki',  prenom:'Amine',    email:'amine.zerrouki@form.dz',   telephone:'+213770003007', role:'formateur', discipline:'Théâtre',       password:'Form@2026', estVerifie:true, bio:'Comédien et improvisateur, directeur de l\'Atelier Théâtre d\'Alger.' },
  { nom:'Benmerabet',prenom:'Khaled',   email:'khaled.benmerabet@form.dz',telephone:'+213770003008', role:'formateur', discipline:'Musique',       password:'Form@2026', estVerifie:true, bio:'Pianiste classique et professeur au Conservatoire Central.' },
];

/* ── Main ───────────────────────────────────────────────── */
async function seed() {
  try {
    console.log('\n🌱 Connexion à MongoDB Atlas...');
    await mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connecté !\n');

    /* Admin */
    console.log('👤 Compte admin...');
    const adminExists = await User.findOne({ email: 'admin@proform.com' });
    if (!adminExists) {
      await User.create({ nom:'Admin', prenom:'ProForm', email:'admin@proform.com',
        telephone:'0550000000', password:'Admin@2026', role:'admin', estVerifie:true });
      console.log('   ✓ Créé : admin@proform.com / Admin@2026');
    } else {
      await User.updateOne({ email:'admin@proform.com' }, { estVerifie:true, role:'admin' });
      console.log('   ✓ Déjà existant — mis à jour');
    }

    /* Utilisateurs démo */
    console.log('\n👥 Utilisateurs démo (18 personnes)...');
    for (const u of DEMO_USERS) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) { await User.create(u); process.stdout.write('.'); }
    }
    const etu = await User.countDocuments({ role:'etudiant' });
    const art = await User.countDocuments({ role:'artiste' });
    const frm = await User.countDocuments({ role:'formateur' });
    console.log(`\n   ✓ ${etu} étudiants · ${art} artistes · ${frm} formateurs`);

    /* Programmes / Courses */
    console.log('\n📚 Programmes (courses)...');
    const cc = await Course.countDocuments();
    if (cc === 0) { await Course.insertMany(COURSES); console.log(`   ✓ ${COURSES.length} programmes insérés`); }
    else console.log(`   ℹ  ${cc} programmes déjà présents`);

    /* Instituts */
    console.log('\n🏛️  Instituts...');
    const ic = await Institut.countDocuments();
    if (ic === 0) { await Institut.insertMany(INSTITUTS); console.log(`   ✓ ${INSTITUTS.length} instituts insérés`); }
    else console.log(`   ℹ  ${ic} instituts déjà présents`);

    /* Actualités */
    console.log('\n📰 Actualités (news)...');
    const nc = await News.countDocuments();
    if (nc === 0) { await News.insertMany(NEWS); console.log(`   ✓ ${NEWS.length} actualités insérées`); }
    else console.log(`   ℹ  ${nc} actualités déjà présentes`);

    /* SiteConfig */
    console.log('\n⚙️  Paramètres du site...');
    const scExists = await SiteConfig.findOne();
    if (!scExists) {
      await SiteConfig.create({
        telephone:'+213 550 00 00 00', email:'contact@proform.com',
        adresse:'Alger, Algérie', facebook:'', instagram:'', youtube:''
      });
      console.log('   ✓ Config initiale créée');
    } else { console.log('   ℹ  Config déjà existante'); }

    /* Résumé */
    const [uc2, cc2, ic2, nc2] = await Promise.all([
      User.countDocuments(), Course.countDocuments(),
      Institut.countDocuments(), News.countDocuments()
    ]);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ProForm MongoDB Atlas prêt !');
    console.log(`   users     : ${uc2} document(s)  (admin + 10 étu + 3 art + 5 form)`);
    console.log(`   courses   : ${cc2} document(s)`);
    console.log(`   instituts : ${ic2} document(s)`);
    console.log(`   news      : ${nc2} document(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
    console.log('\n⚠️  Causes possibles :');
    console.log('   1. IP non whitelistée dans Atlas → Network Access → Add IP : 0.0.0.0/0');
    console.log('   2. MONGO_URI incorrect dans le fichier .env');
    console.log('   3. Mot de passe Atlas incorrect (remplacez <db_password>)\n');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
