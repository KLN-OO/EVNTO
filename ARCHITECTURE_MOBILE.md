# Architecture Frontend Mobile - Evnto

## 1. COMPONENTS - Éléments réutilisables UI

**Rôle** : Composants graphiques indépendants pour cohérence visuelle.

### Structure actuelle (mobile2/)
- **Pas de dossier components/ dédié** dans mobile2/
- Composants probablement inline dans les screens
- Utilisation de composants React Native natifs

**Recommandation** : Créer `src/components/` pour factoriser :
- `Button.tsx`, `Input.tsx`, `Card.tsx`, `LoadingSpinner.tsx`

---

## 2. SCREENS - Écrans principaux

**Rôle** : Pages visibles par l'utilisateur, correspondant aux vues principales.

### Fichiers existants (`src/screens/`)
```
LoginScreen.tsx          → Connexion utilisateur
RegisterScreen.tsx       → Inscription utilisateur  
EventsScreen.tsx         → Liste événements publics
EventDetailScreen.tsx    → Détail événement
MyInscriptionsScreen.tsx → Mes inscriptions
ProfileScreen.tsx        → Profil utilisateur
```

**Navigation** : React Navigation (Stack Navigator probablement)

---

## 3. NAVIGATION - Transitions entre écrans

**Rôle** : Gestion des routes et transitions via React Navigation.

### Implémentation actuelle
- **React Navigation** (installé dans package.json)
- **Stack Navigator** pour empilement d'écrans
- Routes définies dans `App.tsx` ou navigation container

**Routes principales** :
- Login/Register → Events (après auth)
- Events → EventDetail
- Profile → MyInscriptions

---

## 4. STORAGE - Stockage local

**Rôle** : Persistance des données locales (token JWT, user).

### Fichier clé : `src/lib/storage.ts`
```typescript
// AsyncStorage pour données persistantes
saveToken(token: string)     → Stockage JWT
getToken()                   → Récupération JWT  
removeToken()                → Suppression JWT
saveUser(user)               → Sauvegarde profil
getUser()                    → Récupération profil
clearStorage()               → Nettoyage complet
```

**Utilisation** : Token injecté automatiquement dans headers API

---

## 5. UTILS - Fonctions utilitaires

**Rôle** : Traitements récurrents factorisés.

### État actuel
- **Pas de dossier utils/ dédié**
- Fonctions probablement inline ou minimales
- Formatage dates, validation, etc.

**Recommandation** : Créer `src/utils/`
- `dateUtils.ts` (formatage dates)
- `validationUtils.ts` (validation formulaires)
- `apiUtils.ts` (helpers API)

---

## 6. SERVICES - Communication backend

**Rôle** : Appels API REST vers le backend Node.js/Express.

### Fichier clé : `src/lib/api.ts`
```typescript
// Axios configuré avec intercepteurs
const api = axios.create({
  baseURL: 'http://172.20.10.5:5000/api',  // IP réseau local
  timeout: 15000
});

// Intercepteur requête : injection JWT automatique
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur réponse : gestion 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) await removeToken();
    return Promise.reject(error);
  }
);
```

**Endpoints couverts** :
- Auth : `/utilisateurs/login`, `/utilisateurs/register`, `/utilisateurs/me`
- Events : `/events`, `/events/:id`, `/events/filtered`
- Inscriptions : `/inscriptions/*`

---

## 7. THÈME - Style global

**Rôle** : Définition couleurs, typographie, UI cohérente.

### État actuel
- **Pas de fichier thème dédié** dans mobile2/
- Utilisation styles inline ou ThemeProvider basique
- Support light/dark mode possible

**Recommandation** : Créer `src/theme/`
```typescript
export const theme = {
  colors: { primary: '#0a7ea4', secondary: '#fff', ... },
  fonts: { regular: 'System', bold: 'System-Bold' },
  spacing: { small: 8, medium: 16, large: 24 }
};
```

---

## 8. INTERFACE UTILISATEUR (UI) - Partie visible

**Rôle** : Expérience utilisateur complète et interactive.

### Combinaison actuelle
- **Screens/** + composants inline
- **React Native** natif (View, Text, TouchableOpacity, etc.)
- **Navigation** fluide entre écrans
- **Formulaires** : TextInput pour login/register
- **Listes** : FlatList pour événements
- **Feedback** : Alert, ActivityIndicator

**Fonctionnalités UI** :
- Authentification (login/register)
- Liste événements avec scroll
- Détail événement avec inscription
- Gestion profil et inscriptions
- Navigation par onglets/stack

---

## 9. CONTEXTE (State global) - Données partagées

**Rôle** : Gestion état global (utilisateur connecté, token).

### Fichier clé : `src/context/AuthContext.tsx`
```typescript
// Context React pour état d'authentification
const AuthContext = createContext<AuthContextType>({
  userToken: string | null,
  user: any | null,
  isLoading: boolean,
  login: (email, password) => Promise<void>,
  register: (payload) => Promise<void>,
  updateProfile: (payload) => Promise<void>,
  logout: () => Promise<void>
});

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // ... logique auth avec storage + API
};
```

**État partagé** :
- Token JWT persistant
- Données utilisateur (profil)
- Loading states
- Méthodes auth (login/register/logout/update)

---

## Architecture de flux mobile

```
┌─────────────────┐
│   UTILISATEUR   │
│   (Interface)   │
└─────────┬───────┘
          │
┌─────────▼──────────────────────┐
│  SCREENS (Login, Events, ...)  │ ← Navigation React
│  - Composants UI               │
│  - Gestion événements locaux   │
└─────────┬──────────────────────┘
          │
┌─────────▼─────────────────┐
│  AUTH CONTEXT (State)     │ ← Données globales
│  - userToken, user        │
│  - login(), logout()      │
└─────────┬─────────────────┘
          │
┌─────────▼─────────────────────┐
│  SERVICES (API calls)        │ ← Communication backend
│  - api.get('/events')        │
│  - Intercepteurs JWT         │
└─────────┬─────────────────────┘
          │
┌─────────▼─────────────────┐
│  STORAGE (AsyncStorage)   │ ← Persistance locale
│  - saveToken(), getUser() │
└───────────────────────────┘
```

---

## État de développement mobile

| Couche | État | Commentaires |
|--------|------|--------------|
| **Components** | ⚠️ Manquant | Factorisation à faire |
| **Screens** | ✅ Complet | 6 écrans principaux |
| **Navigation** | ✅ Présent | React Navigation |
| **Storage** | ✅ Complet | AsyncStorage + helpers |
| **Utils** | ⚠️ Minimal | À développer |
| **Services** | ✅ Complet | Axios + intercepteurs |
| **Thème** | ⚠️ Basique | À structurer |
| **UI** | ✅ Fonctionnel | React Native natif |
| **Contexte** | ✅ Complet | AuthContext robuste |

---

## Points d'amélioration pour production

1. **Components réutilisables** : Créer bibliothèque UI
2. **Gestion d'erreurs** : Toasts, retry API
3. **Offline mode** : Cache AsyncStorage
4. **Tests** : Jest + React Native Testing Library
5. **Performance** : Optimisation listes, images
6. **Sécurité** : Obfuscation, certificat pinning</content>
<parameter name="filePath">c:\wamp64\www\Evnto\ARCHITECTURE_MOBILE.md