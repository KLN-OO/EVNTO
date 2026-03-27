# events-mobile (mobile2)

Ce dossier contient le projet Expo Mobile2 adapté à tes TP (TP3..TP8) avec le `package.json` demandé.

## Structure
- `App.tsx`: navigation onglets de base
- `src/screens/EventsScreen.tsx`: liste d'événements depuis le backend
- `src/lib/api.ts`: configuration axios (à ajuster IP/port)

## Installation
1. `cd Mobile/mobile2`
2. `npm install`
3. `npm run android` ou `npm run ios` ou `npm run web`

## Ajustements importants
- `src/lib/api.ts` : chg `API_BASE_URL` avec l'IP de ta machine (TP2)
- backend doit être démarré sur `5000` (exemple) et CORS autorisé

## Correspondance TP
- TP2 : IP / CORS, vérifier `server/server.js` (cors() déjà global)
- TP3 : setup de projet
- TP4 : écran login + token (à implémenter dans `src/screens/LoginScreen.tsx`)
- TP5+ : AuthContext + navigation sécurisée + inscription, à copier/adapter du live code du repo/TP docs
