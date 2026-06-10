# ProForm.COM — Backend API

## Configuration MongoDB Atlas

### 1. Créer un cluster MongoDB Atlas (gratuit)
1. Allez sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un **cluster gratuit** (M0 Free Tier)
4. Dans "Database Access" → ajoutez un utilisateur (username + password)
5. Dans "Network Access" → ajoutez votre IP (ou `0.0.0.0/0` pour tout autoriser)
6. Dans votre cluster → "Connect" → "Connect your application"
7. Copiez la connection string

### 2. Configurer le fichier .env
```
MONGO_URI=mongodb+srv://votreUsername:votrePassword@cluster0.xxxxx.mongodb.net/proform?retryWrites=true&w=majority
JWT_SECRET=votre_cle_secrete_unique
PORT=5000
```

## Installation

```bash
cd ART/backend
npm install
npm run dev   # développement avec nodemon
npm start     # production
```

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Créer un compte |
| POST | /api/auth/login | Se connecter |
| GET | /api/auth/me | Mon profil (JWT requis) |
| POST | /api/promotion | Soumettre candidature promotion |
| GET | /api/courses | Lister les cours |
| GET | /api/courses/search?q=terme | Recherche |
| GET | /api/courses/cat/scene | Cours par catégorie |
| GET | /api/courses/:id | Détail d'un cours |
| GET | /api/users/profile | Mon profil (JWT requis) |
| PUT | /api/users/profile | Modifier profil |
| POST | /api/users/enroll/:id | S'inscrire à un cours |
| GET | /api/health | Santé du serveur |

## Structure des dossiers

```
backend/
├── models/
│   ├── User.js          # Modèle utilisateur
│   ├── Course.js        # Modèle cours
│   └── Promotion.js     # Modèle candidature promotion
├── routes/
│   ├── auth.js          # Authentification
│   ├── courses.js       # Gestion des cours
│   ├── promotion.js     # Candidatures promotion
│   └── users.js         # Profils utilisateurs
├── middleware/
│   └── auth.js          # Middleware JWT
├── uploads/             # Fichiers uploadés (CV, travaux)
├── server.js            # Point d'entrée
├── .env                 # Variables d'environnement
└── package.json
```
