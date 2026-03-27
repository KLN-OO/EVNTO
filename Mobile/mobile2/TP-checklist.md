# Checklist de déploiement du TP mobile2

## 1. Installation
- [x] `cd Mobile/mobile2`
- [x] `npm install`
- [x] `npm run start` (Expo)

## 2. Backend
- [x] Lancer `server/server.js` (port 5000)
- [x] Vérifier `app.use(cors())` dans `server/server.js`
- [x] Vérifier routes : `/api/utilisateurs`, `/api/events`, `/api/inscriptions`, `/api/users`

## 3. Mobile2 Setup
- [x] `App.tsx` : AuthContext + navigation stack (login vs app)
- [x] `src/lib/api.ts` : axios + intercepteur token
- [x] `src/lib/storage.ts` : AsyncStorage utils
- [x] `src/context/AuthContext.tsx` : login/logout + token management
- [x] `src/screens/LoginScreen.tsx` : form login
- [x] `src/screens/EventsScreen.tsx` : event list + détail navigation + logout
- [x] `src/screens/EventDetailScreen.tsx` : détail + join/leave

## 4. Ajustements finaux
- [ ] Modifier `API_BASE_URL` dans `src/lib/api.ts` à ton IP LAN (TP2)
- [ ] Vérifier route `/utilisateurs/login` fonctionne avec un utilisateur existant
- [ ] Tester inscription / désinscription via `/inscriptions`
- [ ] Scanner QR Expo et tester sur mobile réel

## 5. Bonus (optionnel)
- [ ] Ajouter écran `Inscription` / `MyInscriptions`
- [ ] Ajouter filtre / recherche sur la liste `Events`
- [ ] Ajouter `event card` + style moderne
