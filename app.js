/* ============================================
   ProForm.COM - Frontend JavaScript
   Connects to Node.js / MongoDB Atlas API
   ============================================ */

// API Base URL — change this to your deployed server URL in production
const API_BASE = 'http://localhost:5000/api';

/* ======== TOAST NOTIFICATIONS ======== */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');

  if (!toast) return;

  icon.textContent = type === 'success' ? '✓' : '✕';
  msgEl.textContent = msg;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ======== PASSWORD STRENGTH ======== */
function checkPasswordStrength(password) {
  const bars = ['bar1','bar2','bar3','bar4'];
  const label = document.getElementById('strengthLabel');
  if (!label) return;

  bars.forEach(id => {
    const bar = document.getElementById(id);
    if (bar) { bar.className = 'strength-bar'; }
  });

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ['', 'weak', 'medium', 'medium', 'strong'];
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  const colors = ['', '#E74C3C', '#F39C12', '#F39C12', '#27AE60'];

  for (let i = 0; i < score; i++) {
    const bar = document.getElementById(bars[i]);
    if (bar) bar.classList.add(levels[score]);
  }

  label.textContent = password.length ? labels[score] : '';
  label.style.color = colors[score];
}

/* ======== PASSWORD TOGGLE ======== */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

/* ======== FORM VALIDATION ======== */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9\s\-+]{7,15}$/.test(phone);
}

/* ======== REGISTER — calls MongoDB API ======== */
async function handleRegister(e) {
  e.preventDefault();

  const nom = document.getElementById('nom')?.value.trim();
  const prenom = document.getElementById('prenom')?.value.trim();
  const phoneCode = document.getElementById('phoneCode')?.value;
  const phone = document.getElementById('phone')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const role       = document.getElementById('role')?.value || 'etudiant';
  const discipline = document.getElementById('discipline')?.value || '';
  const password   = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  const terms = document.getElementById('terms')?.checked;

  // Validation
  if (!nom || !prenom || !phone || !email || !password || !confirmPassword) {
    showToast('Veuillez remplir tous les champs obligatoires.', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showToast('Adresse email invalide.', 'error');
    return;
  }
  if (!validatePhone(phone)) {
    showToast('Numéro de téléphone invalide.', 'error');
    return;
  }
  if (password.length < 8) {
    showToast('Le mot de passe doit comporter au moins 8 caractères.', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Les mots de passe ne correspondent pas.', 'error');
    return;
  }
  if (!terms) {
    showToast('Veuillez accepter les conditions d\'utilisation.', 'error');
    return;
  }

  const submitBtn = document.querySelector('#registerForm [type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Inscription en cours...';
  }

  try {
    const cvFile = document.getElementById('cvFile')?.files[0];
    const fd = new FormData();
    fd.append('nom',       nom);
    fd.append('prenom',    prenom);
    fd.append('telephone', phoneCode + phone);
    fd.append('email',     email);
    fd.append('role',      role);
    fd.append('discipline',discipline);
    fd.append('password',  password);
    if (cvFile) fd.append('cv', cvFile);

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: fd   // pas de Content-Type header — le navigateur met multipart/form-data automatiquement
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Compte créé ! En attente de validation par l\'administrateur.', 'success');
      if (data.token) localStorage.setItem('proformToken', data.token);
      if (data.user)  localStorage.setItem('proform_user', JSON.stringify(data.user));
      setTimeout(() => { window.location.href = 'formation.html'; }, 2000);
    } else {
      showToast(data.message || 'Une erreur s\'est produite.', 'error');
    }
  } catch (err) {
    // Fallback localStorage
    if (typeof Store !== 'undefined') {
      const u = Store.Users.add({ nom, prenom, telephone: (document.getElementById('phoneCode')?.value || '') + phone, email, role: 'etudiant', estVerifie: false });
      localStorage.setItem('proform_user', JSON.stringify(u));
    }
    showToast('Compte créé ! En attente de validation par l\'administrateur.', 'success');
    setTimeout(() => { window.location.href = 'formation.html'; }, 2000);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '✦ S\'inscrire sur ProForm';
    }
  }
}

/* ======== LOGIN MODAL ======== */
function openLoginModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('loginModal');
  if (modal) { modal.style.display = 'flex'; }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) { modal.style.display = 'none'; }
  const err = document.getElementById('loginModalErr');
  if (err) err.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLoginModal();
});

/* ======== LOGIN ======== */
async function handleLogin(e) {
  e.preventDefault();

  const email    = (document.getElementById('loginEmail')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('loginPassword')?.value || '').trim();
  const errEl    = document.getElementById('loginModalErr');
  const btn      = document.getElementById('loginSubmitBtn');

  function showErr(msg) {
    if (errEl) { errEl.innerHTML = msg; errEl.style.display = 'block'; }
  }

  if (errEl) errEl.style.display = 'none';
  if (!email || !password) { showErr('Veuillez remplir tous les champs.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Connexion...'; }

  /* ─── Vérification admin locale (marche même sans serveur) ─── */
  const isAdmin = email === 'admin@proform.com' && password === 'Admin@2026';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.token) localStorage.setItem('proformToken', data.token);
      if (data.user)  localStorage.setItem('proform_user', JSON.stringify(data.user));
      if (data.user?.role === 'admin') {
        localStorage.setItem('proform_admin_ok', '1');
        localStorage.setItem('proform_admin_token', data.token);
      }
      closeLoginModal();
      showToast('Bienvenue ' + (data.user?.prenom || data.user?.nom || '') + ' !', 'success');
      setTimeout(() => {
        if (data.user?.role === 'admin') { window.location.href = 'admin.html'; return; }
        window.location.href = 'mesformations.html';
      }, 1000);
    } else {
      showErr(data.message || 'Email ou mot de passe incorrect.');
    }

  } catch (_) {
    /* Serveur hors ligne — accès admin local */
    if (isAdmin) {
      localStorage.setItem('proform_admin_ok', '1');
      closeLoginModal();
      showToast('Connexion admin réussie !', 'success');
      setTimeout(() => { window.location.href = 'admin.html'; }, 800);
    } else {
      showErr(
        'Serveur hors ligne. ' +
        '<br>Si vous êtes admin : <a href="admin.html" style="color:#c9a84c;font-weight:700;">Accéder directement →</a>'
      );
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Se connecter →'; }
  }
}

/* ======== SMOOTH SCROLL ======== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ======== NAVBAR SCROLL EFFECT ======== */
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 20) {
      navbar.style.borderBottomColor = 'rgba(201,168,76,0.2)';
    } else {
      navbar.style.borderBottomColor = 'var(--dark-border)';
    }
  }
});

/* ======== ANIMATE ON SCROLL ======== */
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.course-card, .inst-card, .testimonial-card, .cat-card, .stat-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
