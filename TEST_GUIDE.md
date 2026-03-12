# 🎮 Guide Test Multijoueur Local + Distant

## 🎯 **Objectif**

Savoir comment tester Bomberman avec 2 joueurs:
1. **Localement** (même ordinateur)
2. **Sur le réseau** (autre appareil)
3. **Sur internet** (après Render)

---

## 🖥️ **TEST 1: Localement (Même Ordinateur)**

### Prérequis
- ✅ Serveur backend lancé: `npm run dev` (dans `backend/`)
- ✅ Serveur frontend lancé: `npm start` (dans `frontend/`)
- ✅ Frontend accessible: `http://localhost:3000`

### Procédure

1. **Ouvrez 2 onglets du navigateur:**
   - Onglet 1: `http://localhost:3000`
   - Onglet 2: `http://localhost:3000`

2. **Onglet 1 - Joueur 1:**
   - Entrez pseudo: `Alice` 
   - Cliquez "Join Game"
   - Message: `Waiting for players... 1/6`
   - Compte à rebours: `⏱️ 15s`

3. **Onglet 2 - Joueur 2:**
   - Entrez pseudo: `Bob`
   - Cliquez "Join Game"
   - Les 2 onglets doivent montrer: `Waiting for players... 2/6`
   - Compte à rebours: `⏱️ 10s` (changé car 2+ joueurs)

4. **Attendre 10 secondes**
   - Les deux devraient voir la **même carte**
   - Alice visible à (1, 1)
   - Bob visible à (11, 1)

5. **Testez les mouvements:**
   - Onglet 1: Appuyez sur flèches
   - Alice doit bouger
   - Onglet 2: Vous devez voir Alice bouger aussi ✅

6. **Testez les bombes:**
   - Onglet 1: Appuyez SPACE
   - Bombe doit apparaître chez TOUS les joueurs ✅

---

## 🌐 **TEST 2: Réseau Local (Autre Appareil)**

### Prérequis
- ✅ PC principal avec serveur en local
- ✅ Second appareil (téléphone, tablet, PC) sur le **même WiFi**

### Trouver l'IP du PC Principal

**Windows (PowerShell):**
```powershell
ipconfig
```
Cherchez la ligne "IPv4 Address" sous la section WiFi/Ethernet
Exemple: `192.168.x.x`

**Mac/Linux:**
```bash
ifconfig
```
Cherchez même chose

### Procédure

1. **Sur PC Principal:**
   - Lancez les serveurs localement
   - Notez votre IP (ex: `192.168.1.100`)

2. **Sur Second Appareil (même réseau WiFi):**
   - Ouvrez navigateur
   - Allez à: `http://192.168.1.100:3000` (remplacez IP)
   - Vous devriez voir l'écran Bomberman ✅

3. **Test Multijoueur:**
   - PC 1: Entrez pseudo `Alice`
   - Appareil 2: Entre pseudo `Bob`
   - **JOUEZ ensemble!** 🎮

4. **Dépannage:**
   - "Impossible de se connecter"?
     - Vérifiez que les 2 appareils sont sur le même WiFi
     - Vérifiez l'IP exacte
     - Attendez 10-15 secondes de chargement
     - Rechargez la page

---

## ☁️ **TEST 3: Internet (Render Déployé)**

### Après le Déploiement sur Render

L'URL sera: `https://bomberman-frontend.onrender.com`

### Procédure

1. **PC 1:**
   - Ouvrez: `https://bomberman-frontend.onrender.com`
   - Entrez pseudo

2. **Appareil 2 (N'importe où):**
   - Ouvrez: `https://bomberman-frontend.onrender.com`
   - Entrez pseudo

3. **Pas besoin de même réseau!**
   - Peut être sur 4G, WiFi public, ou n'importe où
   - **Connecté avec Internet** = accès ✅

### Partage avec Amis

Envoyez simplement le lien:
```
https://bomberman-frontend.onrender.com
```

Vos amis peuvent jouer directement! 🎮

---

## 📋 **Checklist Test Complet**

### Avant Render
- [ ] Backend tourne: `npm run dev`
- [ ] Frontend tourne: `npm start`
- [ ] Accessible localement: `localhost:3000`
- [ ] 2 onglets, 2 pseudos différents
- [ ] Tous 2 voient la même carte après 10s
- [ ] Les mouvements se synchronisent
- [ ] Les bombes apparaissent partout
- [ ] Les explosions tuent les joueurs

### Après Render
- [ ] Backend est "Live" dans Render Dashboard
- [ ] Frontend est "Live" dans Render Dashboard
- [ ] Accessible via HTTPS (URL Render)
- [ ] 2 joueurs distants peuvent jouer
- [ ] Synchronisation fonctionne
- [ ] ✅ **PRÊT POUR LE PUBLIC!**

---

## 🆘 **Dépannage Synchronisation**

### Symptôme: "Je vois l'autre joueur mais il ne bouge pas"

**Cause possible:** Mauvaise synchronisation WebSocket

**Solutions:**
1. Rechargez la page (F5)
2. Vérifiez les logs serveur (Terminal)
3. Si `playerMove` n'apparaît pas, c'est un problème d'input
4. Vérifiez que les flèches du clavier fonctionnent

### Symptôme: "Les 2 onglets voient des cartes différentes"

**Cause:** Serveur a créé 2 parties au lieu d'une

**Solution:**
1. Actualisez la page
2. C'est corrigé maintenant (partie d'une seule session)
3. Les 2 devraient voir la même carte

### Symptôme: "Bombe n'explose pas"

**Cause:** Le délai est 3 secondes (normal)

**Solution:**
1. Attendez 3 secondes
2. Vérifiez les logs: "💣 bomb placed"
3. Puis "💥 explosion"

### Symptôme: "Joueur 2 ne peut pas se connecter"

**Cause:** Serveur arrêté ou port occupé

**Solutions:**
1. Vérifiez que backend tourne: `npm run dev`
2. Vérifiez port 5000 libre: `netstat -an | findstr :5000`
3. Tuez ancien processus si besoin
4. Relançez serveur

---

## 🎥 **Enregistrer une Vidéo de Test**

Si vous voulez montrer votre jeu:

1. **Ouvrez 2 onglets côte à côte:**
   - Split screen avec les 2 navigateurs

2. **Lancez OBS ou Streamlabs (gratuit):**
   - Window Capture: 2 onglets
   - Micro: pour commentaires
   - REC pour enregistrer

3. **Jouez et commentez:**
   - "Joueur 1 est Alice"
   - "Je place une bombe..."
   - "Voyez comme ils se synchronisent!"

4. **Uploadez sur YouTube/Twitter** 📹

---

## 🔍 **Logs à Vérifier**

### Terminal Backend

Cherchez ces messages:

```
✅ User attempting to join with nickname: Alice
✅ Found waiting game
✅ Player added
📡 Broadcasting gameState with 2 players

[Quand mouvement]
⬆️ playerMove: direction=right
✅ player moved to (2, 1)
📡 io.to(gameId).emit('playerMoved')
```

### Console Navigateur (F12)

Cherchez:

```
✅ Connected to server with socket ID: ...
📥 Received gameState:
📋 Total players: 2
✅ Updated player moved
💣 Bomb placed
💥 Player hit
```

---

## 📞 **Résumé Accès**

| Situation | URL | Où | Appareil |
|-----------|-----|-----|----------|
| Dev local | `localhost:3000` | PC local | 1 |
| Réseau WiFi | `192.168.x.x:3000` | Tous appareils WiFi | Plusieurs |
| Internet | `onrender.com` | Partout | Illimité |

---

## ✅ **Vous Êtes Prêt!**

**Avant Render:** Testez en local et sur réseau WiFi
**Après Render:** Partez le lien - JOUEZ avec le monde! 🎮🚀

