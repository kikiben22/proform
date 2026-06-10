/**
 * ProForm — Seed actualités & offres
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const News = require('./models/News');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const ARTICLES = [
  /* ── ARTICLES ─────────────────────────────────────────── */
  {
    titre: "L'art théâtral algérien à l'honneur : retour sur 60 ans de scène nationale",
    contenu: "Depuis l'indépendance, le théâtre algérien a connu une évolution remarquable, passant des pièces militantes des années 1960 aux créations contemporaines d'aujourd'hui. ProForm revient sur les grandes étapes de cette histoire culturelle riche, à travers les témoignages de metteurs en scène, comédiens et dramaturges qui ont façonné la scène nationale. Des pionniers comme Mustapha Kateb à la génération actuelle, découvrez comment l'art dramatique algérien s'est construit, transmis et renouvelé.",
    type: 'Article', discipline: 'scene', contact: 'redaction@proform.com'
  },
  {
    titre: "Cinéma algérien 2026 : une nouvelle vague de réalisateurs émerge",
    contenu: "Une génération de jeunes réalisateurs algériens révolutionne le 7ème art national. Avec des budgets modestes mais une créativité débordante, ils explorent des sujets contemporains — identité, diaspora, jeunesse urbaine — et remportent des prix dans les festivals internationaux. ProForm dresse le portrait de cinq cinéastes à suivre absolument cette année, et analyse comment les plateformes numériques transforment la diffusion du cinéma algérien à l'étranger.",
    type: 'Article', discipline: 'cinema', contact: 'redaction@proform.com'
  },
  {
    titre: "Art plastique contemporain : les artistes algériens s'imposent sur la scène mondiale",
    contenu: "De Paris à Dubai, en passant par New York et Tokyo, les plasticiens algériens font parler d'eux. Cette année, pas moins de 12 artistes algériens ont été sélectionnés dans des expositions internationales majeures. ProForm a rencontré trois d'entre eux pour comprendre leur démarche créative, leur rapport à la tradition amazighe et arabe, et la façon dont ils intègrent les nouvelles technologies dans leur pratique artistique.",
    type: 'Article', discipline: 'art-plastique', contact: 'redaction@proform.com'
  },
  {
    titre: "La musique chaâbi : patrimoine vivant en pleine renaissance",
    contenu: "Le chaâbi, cette musique populaire algéroise née au début du XXe siècle, connaît un renouveau inattendu grâce à une nouvelle génération de musiciens qui fusionnent tradition et modernité. Des jeunes artistes mêlent mandole et synthétiseurs, textes classiques et flow contemporain, créant un son unique qui conquiert les scènes internationales. ProForm explore cette renaissance musicale et vous présente les formations qui permettent aujourd'hui d'apprendre cet art ancestral.",
    type: 'Article', discipline: 'musique', contact: 'redaction@proform.com'
  },
  {
    titre: "Formation artistique en Algérie : bilan 2025 et perspectives 2026",
    contenu: "L'année 2025 a marqué un tournant dans la formation artistique professionnelle en Algérie. Avec l'ouverture de nouveaux instituts, le lancement de programmes certifiants en ligne et le partenariat entre ProForm et les principales écoles d'art du pays, plus de 8 000 artistes ont pu accéder à une formation de qualité. Retour sur les chiffres clés et les projets ambitieux qui façonneront la scène culturelle algérienne en 2026.",
    type: 'Article', discipline: '', contact: 'redaction@proform.com'
  },

  /* ── OFFRES ─────────────────────────────────────────── */
  {
    titre: "Offre d'emploi : Metteur en scène recherché — Théâtre Régional de Constantine",
    contenu: "Le Théâtre Régional de Constantine recrute un metteur en scène expérimenté pour diriger sa saison 2026-2027. Profil recherché : minimum 5 ans d'expérience, maîtrise des techniques de mise en scène contemporaine, capacité à travailler avec des troupes professionnelles et amateurs. Le candidat retenu dirigera 3 productions annuelles et participera aux ateliers pédagogiques. Contrat CDI, rémunération selon grille nationale + avantages. Dossier de candidature complet à envoyer avant le 30 juin 2026.",
    type: 'Offre', discipline: 'scene', contact: '0770 456 123 — rh@theatre-constantine.dz'
  },
  {
    titre: "Casting ouvert : court-métrage 'Bleu Medina' — Production Carthage Films",
    contenu: "La société de production Carthage Films lance un casting ouvert pour son prochain court-métrage 'Bleu Medina', une histoire d'amour et d'identité tournée dans les ruelles d'Alger. Recherche : comédiens et comédiennes de 20 à 45 ans, toutes origines, avec ou sans expérience professionnelle. Les auditions se dérouleront du 10 au 20 juin 2026 à Alger. Inscription gratuite via ProForm. Le tournage est prévu pour août 2026.",
    type: 'Offre', discipline: 'cinema', contact: '0550 789 456 — casting@carthagefilms.dz'
  },
  {
    titre: "Résidence artistique internationale — Appel à candidatures artistes plasticiens",
    contenu: "La Fondation Culturelle Algéro-Française lance son programme annuel de résidences artistiques. 6 plasticiens algériens seront sélectionnés pour une résidence de 3 mois à Paris (Institut du Monde Arabe), avec prise en charge complète (billet, hébergement, atelier, bourse mensuelle de 1 200€). Critères : artiste algérien de moins de 40 ans, dossier artistique solide, projet de création innovant. Date limite de candidature : 15 juillet 2026.",
    type: 'Offre', discipline: 'art-plastique', contact: 'residences@fondation-algfr.org'
  },
  {
    titre: "Musiciens recherchés : Orchestre National Symphonique — Auditions 2026",
    contenu: "L'Orchestre National Symphonique d'Algérie organise ses auditions annuelles pour intégrer de nouveaux musiciens permanents. Postes ouverts : 4 violonistes, 2 altistes, 1 violoncelliste, 2 flûtistes, 1 clarinettiste. Niveau requis : diplôme de conservatoire ou équivalent, excellente lecture à vue, expérience en orchestre souhaitée. Auditions les 5 et 6 juillet 2026 à l'Opéra d'Alger. Inscription sur ProForm avant le 25 juin.",
    type: 'Offre', discipline: 'musique', contact: '0770 123 789 — auditions@ons-algerie.dz'
  },
  {
    titre: "Formateurs recherchés : ProForm recrute pour ses programmes en ligne 2026-2027",
    contenu: "ProForm.COM lance un appel à candidatures pour enrichir son catalogue de formations en ligne. Nous recherchons des formateurs passionnés et expérimentés dans toutes les disciplines artistiques : théâtre, cinéma, arts plastiques, musique. Profil : minimum 8 ans d'expérience professionnelle, pédagogie prouvée, maîtrise des outils numériques. Rémunération attractive basée sur le nombre d'inscrits. Candidatez en joignant votre CV et un extrait vidéo de cours.",
    type: 'Offre', discipline: '', contact: 'formateurs@proform.com'
  },
  {
    titre: "Scénariste junior recherché — Studio Baya Productions",
    contenu: "Studio Baya Productions, producteur de contenus audiovisuels pour la télévision et le web, recrute un scénariste junior pour renforcer son équipe créative. Missions : développement de séries courtes, adaptation de nouvelles, écriture de pitchs. Profil : formation en écriture créative ou cinéma, portfolio avec au moins 2 scripts courts, maîtrise du français et de l'arabe. Poste basé à Alger, CDI. Envoi de candidature avec portfolio avant le 30 juin 2026.",
    type: 'Offre', discipline: 'cinema', contact: '0550 246 813 — recrutement@bayaprod.dz'
  },
  {
    titre: "Offre : Professeur de chant — Conservatoire Municipal d'Oran",
    contenu: "Le Conservatoire Municipal d'Oran ouvre un poste de professeur de chant lyrique et moderne pour la rentrée 2026. Le candidat enseignera à des élèves de tous niveaux (enfants, adultes, professionnels), organisera des auditions trimestrielles et participera aux concerts du conservatoire. Diplôme supérieur de chant obligatoire, expérience pédagogique de 3 ans minimum. Logement de fonction possible. Dépôt de candidature : avant le 15 juillet 2026.",
    type: 'Offre', discipline: 'musique', contact: '0770 369 258 — conservatoire@mairie-oran.dz'
  },

  /* ── ÉVÉNEMENTS ─────────────────────────────────────── */
  {
    titre: "Festival International du Film d'Animation — Alger, 18-25 juillet 2026",
    contenu: "Pour la première fois, l'Algérie accueille un festival international dédié au cinéma d'animation. Plus de 200 films de 40 pays en compétition, des masterclasses avec des réalisateurs de renom, des ateliers pratiques ouverts au public et une exposition permanente sur l'histoire de l'animation mondiale. Les membres ProForm bénéficient d'une accréditation gratuite pour toutes les projections. Inscrivez-vous dès maintenant sur notre plateforme.",
    type: 'Événement', discipline: 'cinema', contact: '0550 111 222 — festival@animation-alger.dz'
  },
  {
    titre: "Journées Nationales des Arts Plastiques — Oran, 5-10 août 2026",
    contenu: "Les 12èmes Journées Nationales des Arts Plastiques se tiendront à Oran du 5 au 10 août 2026. Au programme : expositions collectives et individuelles dans 8 galeries de la ville, ateliers de peinture en plein air sur le front de mer, conférences sur l'art contemporain algérien, marché d'art avec 150 artistes participants. Entrée libre. Les artistes membres ProForm peuvent proposer leurs œuvres en vente via notre partenariat.",
    type: 'Événement', discipline: 'art-plastique', contact: '0560 444 555 — jnap@culture.gov.dz'
  },
  {
    titre: "Semaine du Théâtre Amateur — 10 wilayas mobilisées, juin 2026",
    contenu: "Le Ministère de la Culture organise la 8ème Semaine Nationale du Théâtre Amateur du 20 au 27 juin 2026, dans 10 wilayas simultanément : Alger, Oran, Constantine, Annaba, Tlemcen, Sétif, Batna, Béjaïa, Biskra et Tamanrasset. Chaque wilaya accueillera des troupes locales et régionales dans une ambiance festive. Les membres ProForm peuvent suivre la programmation complète et voter pour leur pièce préférée via notre application.",
    type: 'Événement', discipline: 'scene', contact: '0770 555 666 — theatre-amateur@culture.gov.dz'
  },
  {
    titre: "Concert Fusion Méditerranéen — Théâtre de Verdure d'Alger, 14 juillet 2026",
    contenu: "ProForm, en partenariat avec l'Institut Français d'Alger, organise un grand concert fusion réunissant des musiciens algériens, tunisiens, marocains et français. Une soirée exceptionnelle mêlant chaâbi, flamenco, gnaoui et jazz contemporain. 3 000 places disponibles. Réservation prioritaire pour les membres ProForm à partir du 1er juin 2026. Prix des billets : 500 DA (membres) / 800 DA (grand public).",
    type: 'Événement', discipline: 'musique', contact: '0550 777 888 — concerts@proform.com'
  },

  /* ── ANNONCES ─────────────────────────────────────────── */
  {
    titre: "Nouveau partenariat ProForm — Institut Supérieur des Arts Dramatiques (ISAD)",
    contenu: "ProForm annonce la signature d'un accord de partenariat stratégique avec l'Institut Supérieur des Arts Dramatiques d'Alger. Ce partenariat permettra aux étudiants de l'ISAD d'accéder gratuitement à toutes les formations en ligne de ProForm, et aux formateurs ProForm d'intervenir dans les programmes académiques de l'Institut. Une commission mixte se réunira chaque trimestre pour coordonner les initiatives communes et développer de nouveaux modules pédagogiques.",
    type: 'Annonce', discipline: 'scene', contact: 'partenariats@proform.com'
  },
  {
    titre: "Lancement du Prix ProForm — Récompense la création artistique algérienne",
    contenu: "ProForm crée le premier prix dédié à la création artistique numérique algérienne. 4 catégories : Meilleure performance scénique filmée, Meilleur court-métrage, Meilleure œuvre plastique numérique, Meilleur titre musical inédit. Dotation totale : 2 000 000 DA répartis entre les lauréats. Toute personne inscrite sur ProForm peut soumettre son œuvre. Les candidatures sont ouvertes jusqu'au 31 août 2026. Cérémonie de remise des prix en octobre 2026.",
    type: 'Annonce', discipline: '', contact: 'prix@proform.com'
  },
  {
    titre: "Mise à jour ProForm : nouvelles fonctionnalités disponibles",
    contenu: "La plateforme ProForm s'enrichit de nouvelles fonctionnalités pour améliorer votre expérience : tableau de bord personnalisé avec suivi de progression, messagerie directe entre membres, système de mentorat pour connecter débutants et experts, téléchargement des ressources pédagogiques en mode hors-ligne, et nouveau module de portfolio pour exposer vos créations. Toutes ces fonctionnalités sont disponibles immédiatement pour les membres inscrits.",
    type: 'Annonce', discipline: '', contact: 'support@proform.com'
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB Atlas\n');

  // Delete existing news
  await News.deleteMany({});
  console.log('🗑️  Anciennes actualités supprimées\n');

  let ok = 0;
  for (const item of ARTICLES) {
    await News.create({ ...item, estPublie: true });
    console.log(`  ✅ ${item.type.padEnd(10)} ${item.titre.substring(0, 60)}…`);
    ok++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ ${ok} actualités insérées dans MongoDB Atlas`);
  console.log(`   Articles : ${ARTICLES.filter(a=>a.type==='Article').length}`);
  console.log(`   Offres   : ${ARTICLES.filter(a=>a.type==='Offre').length}`);
  console.log(`   Événements: ${ARTICLES.filter(a=>a.type==='Événement').length}`);
  console.log(`   Annonces : ${ARTICLES.filter(a=>a.type==='Annonce').length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
