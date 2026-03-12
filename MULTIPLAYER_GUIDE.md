# 🎮 Guide Multijoueur - Bomberman

## ✅ Système Multijoueur Implémenté et Amélioré

Le jeu supporte maintenant le **multijoueur complet avec synchronisation en temps réel** via Socket.io. Voici comment ça fonctionne:

---

## 🔄 Flux de Jeu Multijoueur

### 1️⃣ **Connexion des Joueurs**
```
Joueur 1 lance le jeu
  ↓
Saisit un pseudo et clique "Join Game"
  ↓
Écran d'attente (Waiting Screen)
  ↓
Joueur 2 lance le jeu et rejoint
  ↓
Le jeu démarre automatiquement avec 2+ joueurs
```

### 2️⃣ **Synchronisation en Temps Réel**

#### **État du jeu (gameState)**
- **Envoyé au:** Tous les joueurs
- **Quand:** À chaque nouvelle connexion et mise à jour
- **Contient:**
  - Position de tous les joueurs
  - Briques et leur état (cassées/intactes)
  - Bombes actuelles
  - Explosions actives
  - Power-ups disponibles
  - Statut du jeu (attente/en cours/terminé)

#### **Mouvements (playerMoved)**
- **Fréquence:** Max 20 mouvements/seconde (50ms)
- **Synchronisé:** À tous les joueurs instantanément
- **Throttling:** Implémenté pour éviter la surcharge réseau

#### **Bombes (bombPlaced)**
- **Propagation:** Instantanée à tous
- **Chaîne d'explosions:** Supportée (bombe qui déclenche bombe)
- **Limitation:** 1-6 bombes max selon les power-ups

#### **Explosions (explosion)**
- **Rayons:** 4 directions + portée variable
- **Briques cassées:** Détruites et remplacées par des power-ups
- **Joueurs touchés:** Marqués comme morts instantanément
- **Visibilité:** Affichées à tous pendant 500ms

#### **Power-ups (powerUpCollected)**
- **Types:**
  - 🏎️ Roller: +50% de vitesse
  - 🔥 Fire: +1 portée d'explosion
  - 💣 Bomb: +1 bombe maximum
- **Auto-ramassage:** Quand un joueur marche dessus
- **Synchronisation:** Immédiate pour tous

---

## 🎯 Améliorations Implémentées

### ✨ **1. Throttling des Mouvements**
```javascript
// Avant: Envoi à chaque keydown (peut être 60+ par seconde)
// Après: 20 mouvements/seconde max (fréquence fixe)
```
**Bénéfice:** Moins de surcharge réseau, meilleure synchronisation

### ✨ **2. État Complet des Power-ups**
```javascript
// Avant: powerUps non inclus dans le gameState initial
// Après: powerUps synchronisés correctement
```
**Bénéfice:** Les joueurs qui rejoignent en retard voient tous les power-ups

### ✨ **3. Écran d'Attente Amélioré**
- Affiche clairement le nombre de joueurs connectés
- Liste les joueurs avec leurs couleurs
- Animation de pulsation
- Affiche "Vous êtes" pour identifier le joueur local

### ✨ **4. Affichage des Autres Joueurs**
- Chaque joueur a une couleur unique
- Pseudo affiché au-dessus du personnage
- Animations de marche synchronisées
- Direction de regard suivant le mouvement

---

## 🎮 Comment Jouer en Multijoueur

1. **Démarrer le jeu:**
   ```bash
   npm start  # Dans le dossier frontend
   npm run dev  # Dans le dossier backend
   ```

2. **Jouer localement (plusieurs onglets):**
   - Ouvrez deux onglets: `http://localhost:3000` et `http://localhost:3001`
   - Entrez des pseudos différents
   - Le jeu démarre automatiquement

3. **Jouer en réseau:**
   - Partagez l'URL: `http://YOUR_IP:3000`
   - Jusqu'à 6 joueurs simultanément

---

## 📊 Détails Techniques

### Architecture Socket.io
```
Client 1 ──┐
Client 2 ──┼── Socket.io ──→ Backend ──→ Logique Jeu
Client N ──┘                    ↓
                          Broadcast à tous
```

### Événements Socket.io

| Événement | Direction | Fréquence | Contenu |
|-----------|-----------|-----------|---------|
| `joinGame` | Client→Server | 1x | {nickname} |
| `gameState` | Server→Clients | 1x/join | État complet |
| `playerMove` | Client→Server | 20x/s max | {gameId, direction} |
| `playerMoved` | Server→Clients | 20x/s max | {playerId, x, y} |
| `placeBomb` | Client→Server | À la demande | {gameId} |
| `bombPlaced` | Server→Clients | À la demande | {bomb object} |
| `explosion` | Server→Clients | À la demande | {tiles, damages} |
| `playerHit` | Server→Clients | À la demande | {playerId} |
| `gameEnded` | Server→Clients | 1x | {winner} |
| `playerDisconnected` | Server→Clients | À la demande | {playerId} |

### Latence Acceptée
- Mouvements: < 100ms
- Bombes: < 50ms
- Explosions: Instantanées
- Affichage: 60 FPS (local smoothing)

---

## 🐛 Dépannage Multijoueur

### "Je vois un joueur mais il ne bouge pas"
- Vérifiez que le serveur reçoit les mouvements
- Console: `⬆️ Sending move: ...`

### "Les bombes n'explodent pas chez mon ami"
- Attendez le délai (3000ms par défaut)
- Vérifiez que vous voyez les mêmes briques cassées

### "Je suis mort mais je peux encore jouer"
- Le serveur a raison, le client vient de se désynchroniser
- Rechargez la page pour resynchroniser

---

## 🔧 Configuration

### Param vitres de jeu (dans `server.js`)
```javascript
GAME_CONFIG = {
  MAX_PLAYERS: 6,           // Pas plus de 6 joueurs
  MAP_WIDTH: 13,            // Largeur de la carte
  MAP_HEIGHT: 13,           // Hauteur de la carte
  TILE_SIZE: 40,            // Pixels par case
  BOMB_TIMER: 3000,         // Délai avant explosion (ms)
  EXPLOSION_TIMER: 500      // Durée de l'explosion (ms)
}
```

### Optimiser la Fréquence (dans `GameCanvas.js`)
```javascript
movementThrottleRef.current = 50;  // Milliseconds (20x/sec)
// Augmentez pour 10x/sec: 100
// Diminuez pour 60x/sec: 16
```

---

## 🎯 Prochaines Étapes Possibles

1. **Chat en jeu** - Messages entre joueurs
2. **Emojis/Skins** - Personnalisation des personnages
3. **Classement** - Statistiques de joueurs
4. **Parties privées** - Codes d'accès aux parties
5. **Spectateur mode** - Observer les autres parties
6. **Replay** - Rejouer les meilleures parties
7. **Serveur persistant** - Base de données pour scores

---

## 📝 Notes

- ✅ Multijoueur fully fonctionnel
- ✅ Synchronisation en temps réel
- ✅ Gestion des déconnexions
- ✅ Collisions entre joueurs
- ✅ Power-ups synchronisés
- ✅ Explosions en chaîne
- ✅ Animation fluide

**Version:** 1.0 - Multijoueur Complet  
**Dernière mise à jour:** 12 Mars 2026
