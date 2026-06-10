/* ============================================
   ProForm — Base de données locale
   localStorage (métadonnées) + IndexedDB (fichiers vidéo)
   ============================================ */

/* ══════════════════════════════════════════════
   IndexedDB — stockage des fichiers vidéo
   ══════════════════════════════════════════════ */
const VideoDB = {
  DB: 'proform_files', VER: 1, STORE: 'videos',

  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB, this.VER);
      req.onupgradeneeded = e => e.target.result.createObjectStore(this.STORE);
      req.onsuccess  = e => resolve(e.target.result);
      req.onerror    = e => reject(e.target.error);
    });
  },

  async save(id, file) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).put(file, id);
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  },

  async get(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(this.STORE, 'readonly');
      const req = tx.objectStore(this.STORE).get(id);
      req.onsuccess = e => resolve(e.target.result || null);
      req.onerror   = e => reject(e.target.error);
    });
  },

  async remove(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  },

  async blobUrl(id) {
    const file = await this.get(id);
    return file ? URL.createObjectURL(file) : null;
  }
};

/* ══════════════════════════════════════════════
   localStorage CRUD générique
   ══════════════════════════════════════════════ */
const DB = {
  COURSES:  'proform_courses',
  VIDEOS:   'proform_videos',
  INSTITUTS:'proform_instituts',
  USERS:    'proform_users',
  NEWS:     'proform_news',

  read(key)       { try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } },
  write(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  uid()           { return 'local_'+Date.now()+'_'+Math.random().toString(36).substr(2,6); },

  add(key, item) {
    const list = this.read(key);
    item._id      = item._id || this.uid();
    item._local   = true;
    item.createdAt = item.createdAt || new Date().toISOString();
    list.unshift(item);
    this.write(key, list);
    return item;
  },

  update(key, id, patch) {
    const list = this.read(key);
    const i    = list.findIndex(x => x._id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; this.write(key, list); return list[i]; }
    return null;
  },

  remove(key, id) { this.write(key, this.read(key).filter(x => x._id !== id)); }
};

/* ══════════════════════════════════════════════
   Constantes UI
   ══════════════════════════════════════════════ */
const CAT_ICON  = { scene:'🎭', cinema:'🎬', 'art-plastique':'🎨', musique:'🎵' };
const CAT_LABEL = { scene:'Scène & Théâtre', cinema:'Cinéma', 'art-plastique':'Art Plastique', musique:'Musique' };

const WILAYAS = [
  '01 - Adrar','02 - Chlef','03 - Laghouat','04 - Oum El Bouaghi','05 - Batna',
  '06 - Béjaïa','07 - Biskra','08 - Béchar','09 - Blida','10 - Bouira',
  '11 - Tamanrasset','12 - Tébessa','13 - Tlemcen','14 - Tiaret','15 - Tizi Ouzou',
  '16 - Alger','17 - Djelfa','18 - Jijel','19 - Sétif','20 - Saïda',
  '21 - Skikda','22 - Sidi Bel Abbès','23 - Annaba','24 - Guelma','25 - Constantine',
  '26 - Médéa','27 - Mostaganem','28 - M\'Sila','29 - Mascara','30 - Ouargla',
  '31 - Oran','32 - El Bayadh','33 - Illizi','34 - Bordj Bou Arréridj','35 - Boumerdès',
  '36 - El Tarf','37 - Tindouf','38 - Tissemsilt','39 - El Oued','40 - Khenchela',
  '41 - Souk Ahras','42 - Tipaza','43 - Mila','44 - Aïn Defla','45 - Naâma',
  '46 - Aïn Témouchent','47 - Ghardaïa','48 - Relizane','49 - Timimoun',
  '50 - Bordj Badji Mokhtar','51 - Ouled Djellal','52 - Béni Abbès','53 - In Salah',
  '54 - In Guezzam','55 - Touggourt','56 - Djanet','57 - El M\'Ghair','58 - El Meniaa'
];

/* ══════════════════════════════════════════════
   Auto-seed données démo au premier chargement
   ══════════════════════════════════════════════ */
(function autoSeedDemo() {
  if (DB.read(DB.COURSES).length > 0 && DB.read(DB.INSTITUTS).length > 0) return;

  const DEMO_COURSES = [
    { titre:'Art du Théâtre — Débutant', categorie:'scene', sousCategorie:'performance',
      description:'Découvrez les fondamentaux du jeu d\'acteur, la présence scénique et l\'improvisation.', dureeHeures:24, niveaux:'debutant',
      formateur:{nom:'Karim Benaissa',titre:'Metteur en scène'}, note:{moyenne:4.7,nombreAvis:234}, estPublie:true, tags:['théâtre','débutant'] },
    { titre:'Mise en Scène — Avancé', categorie:'scene', sousCategorie:'mise-en-scene',
      description:'Maîtrisez la direction d\'acteurs, la scénographie et la gestion du plateau.', dureeHeures:40, niveaux:'avance',
      formateur:{nom:'Samia Meziane',titre:'Directrice artistique'}, note:{moyenne:4.9,nombreAvis:87}, estPublie:true, tags:['mise en scène'] },
    { titre:'Improvisation & Performance', categorie:'scene', sousCategorie:'improvisation',
      description:'Libérez votre créativité à travers l\'improvisation scénique et les techniques de jeu instantané.', dureeHeures:18, niveaux:'tous',
      formateur:{nom:'Amine Zerrouki',titre:'Comédien'}, note:{moyenne:4.6,nombreAvis:112}, estPublie:true, tags:['impro'] },
    { titre:'Réalisation Cinéma — Les Bases', categorie:'cinema', sousCategorie:'realisation',
      description:'Tout pour réaliser votre premier court-métrage : cadrage, lumière, montage.', dureeHeures:36, niveaux:'debutant',
      formateur:{nom:'Yacine Boudiaf',titre:'Réalisateur'}, note:{moyenne:4.8,nombreAvis:198}, estPublie:true, tags:['cinéma','réalisation'] },
    { titre:'Écriture de Scénario', categorie:'cinema', sousCategorie:'scenario',
      description:'Méthode Hollywood : structure en 3 actes, personnages mémorables, dialogues.', dureeHeures:28, niveaux:'intermediaire',
      formateur:{nom:'Rania Khalil',titre:'Scénariste'}, note:{moyenne:4.7,nombreAvis:156}, estPublie:true, tags:['scénario'] },
    { titre:'Montage Vidéo — Premiere Pro', categorie:'cinema', sousCategorie:'montage',
      description:'Maîtrisez Adobe Premiere Pro de A à Z pour un montage professionnel.', dureeHeures:32, niveaux:'tous',
      formateur:{nom:'Sami Laib',titre:'Monteur'}, note:{moyenne:4.9,nombreAvis:203}, estPublie:true, tags:['montage'] },
    { titre:'Peinture Acrylique — Débutant', categorie:'art-plastique', sousCategorie:'peinture',
      description:'Initiez-vous à la peinture acrylique : couleurs, textures, style personnel.', dureeHeures:20, niveaux:'debutant',
      formateur:{nom:'Amina Hadj-Ali',titre:'Peintre'}, note:{moyenne:4.8,nombreAvis:321}, estPublie:true, tags:['peinture'] },
    { titre:'Art Numérique — Procreate', categorie:'art-plastique', sousCategorie:'numerique',
      description:'Illustrations professionnelles sur iPad : brosses, calques, exportation.', dureeHeures:25, niveaux:'tous',
      formateur:{nom:'Sonia Brahim',titre:'Illustratrice digitale'}, note:{moyenne:4.9,nombreAvis:267}, estPublie:true, tags:['numérique'] },
    { titre:'Dessin Académique', categorie:'art-plastique', sousCategorie:'dessin',
      description:'Du croquis au dessin technique : proportions, ombre/lumière, composition.', dureeHeures:22, niveaux:'debutant',
      formateur:{nom:'Farid Benali',titre:'Dessinateur'}, note:{moyenne:4.8,nombreAvis:178}, estPublie:true, tags:['dessin'] },
    { titre:'Guitare Acoustique — Débutant', categorie:'musique', sousCategorie:'guitare',
      description:'Apprenez la guitare de zéro : accords de base, rythmes, premières chansons.', dureeHeures:30, niveaux:'debutant',
      formateur:{nom:'Djamel Ferhat',titre:'Guitariste'}, note:{moyenne:4.8,nombreAvis:445}, estPublie:true, tags:['guitare'] },
    { titre:'Production Musicale — FL Studio', categorie:'musique', sousCategorie:'production',
      description:'Produisez vos beats et morceaux de A à Z : drums, synthés, mixage, mastering.', dureeHeures:40, niveaux:'tous',
      formateur:{nom:'Sofiane Belkadi',titre:'Beatmaker'}, note:{moyenne:4.8,nombreAvis:203}, estPublie:true, tags:['FL Studio'] },
    { titre:'Chant & Technique Vocale', categorie:'musique', sousCategorie:'chant',
      description:'Développez votre voix : respiration, justesse, interprétation.', dureeHeures:28, niveaux:'tous',
      formateur:{nom:'Nadia Cherifi',titre:'Soprano'}, note:{moyenne:4.9,nombreAvis:167}, estPublie:true, tags:['chant','voix'] },
  ];

  const DEMO_INSTITUTS = [
    { nom:'Institut National des Arts Dramatiques', discipline:'scene', type:'Officiel', icone:'🎭', couleur:'gold', localisation:'Alger — Rue Didouche Mourad', telephone:'021 63 47 89', email:'contact@inad.dz', specialites:'Théâtre, Scénographie' },
    { nom:'Conservatoire National d\'Art Dramatique', discipline:'scene', type:'Certifié', icone:'🎭', couleur:'purple', localisation:'Oran — Boulevard de la Soummam', telephone:'041 33 12 56', email:'conservatoire@cnad.dz', specialites:'Jeu d\'acteur, Improvisation' },
    { nom:'Institut National du Cinéma (INCA)', discipline:'cinema', type:'Officiel', icone:'🎬', couleur:'teal', localisation:'Alger — Hydra', telephone:'021 69 31 47', email:'inca@culture.dz', specialites:'Réalisation, Scénario, Production' },
    { nom:'Académie du Cinéma Méditerranéen', discipline:'cinema', type:'Certifié', icone:'🎬', couleur:'blue', localisation:'Constantine — Rue Larbi Ben M\'hidi', telephone:'031 92 44 78', email:'acm@cinema-med.dz', specialites:'Coproductions, Documentaire' },
    { nom:'École des Beaux-Arts d\'Alger', discipline:'art-plastique', type:'Officiel', icone:'🎨', couleur:'red', localisation:'Alger — Palais de la Culture', telephone:'021 67 14 33', email:'beaux-arts@algercity.dz', specialites:'Peinture, Sculpture, Design' },
    { nom:'Digital Arts Academy', discipline:'art-plastique', type:'Partenaire', icone:'🎨', couleur:'orange', localisation:'Oran — Technopole d\'Oran', telephone:'0550 88 12 34', email:'hello@digitalarts.dz', specialites:'Art numérique, Illustration' },
    { nom:'Conservatoire Central d\'Oran', discipline:'musique', type:'Officiel', icone:'🎵', couleur:'gold', localisation:'Oran — Rue des Frères Bellil', telephone:'041 41 22 67', email:'conservatoire@oran-musique.dz', specialites:'Guitare, Piano, Chant' },
    { nom:'Académie de Musique d\'Alger', discipline:'musique', type:'Certifié', icone:'🎵', couleur:'purple', localisation:'Alger — El Biar', telephone:'0550 77 34 56', email:'contact@musique-alger.dz', specialites:'Composition, Production' },
  ];

  const DEMO_NEWS = [
    { titre:'Ouverture des inscriptions — Saison 2026', type:'Annonce', discipline:'',
      contenu:'Les inscriptions pour la saison artistique 2026 sont ouvertes. Accédez à toutes nos formations professionnelles dispensées par les meilleurs experts du domaine artistique algérien.',
      contact:'0550 123 456 — inscriptions@proform.com' },
    { titre:'Festival National du Théâtre — Alger 2026', type:'Événement', discipline:'scene',
      contenu:'Le Festival National du Théâtre professionnel se tiendra du 15 au 22 avril 2026 au TNA. Entrée gratuite pour les membres ProForm.',
      contact:'0770 456 789' },
    { titre:'Masterclass Production Musicale', type:'Annonce', discipline:'musique',
      contenu:'Masterclass exceptionnelle de 3 jours intensifs : production, mixage, mastering. Places limitées à 20 participants avec accès au studio professionnel.',
      contact:'0550 321 654 — musique@proform.com' },
  ];

  if (DB.read(DB.COURSES).length === 0)
    DEMO_COURSES.forEach(d => DB.add(DB.COURSES, { estPublie:true, ...d }));
  if (DB.read(DB.INSTITUTS).length === 0)
    DEMO_INSTITUTS.forEach(i => DB.add(DB.INSTITUTS, i));
  if (DB.read(DB.NEWS).length === 0)
    DEMO_NEWS.forEach(n => DB.add(DB.NEWS, { estPublie:true, ...n }));
})();

/* ══════════════════════════════════════════════
   Store — API publique
   ══════════════════════════════════════════════ */
const Store = {

  /* ── Cours ── */
  Courses: {
    getAll(cat) {
      let l = DB.read(DB.COURSES);
      if (cat) l = l.filter(c => c.categorie === cat);
      return l;
    },
    add(c)        { return DB.add(DB.COURSES, { estPublie:true, ...c }); },
    update(id, p) { return DB.update(DB.COURSES, id, p); },
    remove(id)    { DB.remove(DB.COURSES, id); },

    cardHTML(c) {
      const icon  = CAT_ICON[c.categorie]  || '📚';
      const label = CAT_LABEL[c.categorie] || c.categorie;
      const note  = c.note?.moyenne ? `⭐ ${c.note.moyenne}` : '';
      const duree = c.dureeHeures ? `🕐 ${c.dureeHeures}h` : '';
      const img   = c.image
        ? `<img src="${c.image}" alt="${c.titre}" class="course-card-img" onerror="this.style.display='none'">`
        : `<div class="course-card-img" style="display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:linear-gradient(135deg,#1a1a2e,#2d1b69);min-height:160px">${icon}</div>`;
      return `
        <div class="course-card" data-local="1" data-cat="${c.sousCategorie||c.categorie}" data-title="${c.titre}">
          ${img}
          <div class="course-card-body">
            <span class="course-tag">${icon} ${label}</span>
            <div class="course-title">${c.titre}</div>
            <div class="course-desc">${(c.description||'').substring(0,110)}…</div>
            <div class="course-meta">${note ? `<span>${note}</span>` : ''}${duree ? `<span>${duree}</span>` : ''}</div>
            ${c.formateur?.nom ? `<div style="font-size:.75rem;color:var(--gray);margin-top:5px">👤 ${c.formateur.nom}</div>` : ''}
          </div>
        </div>`;
    },

    /* Injection dans une grille existante */
    inject(gridId, cat) {
      const grid = document.getElementById(gridId) || document.querySelector('.courses-grid,.scene-courses-grid');
      if (!grid) return;
      const list = this.getAll(cat);
      if (!list.length) return;
      if (list.length)
        grid.insertAdjacentHTML('beforeend',
          `<div style="grid-column:1/-1;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:10px 16px;font-size:.78rem;color:var(--gold)">
            ✦ ${list.length} programme${list.length>1?'s':''} ajouté${list.length>1?'s':''} par l'administrateur
          </div>` + list.map(c => this.cardHTML(c)).join(''));
    }
  },

  /* ── Vidéos ── */
  Videos: {
    getAll(disc) {
      let l = DB.read(DB.VIDEOS);
      if (disc) l = l.filter(v => v.discipline === disc);
      return l;
    },
    add(v)     { return DB.add(DB.VIDEOS, { vues:0, estPublie:true, ...v }); },
    remove(id) { DB.remove(DB.VIDEOS, id); VideoDB.remove(id).catch(()=>{}); },

    /* Crée une card vidéo pour les pages catégorie */
    cardHTML(v, blobUrl) {
      const src  = blobUrl || v.videoPath || '';
      const icon = CAT_ICON[v.discipline] || '🎬';
      const thumb = v.thumbnailPath
        ? `<img src="${v.thumbnailPath}" style="width:100%;height:100%;object-fit:cover">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,#0d0d1a,#1a1040)">${icon}</div>`;
      return `
        <div class="course-card" data-local="1" data-video-src="${src}" data-title="${v.titre}" data-formateur="${v.formateur||''}" data-duree="${v.duree||''}">
          <div class="video-thumb" onclick="openVideoFromCard(this.closest('.course-card'))" style="min-height:160px;background:#0d0d1a">
            ${thumb}
            <div class="play-btn" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(201,168,76,0.85)"/>
                <polygon points="19,14 38,24 19,34" fill="#000"/>
              </svg>
            </div>
            ${v.duree ? `<div class="video-duration">${v.duree}</div>` : ''}
          </div>
          <div class="course-card-body">
            <span class="course-tag">${icon} ${CAT_LABEL[v.discipline]||v.discipline}</span>
            <div class="course-title">${v.titre}</div>
            <div class="course-desc">${(v.description||'').substring(0,100)}</div>
            ${v.formateur ? `<div style="font-size:.75rem;color:var(--gray);margin-top:5px">👤 ${v.formateur}</div>` : ''}
          </div>
        </div>`;
    },

    /* Injection async (récupère blob URLs depuis IndexedDB) */
    async inject(gridId, disc) {
      const grid = document.getElementById(gridId) || document.querySelector('.courses-grid,.scene-courses-grid');
      if (!grid) return;
      const list = this.getAll(disc);
      if (!list.length) return;
      const cards = await Promise.all(list.map(async v => {
        const blobUrl = v._local ? await VideoDB.blobUrl(v._id) : null;
        return this.cardHTML(v, blobUrl);
      }));
      grid.insertAdjacentHTML('beforeend',
        `<div style="grid-column:1/-1;background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.2);border-radius:10px;padding:10px 16px;font-size:.78rem;color:#3498db">
          🎬 ${list.length} vidéo${list.length>1?'s':''} ajoutée${list.length>1?'s':''} par l'administrateur
        </div>` + cards.join(''));
    }
  },

  /* ── Instituts ── */
  Instituts: {
    getAll(disc) {
      let l = DB.read(DB.INSTITUTS);
      if (disc) l = l.filter(i => i.discipline === disc || i.discipline === 'toutes');
      return l;
    },
    add(i)        { return DB.add(DB.INSTITUTS, i); },
    update(id, p) { return DB.update(DB.INSTITUTS, id, p); },
    remove(id)    { DB.remove(DB.INSTITUTS, id); },

    cardHTML(i) {
      const clr = { gold:'#c9a84c', purple:'#9b59b6', teal:'#1abc9c', blue:'#3498db', red:'#e74c3c', green:'#27ae60', orange:'#e67e22' }[i.couleur||'gold']||'#c9a84c';
      return `
        <div class="inst-card" data-local="1">
          <div class="inst-logo" style="background:${clr}22;border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">${i.icone||'🏛️'}</div>
          <div class="inst-info" style="flex:1;min-width:0">
            <strong style="display:block;font-size:.88rem">${i.nom}</strong>
            <span style="font-size:.75rem;color:var(--gray)">${i.ville}${i.wilaya&&i.wilaya!==i.ville?' · '+i.wilaya:''}${i.specialites?' · '+i.specialites:''}</span>
          </div>
          <span class="inst-badge" style="font-size:.65rem;font-weight:700;color:${clr};background:${clr}22;padding:2px 8px;border-radius:4px;white-space:nowrap">${i.type||'Partenaire'}</span>
        </div>`;
    },

    inject(gridId, disc) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      const list = this.getAll(disc);
      if (!list.length) return;
      grid.insertAdjacentHTML('beforeend', list.map(i => this.cardHTML(i)).join(''));
      /* Rendre la section visible si elle était cachée */
      const section = document.getElementById('institutesSection');
      if (section) section.style.display = '';
    }
  },

  /* ── Utilisateurs ── */
  Users: {
    getAll(role) {
      let l = DB.read(DB.USERS);
      if (role) l = l.filter(u => u.role === role);
      return l;
    },
    add(u)        { return DB.add(DB.USERS, { role:'etudiant', estVerifie:false, ...u }); },
    update(id, p) { return DB.update(DB.USERS, id, p); },
    remove(id)    { DB.remove(DB.USERS, id); }
  },

  /* ── Actualités ── */
  News: {
    getAll(type) {
      let l = DB.read(DB.NEWS);
      if (type) l = l.filter(n => n.type === type);
      return l;
    },
    add(n)        { return DB.add(DB.NEWS, { estPublie:true, ...n }); },
    update(id, p) { return DB.update(DB.NEWS, id, p); },
    remove(id)    { DB.remove(DB.NEWS, id); },

    cardHTML(n) {
      const typeColor = { Annonce:'#c9a84c', Événement:'#3498db', Article:'#27ae60', Offre:'#9b59b6' };
      const clr = typeColor[n.type] || '#c9a84c';
      const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR') : '';
      return `
        <div style="background:var(--dark-card);border:1px solid var(--dark-border);border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-size:.65rem;font-weight:700;letter-spacing:1.5px;color:${clr};background:${clr}18;padding:3px 9px;border-radius:5px;text-transform:uppercase">${n.type||'Article'}</span>
            ${n.discipline?`<span style="font-size:.65rem;color:rgba(255,255,255,.4)">${n.discipline}</span>`:''}
            <span style="font-size:.7rem;color:rgba(255,255,255,.3);margin-left:auto">${date}</span>
          </div>
          <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700">${n.titre}</div>
          ${n.image?`<img src="${n.image}" alt="${n.titre}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`:''}
          <div style="font-size:.84rem;color:var(--gray);line-height:1.65">${(n.contenu||'').substring(0,220)}${(n.contenu||'').length>220?'…':''}</div>
          ${n.contact?`<div style="font-size:.78rem;color:var(--gold)">📞 ${n.contact}</div>`:''}
        </div>`;
    }
  },

  /* ── Utilitaires ── */
  WILAYAS,
  CAT_ICON,
  CAT_LABEL,

  /* Génère le <select> wilaya */
  wilayaSelect(id, val) {
    const opts = WILAYAS.map(w => `<option value="${w}"${val===w?' selected':''}>${w}</option>`).join('');
    return `<select id="${id}" style="background:rgba(255,255,255,.05);border:1px solid var(--dark-border);border-radius:9px;padding:10px 13px;color:#fff;font-family:'Inter',sans-serif;font-size:.87rem;outline:none;width:100%">
      <option value="">— Choisir une wilaya —</option>${opts}</select>`;
  }
};
