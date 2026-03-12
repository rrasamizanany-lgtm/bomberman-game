# 📚 Guide Complet GitHub + Render Déploiement

## 🎯 **Objectif**

Transformer votre jeu Bomberman local en **application web accessible depuis n'importe où**.

---

## 📋 **Prérequis**

- ✅ Compte GitHub (créer sur [github.com](https://github.com))
- ✅ Compte Render (créer sur [render.com](https://render.com))
- ✅ Git installé ([git-scm.com](https://git-scm.com))
- ✅ Code Bomberman prêt (vous l'avez!)

---

## 🔧 **ÉTAPE 1: Préparer le Code Localement**

### 1.1 - Initialiser Git

```bash
# Aller dans le dossier du projet
cd C:\Project\Bomber

# Initialiser git
git init

# Configurer votre identité
git config user.email "votre.email@gmail.com"
git config user.name "Votre Nom"

# Vérifier la configuration
git config --list
```

### 1.2 - Préparer les Fichiers

Assurez-vous que ces fichiers existent (✅ déjà créés):
- ✅ `render.yaml` (configuration automatique)
- ✅ `.gitignore` (quels fichiers ignorer)
- ✅ `backend/.env.production` (config prod backend)
- ✅ `frontend/.env.production` (config prod frontend)
- ✅ `backend/.env` (config dev backend)
- ✅ `frontend/.env.local` (config dev frontend)

### 1.3 - Premier Commit

```bash
# Voir les fichiers non suivis
git status

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit: Bomberman multiplayer game"

# Vérifier le résultat
git log
```

---

## 🌐 **ÉTAPE 2: Créer le Dépôt GitHub**

### 2.1 - Sur GitHub.com

1. Allez sur [github.com/new](https://github.com/new)
2. Remplissez:
   - **Repository name**: `bomberman-game`
   - **Description**: `Multiplayer Bomberman game with React and Node.js`
   - **Public** (pour que Render puisse accéder)
   - **Ne cochez PAS "Initialize with README"**
3. Cliquez **"Create repository"**

### 2.2 - Connecter le Dépôt Local

GitHub affichera des commandes. Exécutez:

```bash
# Ajouter GitHub comme "remote"
git remote add origin https://github.com/VOTRE_USERNAME/bomberman-game.git

# Renommer la branche principale
git branch -M main

# Pousser le code
git push -u origin main
```

**Remplacez `VOTRE_USERNAME`** par votre nom d'utilisateur GitHub!

### 2.3 - Vérifier le Résultat

Allez sur [github.com/VOTRE_USERNAME/bomberman-game](https://github.com/VOTRE_USERNAME/bomberman-game)

Vous devriez voir tous vos fichiers! ✅

---

## 🚀 **ÉTAPE 3: Déployer sur Render.com**

### 3.1 - Option A: Via Interface Web (Plus Simple)

1. **Créer le Backend:**
   - Allez sur [render.com](https://render.com)
   - Connectez-vous (Sign In → GitHub)
   - Cliquez "New +" → **"Web Service"**
   - Sélectionnez `bomberman-game`
   - Configurez:
     ```
     Name: bomberman-backend
     Root Directory: backend
     Build Command: npm install
     Start Command: npm start
     Environment: Node
     Plan: Free
     
     Environment Variables:
     NODE_ENV = production
     PORT = 5000
     CLIENT_URL = https://bomberman-frontend.onrender.com
     ```
   - Cliquez **"Create Web Service"**
   - Attendez le déploiement (2-3 min)
   - Notez l'URL: `https://bomberman-backend.onrender.com`

2. **Créer le Frontend:**
   - Cliquez "New +" → **"Web Service"**
   - Sélectionnez `bomberman-game`
   - Configurez:
     ```
     Name: bomberman-frontend
     Root Directory: frontend
     Build Command: npm install && npm run build
     Start Command: npx serve -s build -l 3000
     Environment: Node
     Plan: Free
     
     Environment Variables:
     REACT_APP_SERVER_URL = https://bomberman-backend.onrender.com
     ```
   - Cliquez **"Create Web Service"**
   - Attendez le déploiement (5 min)
   - Notez l'URL: `https://bomberman-frontend.onrender.com`

### 3.2 - Option B: Automatique avec render.yaml

1. **Sur Render Dashboard:**
   - Cliquez "New +" → **"Infrastructure from Code"**
   - Sélectionnez `bomberman-game`
   - **Render détecte automatiquement `render.yaml`**
   - Cliquez **"Deploy"**

**Deux services se déploient automatiquement!** ✅

---

## ✅ **ÉTAPE 4: Tester le Déploiement**

### 4.1 - Vérifier les Services

Sur votre **Render Dashboard**:
- [ ] `bomberman-backend` doit être **"Live"** (vert)
- [ ] `bomberman-frontend` doit être **"Live"** (vert)

### 4.2 - Tester Localement (Même Ordinateur)

```
Dans 2 onglets du navigateur:
1. https://bomberman-frontend.onrender.com
2. https://bomberman-frontend.onrender.com

Entrez 2 pseudos différents
Attendez 10 secondes
JOUEZ ENSEMBLE! 🎮
```

### 4.3 - Tester Depuis un Autre Appareil

Depuis un **téléphone ou autre ordinateur** sur le **même réseau**:
```
https://bomberman-frontend.onrender.com
```

**C'est tout!** Pas besoin de configuration supplémentaire! ✅

---

## 🔄 **ÉTAPE 5: Mettre à Jour le Code**

### 5.1 - Modification Locale

```bash
# Faire vos modifications
# ... éditez les fichiers ...

# Vérifier les changements
git status

# Ajouter les changements
git add .

# Créer un commit
git commit -m "Nouvelle feature: ..."

# Pousser sur GitHub
git push origin main
```

### 5.2 - Redéploiement Automatique

**Render webhook automatique:**
- Quand vous faites `git push`
- Render détecte le changement
- Redéploie automatiquement!
- Vous recevez un email de confirmation

**Durée:** 2-5 minutes ⏱️

---

## 📊 **Architecture Finale**

```
┌─────────────────┐
│    GitHub       │
│  (votre code)   │
└────────┬────────┘
         │ git push
         ↓
┌──────────────────────────┐
│     Render Deploy         │
├──────────────────────────┤
│ bomberman-backend:5000   │ ← https://bomberman-backend.onrender.com
│ (Node.js + Express)      │
├──────────────────────────┤
│ bomberman-frontend:3000  │ ← https://bomberman-frontend.onrender.com
│ (React App)              │
└──────────────────────────┘
         ↑
         │ accès web
    ┌────┴────┐
    │          │
┌───┴──┐  ┌───┴──┐
│PC 1  │  │Phone │
│Alice │  │ Bob  │
└──────┘  └──────┘
```

---

## 🎯 **Résumé des URLs**

| Service | URL | Accès |
|---------|-----|-------|
| **Frontend** | `https://bomberman-frontend.onrender.com` | N'importe où |
| **Backend** | `https://bomberman-backend.onrender.com` | Interne |
| **Repo Code** | `https://github.com/VOTRE/bomberman-game` | Voir source |

---

## ⚠️ **Limitation Plan Gratuit**

- **Arrêt après 15 min d'inactivité**: Redémarre au prochain accès
- **RAM limitée (0.5 GB)**: Suffisant pour vous
- **Bande passante**: 100 GB/mois (largement suffisant)

**Pour toujours l'avoir actif:**
- Upgrade à $7/mois (Web Service Pro)
- Ou jouer régulièrement (garder actif)

---

## 🆘 **Dépannage Courant**

### "Erreur: fatal: not a git repository"
```bash
cd C:\Project\Bomber
git init
git add .
git commit -m "Initial"
```

### "Impossible de connecter à GitHub"
- Vérifiez votre connexion internet
- Vérifiez que Git est installé: `git --version`

### "Render service n'apparaît pas"
- Attendez quelques minutes (propagation)
- Rechargez la page Render
- Vérifiez que GitHub est connecté

### "Le jeu se charge mais ne se connecte au serveur"
- Vérifiez `REACT_APP_SERVER_URL` dans frontend .env.production
- Doit être: `https://bomberman-backend.onrender.com`
- Redéployez si changé

---

## 📚 **Documentation Supplémentaire**

- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Résumé 10 min
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide détaillé
- [Git Documentation](https://git-scm.com/doc)
- [Render Documentation](https://docs.render.com)
- [GitHub Docs](https://docs.github.com)

---

## 🎉 **Vous êtes Prêt!**

**Récapitulatif des étapes:**
1. ✅ Git init + Commiter code
2. ✅ Créer repo GitHub
3. ✅ Pusher code sur GitHub
4. ✅ Créer compte Render
5. ✅ Connecter GitHub à Render
6. ✅ Déployer services
7. ✅ **JOUER ENSEMBLE!** 🎮

**Durée totale:** ~30 minutes

**Bon déploiement!** 🚀
