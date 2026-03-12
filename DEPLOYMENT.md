# 🚀 Guide de Déploiement - Bomberman Multiplayer

## 📌 Déploiement sur Render.com (GRATUIT)

Render.com est la solution **la plus simple et gratuite** pour héberger votre jeu Bomberman en production.

---

## 🔧 **ÉTAPE 1: Créer un compte Render**

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Sign Up"** (ou utilisez GitHub)
3. Choisissez **GitHub** pour une synchronisation automatique
4. Acceptez les permissions et confirmez

---

## 📁 **ÉTAPE 2: Préparer le Dépôt GitHub**

Si vous n'avez pas encore GitHub:

```bash
# Initialiser git
cd C:\Project\Bomber
git init
git config user.email "votre.email@example.com"
git config user.name "Votre Nom"

# Créer un fichier .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "build/" >> .gitignore

# Ajouter et commiter
git add .
git commit -m "Initial commit: Bomberman multiplayer game"
```

Puis sur [github.com](https://github.com):
1. Créez un nouveau repo `bomberman-game`
2. Suivez les instructions pour pousser votre code

```bash
git remote add origin https://github.com/VOTRE_USER/bomberman-game.git
git branch -M main
git push -u origin main
```

---

## 🎯 **ÉTAPE 3: Créer le Service Backend sur Render**

### Option A: Via Interface Web (Recommandé)

1. **Sur Render.com**, cliquez "New +" → **"Web Service"**
2. Connectez votre repo GitHub `bomberman-game`
3. Configurez:
   - **Name**: `bomberman-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Cliquez "Advanced"** et ajoutez Variables d'Environnement:
   ```
   NODE_ENV = production
   PORT = 5000
   CLIENT_URL = https://bomberman-frontend.onrender.com
   ```

5. Sélectionnez le plan **Free** (gratuit)
6. Cliquez **"Create Web Service"**
7. Attendez que le serveur se déploie (~2-3 minutes)
8. Notez l'URL: `https://bomberman-backend.onrender.com`

### Option B: Fichier render.yaml (Automatique)

Si vous avez le fichier `render.yaml` (déjà créé):
1. Allez sur [render.com/new/infrastructure](https://render.com/new/infrastructure)
2. Sélectionnez votre repo
3. Render détectera automatiquement `render.yaml`
4. Cliquez **"Deploy"**
5. Les deux services se déploient automatiquement

---

## 🎯 **ÉTAPE 4: Créer le Service Frontend sur Render**

1. **Sur Render.com**, cliquez "New +" → **"Web Service"**
2. Connectez le même repo
3. Configurez:
   - **Name**: `bomberman-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l 3000`

4. **Cliquez "Advanced"** et ajoutez Variable d'Environnement:
   ```
   REACT_APP_SERVER_URL = https://bomberman-backend.onrender.com
   ```

5. Sélectionnez le plan **Free**
6. Cliquez **"Create Web Service"**
7. Attendez (~3-5 minutes pour la compilation)
8. Notez l'URL: `https://bomberman-frontend.onrender.com`

---

## ✅ **ÉTAPE 5: Tester le Déploiement**

### 🎮 **Accès Local (même réseau)**

Depuis votre même ordinateur (2 onglets):
1. Onglet 1: `https://bomberman-frontend.onrender.com`
2. Onglet 2: `https://bomberman-frontend.onrender.com`
3. Entrez 2 pseudos différents
4. Jouez ensemble! 🎉

### 🎮 **Accès Distant (autre ordinateur/téléphone)**

Depuis un **autre ordinateur/téléphone/appareil**:
1. Accédez à: `https://bomberman-frontend.onrender.com`
2. (Pas besoin de configuration!)
3. Entrez un pseudo
4. Jouez avec d'autres joueurs! 🎮

---

## 📊 **Configuration Finalisée**

| Service | URL | Type |
|---------|-----|------|
| **Backend** | `https://bomberman-backend.onrender.com` | Node.js (Express) |
| **Frontend** | `https://bomberman-frontend.onrender.com` | React App |
| **Joueurs Max** | 6 par partie | Limité |
| **Parties Simultanées** | Illimitées | Multiple |

---

## ⚠️ **Limitations Plan Gratuit Render**

- ✅ Serveur arrêt après 15 min d'inactivité (redémarre au prochain accès)
- ✅ 0,5GB RAM (suffisant pour 2-3 parties)
- ✅ CPU partagé (acceptable pour usage personnel)
- ✅ Bande passante: 100GB/mois

### 💡 **Si vous avez problème:**
- Render peut arrêter le serveur après 15 min d'inactivité
- **Solution**: Accédez à la page toutes les 15 min ou mettez à jour vers un plan payant ($7/mois)

---

## 🔄 **Mise à Jour du Code**

Quand vous modifiez le code:

```bash
# Localement
git add .
git commit -m "Update: Nouvelle feature"
git push origin main
```

**Render redéploiera automatiquement!** ✅ (2-5 minutes)

---

## 📱 **Partager le Jeu avec Amis**

Envoyez simplement cette URL à vos amis:
```
https://bomberman-frontend.onrender.com
```

Ils peuvent:
1. Ouvrir le lien
2. Entrer un pseudo
3. **JOUER IMMÉDIATEMENT** 🎮

Pas besoin d'installation, c'est 100% web!

---

## 🆘 **Dépannage**

### "La page charge lentement"
- C'est normal les premiers jours (déploiement froid)
- Render peut arrêter les serveurs inactifs
- Attendez quelques secondes

### "Erreur WebSocket"
- Vérifiez que `CLIENT_URL` backend est correct
- Frontend doit pointer vers backend corrct
- Redéployez (git push)

### "Je vois 403 Forbidden"
- Vérifiez le chemin du "Root Directory"
- Pour backend: `backend`
- Pour frontend: `frontend`

---

## 🎯 **Résumé**

1. ✅ GitHub + code prêt
2. ✅ Render.com account créé
3. ✅ Backend déployé + URL notée
4. ✅ Frontend déployé + URL notée
5. ✅ Tester accès: Envoyez URL frontend à amis
6. ✅ **JOUER ENSEMBLE!** 🎉

---

## 🚀 **Prochaines Étapes Optionnelles**

### Domaine Personnalisé
- Acheter un domaine (~$10/an sur Namecheap)
- Configure sur Render (Custom Domain)

### Upgrade Performance
- Frontend: $7/mois (jamais arrêté, plus de RAM)
- Backend: $7/mois

### Analytics
- Ajouter Sentry pour erreurs
- Ajouter Google Analytics

---

**BONNE CHANCE AVEC VOTRE JEU!** 🎮🎉

Pour toute question: [Render Documentation](https://docs.render.com)
