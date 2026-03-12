# ⚡ Guide Rapide Déploiement - 10 minutes

## 🚀 **Résumé Exécutif**

Votre jeu Bomberman sera hébergé **gratuitement** sur **Render.com** et accessible depuis **n'importe quel appareil** via une URL simple.

---

## ✅ **Checklist de Déploiement**

### AVANT: Préparation (5 min)

- [ ] Créer compte GitHub (si pas déjà fait)
- [ ] Cloner/Pusher le code Bomber sur GitHub
- [ ] Vérifier que `render.yaml` existe (✅ déjà créé)
- [ ] Vérifier que `.env.production` existe (✅ déjà créé)

### PENDANT: Déploiement (5 min)

- [ ] Créer compte sur [render.com](https://render.com)
- [ ] Connecter GitHub à Render
- [ ] Sélectionner repo `bomberman-game`
- [ ] **Render détecte automatiquement `render.yaml`**
- [ ] Cliquer "Deploy"
- [ ] Attendre ~5 minutes que les 2 services déploient
- [ ] Copier les URLs:
  - Backend: `https://bomberman-backend.onrender.com`
  - Frontend: `https://bomberman-frontend.onrender.com`

### APRÈS: Test (2 min)

- [ ] Ouvrir `https://bomberman-frontend.onrender.com`
- [ ] Entrer pseudo joueur 1
- [ ] Ouvrir deuxième onglet (même URL)
- [ ] Entrer pseudo joueur 2
- [ ] Attendre 10 secondes
- [ ] **Jouer ensemble!** 🎮

---

## 📱 **Partage avec Amis**

Envoyez simplement:
```
https://bomberman-frontend.onrender.com
```

Ils peuvent jouer **directement** du navigateur! ✅

---

## 🔗 **Liens Importants**

| Lien | Description |
|------|-------------|
| [render.com](https://render.com) | Créer compte hosting |
| [github.com](https://github.com) | Créer dépôt code |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guide détaillé complet |

---

## ⚠️ **Important à Savoir**

**Plan Gratuit Render:**
- ✅ Application **totalement gratuite**
- ⏱️ Serveur **arrête après 15 min d'inactivité**
- ⚡ Redémarre **automatiquement** quand quelqu'un accède
- 💾 0.5 GB RAM (**suffisant** pour 2-3 parties)

**Solution**: 
- Jouez régulièrement (gardez serveur actif)
- OU upgrade à $7/mois (jamais arrêté)

---

## 🔄 **Mise à Jour Automatique**

Chaque fois que vous modifiez le code:

```bash
git add .
git commit -m "Description du changement"
git push origin main
```

**Render redéploiera AUTOMATIQUEMENT!** ✅

---

## 🆘 **Aide Rapide**

| Problème | Solution |
|----------|----------|
| Page charge lent | Normal 1ère fois (déploiement froid), patient |
| Erreur WebSocket | Vérifiez URLs dans .env.production |
| Impossible se connecter | Serveur peut être arrêté, relancez navigateur |
| Jeu ne démarre pas | Attendez 10 secondes après 2 joueurs |

---

## 📞 **Next Steps**

1. **Maintenant**: Lisez [DEPLOYMENT.md](./DEPLOYMENT.md) complet
2. **Créez GitHub**: Pushez le code
3. **Rendez.com**: Suivez étapes du guide
4. **Partagez**: URL avec amis
5. **Jouez**: Bomberman en ligne! 🎮

---

**DURÉE TOTALE:** ~15 minutes pour passer de zéro à jeu online! 🚀

