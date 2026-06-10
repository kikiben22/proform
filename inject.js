/* ============================================
   ProForm — Injection de contenu + Auth Gate
   ============================================ */

const API_URL = 'http://localhost:5000';

/* ── Fetch avec timeout manuel (supporte GET et POST) ── */
async function fetchWithTimeout(url, ms, options) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(url, options)
      .then(r => { clearTimeout(timer); resolve(r); })
      .catch(e => { clearTimeout(timer); reject(e); });
  });
}

/* ── Discipline de la page courante ── */
function pageDiscipline() {
  const p = location.pathname.toLowerCase();
  if (p.includes('scene'))         return 'scene';
  if (p.includes('cinema'))        return 'cinema';
  if (p.includes('art-plastique')) return 'art-plastique';
  if (p.includes('musique'))       return 'musique';
  return null;
}

/* ── Session utilisateur ── */
function getSessionUser() {
  try { return JSON.parse(localStorage.getItem('proform_user') || 'null'); }
  catch { return null; }
}
function isAdminSession() { return localStorage.getItem('proform_admin_ok') === '1'; }

/* ════════════════════════════════════════════
   AUTH GATE — Mur d'accès si non connecté/non approuvé
   ════════════════════════════════════════════ */
function showAuthGate(mode, user) {
  /* mode = 'login' | 'pending' */
  const gate = document.createElement('div');
  gate.id = 'artGate';
  gate.style.cssText = [
    'position:fixed','inset:0','background:rgba(5,5,10,0.97)',
    'z-index:9999','display:flex','align-items:center','justify-content:center',
    'padding:20px','backdrop-filter:blur(14px)'
  ].join(';');

  if (mode === 'pending') {
    gate.innerHTML = `
      <div style="background:#111;border:1px solid #2a2a2a;border-radius:20px;padding:48px 40px;max-width:440px;width:100%;text-align:center">
        <div style="font-size:3.5rem;margin-bottom:16px">⏳</div>
        <h2 style="font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:900;margin-bottom:12px">
          Compte en attente
        </h2>
        <p style="color:#888;line-height:1.7;margin-bottom:8px">
          Bonjour <strong style="color:#c9a84c">${user.prenom||''}${user.nom?' '+user.nom:''}</strong>,
          votre inscription est en cours de validation par l'administrateur.
        </p>
        <p style="color:#555;font-size:.83rem;margin-bottom:32px">
          Vous serez notifié(e) dès que votre compte sera approuvé.
        </p>
        <button onclick="checkApprovalStatus()" id="checkApprovalBtn"
          style="padding:12px 28px;background:linear-gradient(135deg,#c9a84c,#a07832);border:none;border-radius:10px;color:#000;font-size:.85rem;font-weight:700;cursor:pointer;margin-bottom:12px">
          🔄 Vérifier mon statut
        </button>
        <div id="checkApprovalMsg" style="font-size:.78rem;color:#888;margin-bottom:16px"></div>
        <a href="index.html" style="display:inline-block;padding:10px 24px;border:1px solid #2a2a2a;border-radius:10px;color:#888;font-size:.82rem;text-decoration:none">
          ← Retour à l'accueil
        </a>
        <button onclick="artGateLogout()" style="display:block;margin:14px auto 0;background:none;border:none;color:#444;font-size:.75rem;cursor:pointer;text-decoration:underline">
          Se déconnecter
        </button>
      </div>`;
  } else {
    /* mode = 'login' */
    gate.innerHTML = `
      <div style="background:#111;border:1px solid #2a2a2a;border-radius:20px;padding:48px 40px;max-width:440px;width:100%;text-align:center">
        <div style="font-size:1.5rem;font-family:'Playfair Display',serif;font-weight:900;margin-bottom:4px">
          PRO<span style="color:#c9a84c">FORM</span>
        </div>
        <div style="font-size:.65rem;font-weight:700;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;margin-bottom:24px">
          Contenu réservé aux membres
        </div>
        <div style="font-size:2.5rem;margin-bottom:12px">🔐</div>
        <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;margin-bottom:10px">
          Connexion requise
        </h2>
        <p style="color:#888;font-size:.88rem;line-height:1.6;margin-bottom:28px">
          Les formations, vidéos et instituts ProForm sont accessibles uniquement aux membres inscrits et approuvés.
        </p>
        <div id="gateErr" style="display:none;background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);border-radius:8px;padding:10px 14px;font-size:.8rem;color:#e74c3c;margin-bottom:14px;text-align:left"></div>
        <div style="text-align:left;margin-bottom:12px">
          <label style="font-size:.7rem;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Email</label>
          <input id="gateEmail" type="email" placeholder="votre@email.com"
            style="width:100%;background:rgba(255,255,255,.05);border:1px solid #2a2a2a;border-radius:9px;padding:11px 14px;color:#fff;font-size:.88rem;outline:none;box-sizing:border-box"
            onkeypress="if(event.key==='Enter')gateLogin()"/>
        </div>
        <div style="text-align:left;margin-bottom:20px">
          <label style="font-size:.7rem;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px">Mot de passe</label>
          <input id="gatePass" type="password" placeholder="••••••••"
            style="width:100%;background:rgba(255,255,255,.05);border:1px solid #2a2a2a;border-radius:9px;padding:11px 14px;color:#fff;font-size:.88rem;outline:none;box-sizing:border-box"
            onkeypress="if(event.key==='Enter')gateLogin()"/>
        </div>
        <button id="gateBtn" onclick="gateLogin()"
          style="width:100%;padding:13px;background:linear-gradient(135deg,#c9a84c,#a07832);border:none;border-radius:10px;color:#000;font-size:.9rem;font-weight:700;cursor:pointer;margin-bottom:18px">
          Se connecter →
        </button>
        <div style="font-size:.8rem;color:#555;margin-bottom:6px">Pas encore membre ?</div>
        <a href="index.html" style="display:inline-block;padding:10px 22px;border:1px solid rgba(201,168,76,.3);border-radius:9px;color:#c9a84c;font-size:.82rem;font-weight:600;text-decoration:none">
          ✦ S'inscrire sur ProForm
        </a>
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid #1a1a1a">
          <a href="admin.html" style="font-size:.72rem;color:#333;text-decoration:none">⚙️ Espace Admin</a>
        </div>
      </div>`;
  }

  document.body.appendChild(gate);
}

/* ── Login depuis la gate ── */
async function gateLogin() {
  const email = (document.getElementById('gateEmail')?.value || '').trim().toLowerCase();
  const pass  = (document.getElementById('gatePass')?.value  || '').trim();
  const errEl = document.getElementById('gateErr');
  const btn   = document.getElementById('gateBtn');
  if (!email || !pass) { errEl.textContent = '⚠️ Remplissez tous les champs.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }

  /* Admin bypass */
  if (email === 'admin@proform.com' && pass === 'Admin@2026') {
    localStorage.setItem('proform_admin_ok', '1');
    document.getElementById('artGate')?.remove();
    injectPageContent();
    return;
  }

  try {
    const r = await fetchWithTimeout(`${API_URL}/api/auth/login`, 5000, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Email ou mot de passe incorrect.');
    localStorage.setItem('proformToken', d.token);
    localStorage.setItem('proform_user', JSON.stringify(d.user));
    document.getElementById('artGate')?.remove();
    if (!d.user.estVerifie) {
      showAuthGate('pending', d.user);
    } else {
      injectPageContent();
    }
  } catch (err) {
    /* Offline — check localStorage users */
    const localUsers = (typeof DB !== 'undefined') ? DB.read(DB.USERS) : [];
    const found = localUsers.find(u => u.email?.toLowerCase() === email);
    if (found && found.password && found.password === pass) {
      localStorage.setItem('proform_user', JSON.stringify(found));
      document.getElementById('artGate')?.remove();
      if (!found.estVerifie) { showAuthGate('pending', found); }
      else { injectPageContent(); }
    } else {
      errEl.textContent = '❌ ' + (err.message || 'Serveur hors ligne. Vérifiez vos identifiants.');
      errEl.style.display = 'block';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Se connecter →'; }
  }
}

function artGateLogout() {
  localStorage.removeItem('proform_user');
  localStorage.removeItem('proformToken');
  location.reload();
}

async function checkApprovalStatus() {
  const btn = document.getElementById('checkApprovalBtn');
  const msg = document.getElementById('checkApprovalMsg');
  const token = localStorage.getItem('proformToken');
  if (!token) { if(msg) msg.textContent = 'Aucun compte connecté.'; return; }
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Vérification…'; }
  try {
    const r = await fetchWithTimeout(`${API_URL}/api/auth/me`, 5000, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message);
    localStorage.setItem('proform_user', JSON.stringify(d.user));
    if (d.user.estVerifie) {
      document.getElementById('artGate')?.remove();
      injectPageContent();
    } else {
      if (msg) msg.textContent = 'Votre compte est toujours en attente de validation.';
    }
  } catch {
    if (msg) msg.textContent = 'Serveur hors ligne. Réessayez plus tard.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Vérifier mon statut'; }
  }
}

/* ════════════════════════════════════════════
   Ouvrir la modal vidéo avec une source locale
   ════════════════════════════════════════════ */
function openVideoFromCard(card) {
  if (!card) return;
  const src   = card.dataset.videoSrc || '';
  const titre = card.dataset.title    || 'Vidéo';
  const modal  = document.getElementById('videoModal');
  const player = document.getElementById('videoPlayer');
  const noSrc  = document.getElementById('videoNoSrc');
  const titleEl= document.getElementById('modalTitle');
  if (!modal) return;
  if (titleEl) titleEl.textContent = titre;
  if (src && src !== '#' && src !== 'null') {
    if (player) { player.src = src; player.style.display = 'block'; player.load(); }
    if (noSrc)  noSrc.style.display = 'none';
  } else {
    if (player) player.style.display = 'none';
    if (noSrc)  noSrc.style.display  = 'flex';
  }
  modal.classList.add('show');
}

/* ── Données de démonstration (si localStorage vide) ── */
function seedDemoData() {
  const hasCourses = DB.read(DB.COURSES).length > 0;
  const hasInsts   = DB.read(DB.INSTITUTS).length > 0;
  if (hasCourses && hasInsts) return;

  if (!hasCourses) {
    [
      { titre:'Art du Théâtre — Débutant', categorie:'scene', sousCategorie:'performance',
        description:'Découvrez les fondamentaux du jeu d\'acteur, la présence scénique et l\'improvisation.',
        dureeHeures:24, niveaux:'debutant', formateur:{nom:'Karim Benaissa',titre:'Metteur en scène'},
        note:{moyenne:4.7,nombreAvis:234}, tags:['théâtre','débutant','scène'] },
      { titre:'Mise en Scène — Avancé', categorie:'scene', sousCategorie:'mise-en-scene',
        description:'Maîtrisez la direction d\'acteurs, la scénographie et la gestion du plateau.',
        dureeHeures:40, niveaux:'avance', formateur:{nom:'Samia Meziane',titre:'Directrice artistique'},
        note:{moyenne:4.9,nombreAvis:87}, tags:['mise en scène','avancé'] },
      { titre:'Réalisation Cinéma — Les Bases', categorie:'cinema', sousCategorie:'realisation',
        description:'Tout pour réaliser votre premier court-métrage : cadrage, lumière, montage.',
        dureeHeures:36, niveaux:'debutant', formateur:{nom:'Yacine Boudiaf',titre:'Réalisateur'},
        note:{moyenne:4.8,nombreAvis:198}, tags:['cinéma','réalisation'] },
      { titre:'Écriture de Scénario', categorie:'cinema', sousCategorie:'scenario',
        description:'Méthode Hollywood : structure en 3 actes, personnages mémorables, dialogues.',
        dureeHeures:28, niveaux:'intermediaire', formateur:{nom:'Rania Khalil',titre:'Scénariste'},
        note:{moyenne:4.7,nombreAvis:156}, tags:['scénario','cinéma'] },
      { titre:'Peinture Acrylique — Débutant', categorie:'art-plastique', sousCategorie:'peinture',
        description:'Initiez-vous à la peinture acrylique : couleurs, textures, style personnel.',
        dureeHeures:20, niveaux:'debutant', formateur:{nom:'Amina Hadj-Ali',titre:'Peintre'},
        note:{moyenne:4.8,nombreAvis:321}, tags:['peinture','acrylique'] },
      { titre:'Art Numérique — Procreate', categorie:'art-plastique', sousCategorie:'numerique',
        description:'Illustrations professionnelles sur iPad : brosses, calques, exportation.',
        dureeHeures:25, niveaux:'tous', formateur:{nom:'Sonia Brahim',titre:'Illustratrice digitale'},
        note:{moyenne:4.9,nombreAvis:267}, tags:['numérique','Procreate'] },
      { titre:'Guitare Acoustique — Débutant', categorie:'musique', sousCategorie:'guitare',
        description:'Apprenez la guitare de zéro : accords de base, rythmes, premières chansons.',
        dureeHeures:30, niveaux:'debutant', formateur:{nom:'Djamel Ferhat',titre:'Guitariste'},
        note:{moyenne:4.8,nombreAvis:445}, tags:['guitare','débutant'] },
      { titre:'Production Musicale — FL Studio', categorie:'musique', sousCategorie:'production',
        description:'Produisez vos beats et morceaux de A à Z : drums, synthés, mixage, mastering.',
        dureeHeures:40, niveaux:'tous', formateur:{nom:'Sofiane Belkadi',titre:'Beatmaker'},
        note:{moyenne:4.8,nombreAvis:203}, tags:['FL Studio','production'] }
    ].forEach(d => Store.Courses.add(d));
  }

  if (!hasInsts) {
    [
      { nom:'Institut National des Arts Dramatiques', ville:'Alger', wilaya:'16 - Alger',
        discipline:'scene', type:'Officiel', icone:'🎭', couleur:'gold', specialites:'Théâtre, Scénographie' },
      { nom:'Conservatoire National d\'Art Dramatique', ville:'Oran', wilaya:'31 - Oran',
        discipline:'scene', type:'Certifié', icone:'🎭', couleur:'purple', specialites:'Jeu d\'acteur, Mise en scène' },
      { nom:'Institut National du Cinéma (INCA)', ville:'Alger', wilaya:'16 - Alger',
        discipline:'cinema', type:'Officiel', icone:'🎬', couleur:'teal', specialites:'Réalisation, Scénario, Production' },
      { nom:'Académie du Cinéma Méditerranéen', ville:'Constantine', wilaya:'25 - Constantine',
        discipline:'cinema', type:'Certifié', icone:'🎬', couleur:'blue', specialites:'Coproductions, Documentaire' },
      { nom:'École des Beaux-Arts d\'Alger', ville:'Alger', wilaya:'16 - Alger',
        discipline:'art-plastique', type:'Officiel', icone:'🎨', couleur:'red', specialites:'Peinture, Sculpture, Design' },
      { nom:'Digital Arts Academy', ville:'Oran', wilaya:'31 - Oran',
        discipline:'art-plastique', type:'Partenaire', icone:'🎨', couleur:'orange', specialites:'Art numérique, Illustration' },
      { nom:'Conservatoire d\'Oran', ville:'Oran', wilaya:'31 - Oran',
        discipline:'musique', type:'Officiel', icone:'🎵', couleur:'gold', specialites:'Guitare, Piano, Chant' },
      { nom:'Académie de Musique d\'Alger', ville:'Alger', wilaya:'16 - Alger',
        discipline:'musique', type:'Certifié', icone:'🎵', couleur:'purple', specialites:'Composition, Production' }
    ].forEach(i => Store.Instituts.add(i));
  }
}

/* ── Injecter cours dans la grille ── */
function injectCourses(courses, grid) {
  if (!courses.length || !grid) return;
  grid.insertAdjacentHTML('beforeend',
    `<div style="grid-column:1/-1;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:10px 16px;font-size:.78rem;color:var(--gold)">
      ✦ ${courses.length} programme${courses.length > 1 ? 's' : ''} disponible${courses.length > 1 ? 's' : ''}
    </div>` + courses.map(c => Store.Courses.cardHTML(c)).join(''));
}

/* ── Injecter vidéos dans la grille ── */
async function injectVideos(videos, grid) {
  if (!videos.length || !grid) return;
  const cards = await Promise.all(videos.map(async v => {
    const blobUrl = v._local ? await VideoDB.blobUrl(v._id) : null;
    return Store.Videos.cardHTML(v, blobUrl);
  }));
  grid.insertAdjacentHTML('beforeend',
    `<div style="grid-column:1/-1;background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.2);border-radius:10px;padding:10px 16px;font-size:.78rem;color:#3498db">
      🎬 ${videos.length} vidéo${videos.length > 1 ? 's' : ''} disponible${videos.length > 1 ? 's' : ''}
    </div>` + cards.join(''));
}

/* ── Injecter instituts ── */
function injectInstituts(insts) {
  const grid = document.getElementById('institutesGrid');
  if (!grid || !insts.length) return;
  grid.insertAdjacentHTML('beforeend', insts.map(i => Store.Instituts.cardHTML(i)).join(''));
  const section = document.getElementById('institutesSection');
  if (section) section.style.display = '';
}

/* ════════════════════════════════════════════
   INJECTION CONTENU (pour utilisateurs connectés)
   ════════════════════════════════════════════ */
async function injectPageContent() {
  /* store.js auto-seeds demo data on load — nothing to do here */

  const disc = pageDiscipline();
  const grid = document.getElementById('coursesGrid') ||
               document.querySelector('.scene-courses-grid') ||
               document.querySelector('.courses-grid');

  let apiCourses = [], apiVideos = [], apiInsts = [];

  try {
    const r = await fetchWithTimeout(
      disc ? `${API_URL}/api/courses?categorie=${disc}&limit=30` : `${API_URL}/api/courses?limit=30`,
      3000
    );
    if (r.ok) { const d = await r.json(); apiCourses = d.courses || []; }
  } catch {}

  try {
    const r = await fetchWithTimeout(
      disc ? `${API_URL}/api/videos?discipline=${disc}` : `${API_URL}/api/videos`,
      3000
    );
    if (r.ok) { const d = await r.json(); apiVideos = d.videos || []; }
  } catch {}

  try {
    const r = await fetchWithTimeout(
      disc ? `${API_URL}/api/instituts?discipline=${disc}` : `${API_URL}/api/instituts`,
      3000
    );
    if (r.ok) { const d = await r.json(); apiInsts = d.instituts || []; }
  } catch {}

  const apiCIds = new Set(apiCourses.map(c => c._id));
  const apiVIds = new Set(apiVideos.map(v => v._id));
  const apiIIds = new Set(apiInsts.map(i => i._id));

  const localCourses = Store.Courses.getAll(disc).filter(c => !apiCIds.has(c._id));
  const localVideos  = Store.Videos.getAll(disc).filter(v  => !apiVIds.has(v._id));
  const localInsts   = Store.Instituts.getAll(disc).filter(i => !apiIIds.has(i._id));

  if (apiCourses.length && grid) {
    grid.innerHTML = apiCourses.map(c => Store.Courses.cardHTML(c)).join('');
  }
  injectCourses(localCourses, grid);
  await injectVideos(localVideos, grid);
  injectInstituts([...apiInsts, ...localInsts]);
}

/* ════════════════════════════════════════════
   POINT D'ENTRÉE — Vérifie l'auth puis injecte
   ════════════════════════════════════════════ */
function init() {
  /* Admin bypass */
  if (isAdminSession()) { injectPageContent(); return; }

  const user = getSessionUser();

  if (!user) {
    showAuthGate('login', null);
    return;
  }

  if (!user.estVerifie) {
    showAuthGate('pending', user);
    return;
  }

  /* Utilisateur connecté et approuvé */
  injectPageContent();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
