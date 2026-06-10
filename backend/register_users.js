/**
 * Script d'inscription automatique des utilisateurs démo via l'API REST
 * Simule exactement le formulaire d'inscription du site
 */
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000';

const USERS = [
  /* 20 Étudiants */
  { nom:'Benali',     prenom:'Yacine',   email:'yacine.benali@etud.dz',     telephone:'+213550001001', role:'etudiant',  discipline:'Théâtre',       password:'Etud2026!' },
  { nom:'Meziani',    prenom:'Sara',     email:'sara.meziani@etud.dz',      telephone:'+213550001002', role:'etudiant',  discipline:'Cinéma',        password:'Etud2026!' },
  { nom:'Hadj',       prenom:'Karim',    email:'karim.hadj@etud.dz',        telephone:'+213550001003', role:'etudiant',  discipline:'Art Plastique', password:'Etud2026!' },
  { nom:'Boukhors',   prenom:'Amina',    email:'amina.boukhors@etud.dz',    telephone:'+213550001004', role:'etudiant',  discipline:'Musique',       password:'Etud2026!' },
  { nom:'Kaci',       prenom:'Lamine',   email:'lamine.kaci@etud.dz',       telephone:'+213550001005', role:'etudiant',  discipline:'Théâtre',       password:'Etud2026!' },
  { nom:'Ferhat',     prenom:'Nadia',    email:'nadia.ferhat@etud.dz',      telephone:'+213550001006', role:'etudiant',  discipline:'Musique',       password:'Etud2026!' },
  { nom:'Zerrouki',   prenom:'Anis',     email:'anis.zerrouki@etud.dz',     telephone:'+213550001007', role:'etudiant',  discipline:'Cinéma',        password:'Etud2026!' },
  { nom:'Brahim',     prenom:'Dalila',   email:'dalila.brahim@etud.dz',     telephone:'+213550001008', role:'etudiant',  discipline:'Art Plastique', password:'Etud2026!' },
  { nom:'Ait',        prenom:'Omar',     email:'omar.ait@etud.dz',          telephone:'+213550001009', role:'etudiant',  discipline:'Musique',       password:'Etud2026!' },
  { nom:'Mansouri',   prenom:'Rania',    email:'rania.mansouri@etud.dz',    telephone:'+213550001010', role:'etudiant',  discipline:'Théâtre',       password:'Etud2026!' },
  { nom:'Djaafri',    prenom:'Nour',     email:'nour.djaafri@etud.dz',      telephone:'+213550001011', role:'etudiant',  discipline:'Art Plastique', password:'Etud2026!' },
  { nom:'Belabbas',   prenom:'Mohamed',  email:'med.belabbas@etud.dz',      telephone:'+213550001012', role:'etudiant',  discipline:'Cinéma',        password:'Etud2026!' },
  { nom:'Saidi',      prenom:'Fatima',   email:'fatima.saidi@etud.dz',      telephone:'+213550001013', role:'etudiant',  discipline:'Musique',       password:'Etud2026!' },
  { nom:'Lounis',     prenom:'Bilal',    email:'bilal.lounis@etud.dz',      telephone:'+213550001014', role:'etudiant',  discipline:'Théâtre',       password:'Etud2026!' },
  { nom:'Tahir',      prenom:'Sonia',    email:'sonia.tahir@etud.dz',       telephone:'+213550001015', role:'etudiant',  discipline:'Art Plastique', password:'Etud2026!' },
  { nom:'Chouaib',    prenom:'Ismail',   email:'ismail.chouaib@etud.dz',    telephone:'+213550001016', role:'etudiant',  discipline:'Cinéma',        password:'Etud2026!' },
  { nom:'Benzehra',   prenom:'Lamia',    email:'lamia.benzehra@etud.dz',    telephone:'+213550001017', role:'etudiant',  discipline:'Musique',       password:'Etud2026!' },
  { nom:'Mesbahi',    prenom:'Tarek',    email:'tarek.mesbahi@etud.dz',     telephone:'+213550001018', role:'etudiant',  discipline:'Théâtre',       password:'Etud2026!' },
  { nom:'Aouali',     prenom:'Imane',    email:'imane.aouali@etud.dz',      telephone:'+213550001019', role:'etudiant',  discipline:'Art Plastique', password:'Etud2026!' },
  { nom:'Boufara',    prenom:'Zakaria',  email:'zakaria.boufara@etud.dz',   telephone:'+213550001020', role:'etudiant',  discipline:'Cinéma',        password:'Etud2026!' },
  /* 4 Artistes */
  { nom:'Berber',     prenom:'Sofiane',  email:'sofiane.berber@art.dz',     telephone:'+213661002001', role:'artiste',   discipline:'Art Plastique', password:'Art2026!!' },
  { nom:'Larbi',      prenom:'Yasmine',  email:'yasmine.larbi@art.dz',      telephone:'+213661002002', role:'artiste',   discipline:'Musique',       password:'Art2026!!' },
  { nom:'Allou',      prenom:'Rachid',   email:'rachid.allou@art.dz',       telephone:'+213661002003', role:'artiste',   discipline:'Cinéma',        password:'Art2026!!' },
  { nom:'Makhlouf',   prenom:'Ibtissam', email:'ibtissam.makhlouf@art.dz',  telephone:'+213661002004', role:'artiste',   discipline:'Théâtre',       password:'Art2026!!' },
  /* 8 Formateurs */
  { nom:'Benaissa',   prenom:'Karim',    email:'karim.benaissa@form.dz',    telephone:'+213770003001', role:'formateur', discipline:'Théâtre',       password:'Form2026!' },
  { nom:'Boudiaf',    prenom:'Yacine',   email:'yacine.boudiaf@form.dz',    telephone:'+213770003002', role:'formateur', discipline:'Cinéma',        password:'Form2026!' },
  { nom:'Hadj-Ali',   prenom:'Amina',    email:'amina.hadjali@form.dz',     telephone:'+213770003003', role:'formateur', discipline:'Art Plastique', password:'Form2026!' },
  { nom:'Ferhat',     prenom:'Djamel',   email:'djamel.ferhat@form.dz',     telephone:'+213770003004', role:'formateur', discipline:'Musique',       password:'Form2026!' },
  { nom:'Cherifi',    prenom:'Nadia',    email:'nadia.cherifi@form.dz',     telephone:'+213770003005', role:'formateur', discipline:'Musique',       password:'Form2026!' },
  { nom:'Laib',       prenom:'Sami',     email:'sami.laib@form.dz',         telephone:'+213770003006', role:'formateur', discipline:'Cinéma',        password:'Form2026!' },
  { nom:'Zerrouki',   prenom:'Amine',    email:'amine.zerrouki@form.dz',    telephone:'+213770003007', role:'formateur', discipline:'Théâtre',       password:'Form2026!' },
  { nom:'Benmerabet', prenom:'Khaled',   email:'khaled.benmerabet@form.dz', telephone:'+213770003008', role:'formateur', discipline:'Musique',       password:'Form2026!' },
];

function postJSON(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = http.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Inscription des utilisateurs via API /api/auth/register\n');
  let ok = 0, skip = 0, err = 0;

  for (const u of USERS) {
    try {
      const res = await postJSON('/api/auth/register', u);
      if (res.status === 201) {
        console.log(`  ✅ ${u.prenom} ${u.nom} (${u.role})`);
        ok++;
      } else if (res.status === 400 && JSON.stringify(res.body).includes('existe')) {
        console.log(`  ⚠️  ${u.prenom} ${u.nom} — déjà inscrit`);
        skip++;
      } else {
        console.log(`  ❌ ${u.prenom} ${u.nom} — ${res.status}: ${JSON.stringify(res.body)}`);
        err++;
      }
    } catch (e) {
      console.log(`  ❌ ${u.prenom} ${u.nom} — Erreur réseau: ${e.message}`);
      err++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Inscrits : ${ok}  |  ⚠️  Déjà présents : ${skip}  |  ❌ Erreurs : ${err}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main();
