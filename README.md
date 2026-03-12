# 💣 Bomberman - Jeu Multijoueur en Ligne

Une application web Bomberman multijoueur construite avec Node.js, Express, React et Socket.io.

## 🎮 Caractéristiques

- **Jeu en ligne multijoueur** : Jusqu'à 6 joueurs par partie
- **Rendu 2D en temps réel** : Canvas HTML5 pour un gameplay fluide
- **Communication en temps réel** : WebSockets avec Socket.io
- **Dynamique de jeu complète** :
  - Placement de bombes
  - Destruction de briques
  - Explosions multi-directionnelles
  - Détection de collision
  - Système de victoire (dernier joueur vivant)

## 🛠️ Stack Technique

### Backend
- **Node.js & Express** : Serveur web et gestion des routes
- **Socket.io** : Communication bidirectionnelle en temps réel
- **UUID** : Génération d'IDs uniques

### Frontend
- **React** : Interface utilisateur interactive
- **Socket.io Client** : Connexion au serveur en temps réel
- **Canvas API** : Rendu du jeu 2D

## 📋 Requirements

- Node.js 14+
- npm ou yarn

## 🚀 Installation

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur s'exécutera sur `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm start
```

L'application s'ouvrira sur `http://localhost:3000`

## 🎮 Comment Jouer

1. Allez à `http://localhost:3000`
2. Entrez votre pseudonyme
3. Attendez d'autres joueurs (jusqu'à 6)
4. Le jeu commencera automatiquement quand il y a au moins 1 joueur
5. **Contrôles** :
   - **↑ ↓ ← →** : Déplacement
   - **ESPACE** : Placer une bombe

## 🎯 Objectif

Être le dernier joueur vivant sur la map ! 

- Posez des bombes pour détruire des briques et éliminer vos adversaires
- Évitez les explosions
- Les briques cachent parfois des pièges

## 🏗️ Structure du Projet

```
Bomber/
├── backend/
│   ├── server.js          # Serveur principal
│   └── package.json       # Dépendances backend
│
└── frontend/
    ├── public/
    │   └── index.html     # HTML principal
    ├── src/
    │   ├── App.js         # Composant principal
    │   ├── App.css        # Styles globaux
    │   ├── index.js       # Point d'entrée React
    │   ├── index.css      # Styles root
    │   └── components/
    │       ├── JoinScreen.js       # Écran de connexion
    │       ├── GameScreen.js       # Écran de jeu
    │       └── GameCanvas.js       # Rendu du jeu 2D
    └── package.json       # Dépendances frontend
```

## 🔧 Configuration

### Variables d'environnement Backend

Créez un fichier `.env` dans le dossier `backend` :

```env
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Variables d'environnement Frontend

Créez un fichier `.env` dans le dossier `frontend` :

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🎨 Personnages

6 personnages différents (emojis) à choisir aléatoirement :
- 😱 Peur
- 🎮 Gamer
- 👾 Alien
- 🤖 Robot
- 👽 Créature
- 🎯 Cible

## 📊 Configuration du Jeu

- **Map** : 13x13 tuiles
- **Max Joueurs** : 6 par partie
- **Timer Bombe** : 3 secondes avant explosion
- **Durée Explosion** : 500ms
- **Portée Bombe** : 1 tuile initialement

## 🐛 Dépannage

### La connexion WebSocket échoue
- Vérifiez que le serveur backend s'exécute sur le port 5000
- Vérifiez l'URL du serveur dans les variables d'environnement

### Les joueurs n'apparaissent pas
- Rechargez la page
- Vérifiez la connection Socket.io dans la console du navigateur

## 🚀 Développement Futur

- [ ] Système de power-ups (vitesse, portée bombe, bombes multiples)
- [ ] Différents types de briques (destructibles/indestructibles)
- [ ] Système de classement et statistiques
- [ ] Skins et thèmes personnalisables
- [ ] Son et musique de fond

---

## ☁️ Déployement sur Render.com (GRATUIT)

Votre jeu peut être hébergé gratuitement sur le web pour que vos amis y jouent de n'importe où!

### 🚀 Démarrage Rapide (5 min)

1. **Créez un compte Render** : [render.com](https://render.com)
2. **Poussez votre code sur GitHub**
3. **Connectez Render au repo**
4. **Voilà!** Votre jeu est en ligne

### 📚 Guides Complets

**CHOISISSEZ VOTRE GUIDE :**

| Document | Durée | Pour Qui |
|----------|-------|----------|
| [**DEPLOYMENT_INDEX.md**](./DEPLOYMENT_INDEX.md) | 5 min | **COMMENCEZ ICI!** Choix du guide |
| [**QUICK_DEPLOY.md**](./QUICK_DEPLOY.md) | 10 min | Pressé - Checklist rapide |
| [**GITHUB_RENDER_GUIDE.md**](./GITHUB_RENDER_GUIDE.md) | 30 min | Complet - Tous les détails |
| [**DEPLOYMENT.md**](./DEPLOYMENT.md) | 20 min | Step-by-step - Actions concrètes |
| [**TEST_GUIDE.md**](./TEST_GUIDE.md) | 15 min | Avant/Après - Comment tester |

### ⚡ TL;DR (Très Pressé)

```bash
# 1. Créer repo GitHub et pousser code
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/USER/bomberman-game.git
git push -u origin main

# 2. Sur Render.com
# → Connecter GitHub
# → Créer 2 services (backend + frontend)
# → Attendre 5 min

# 3. Partager l'URL avec amis
# → Vos amis jouent directement! 🎮
```

### 📱 Accès Après Déploiement

```
https://bomberman-frontend.onrender.com

✅ Accessible depuis n'importe quel appareil
✅ Pas d'installation requise
✅ Multiplayer complètement
✅ GRATUIT!
```

---
- [ ] Animations fluides
- [ ] Mobile-friendly

## 📝 License

MIT

## 👨‍💻 Auteur

Bomberman Multiplayer 2026
