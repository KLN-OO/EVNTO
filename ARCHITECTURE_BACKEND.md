# Architecture Backend - Evnto

## 1. REPOSITORY - Couche d'accès aux données

**Rôle** : Interfaces pour interagir avec PostgreSQL. Encapsulent les requêtes Sequelize pour CRUD.

### Repositories actuels (implicites dans Sequelize)

| Entité | Fichier Modèle | Opérations CRUD |
|--------|----------------|-----------------|
| **Utilisateur** | `models/utilisateurs.js` | findOne(email), findByPk(id), create(), update() |
| **Événement** | `models/evenements.js` | findAll(filtres), findOne(id), create(), update(), destroy() |
| **Inscription** | `models/inscriptions.js` | findAll(), findOne(), create(), destroy() |
| **Rôle** | `models/role.js` | findOne(libelle) |
| **Catégorie** | `models/categories.js` | findAll() |
| **Lieu** | `models/lieux.js` | findAll() |

### Requêtes Repository existantes (exemples)

```javascript
// Repository Utilisateur
await db.Utilisateur.findOne({ where: { email } })
await db.Utilisateur.findByPk(utilisateur_id)
await db.Utilisateur.create({ nom_utilisateur, email, mot_de_passe })

// Repository Événement
await db.Evenement.findAll({ where: { est_publie: true } })
await db.Evenement.findOne({ where: { evenement_id: id } })
await db.Evenement.create({ titre, description, date_debut, ... })

// Repository Inscription
await db.Inscription.findAll({ where: { utilisateur_id } })
await db.Inscription.findOne({ where: { utilisateur_id, evenement_id } })
await db.Inscription.create({ utilisateur_id, evenement_id })
```

---

## 2. SERVICE - Couche métier

**Rôle** : Centralise la logique métier, les règles de gestion et les vérifications avant accès/modification.

### Services identifiés (actuellement dans controllers)

| Service | Fichier actuel | Responsabilités métier |
|---------|----------------|------------------------|
| **UtilisateurService** | utilisateurController.js | Authentification (login), enregistrement, validation mot de passe, gestion profil |
| **ÉvénementService** | eventsController.js | Création événement, mise à jour, publication, filtrage par date, vérification droits organisateur |
| **InscriptionService** | inscriptionsController.js | Création inscription, vérification doublon, annulation, vérification propriété |

### Logique métier actuelle

```javascript
// Service Utilisateur : Authentification
- Vérifier email existe
- Comparer mot de passe bcrypt
- Créer JWT (24h)
- Assigner rôle par défaut (user)

// Service Événement : Création
- Vérifier utilisateur est organisateur/admin
- Vérifier date_fin > date_debut
- Créer événement
- Récupérer count participants

// Service Inscription : Création
- Vérifier utilisateur non déjà inscrit (doublon)
- Créer inscription
- Incrémenter count participants
```

---

## 3. DTO - Objets de transfert de données

**Rôle** : Objets échangés entre frontend/backend sans exposer les entités complètes.

### DTOs utilisés (implicites en Express)

| DTO | Utilisation | Champs |
|-----|-------------|--------|
| **LoginDTO** | POST /api/utilisateurs/login | `{ email, mot_de_passe }` |
| **RegisterDTO** | POST /api/utilisateurs/register | `{ nom_utilisateur, email, mot_de_passe, prenom, nom }` |
| **UserProfileDTO** | GET /api/utilisateurs/me | `{ utilisateur_id, nom_utilisateur, email, prenom, nom, role: { libelle } }` |
| **CreateEventDTO** | POST /api/events | `{ titre, description, date_debut, date_fin, categorie_id, lieu_id }` |
| **EventResponseDTO** | GET /api/events | `{ evenement_id, titre, description, date_debut, date_fin, est_publie, organisateur_id, participantsCount }` |
| **CreateInscriptionDTO** | POST /api/inscriptions/:id | `{ utilisateur_id, evenement_id, date_inscription }` |
| **InscriptionResponseDTO** | GET /api/inscriptions/mine | `{ inscription_id, utilisateur_id, evenement_id, date_inscription, evenement: {...} }` |

### Extraction DTO actuelle (dans controllers)

```javascript
// LoginDTO
const { email, mot_de_passe } = req.body;

// CreateEventDTO
const { titre, description, date_debut, date_fin, categorie_id, lieu_id } = req.body;

// EventResponseDTO (avec attributs selectionnés)
attributes: ['evenement_id', 'titre', 'description', 'date_debut', 'date_fin'],
include: [{ model: Role, attributes: ['libelle'] }]
```

---

## 4. CONTROLLER - Couche d'exposition API REST

**Rôle** : Endpoints REST qui reçoivent les requêtes HTTP, appellent les services et retournent les réponses.

### Endpoints actuels

#### **Utilisateur Controller** (`controllers/utilisateurController.js`)
```
POST   /api/utilisateurs/register       → Enregistrement utilisateur
POST   /api/utilisateurs/login          → Authentification
GET    /api/utilisateurs/me             → Récuperer profil (protégé)
PUT    /api/utilisateurs/me             → Modifier profil (protégé)
```

#### **Événement Controller** (`controllers/eventsController.js`)
```
GET    /api/events                      → Tous événements publics
GET    /api/events/filtered             → Événements filtrés par date
GET    /api/events/:id                  → Détail événement public
POST   /api/events                      → Créer événement (protégé, rôle)
PUT    /api/events/:id                  → Modifier événement (protégé, propriété)
PATCH  /api/events/:id/publish          → Publier événement (protégé, propriété)
DELETE /api/events/:id                  → Supprimer événement (protégé, propriété)
POST   /api/events/:id/image            → Upload image (protégé, propriété)
```

#### **Inscription Controller** (`controllers/inscriptionsController.js`)
```
POST   /api/inscriptions/:id            → S'inscrire à événement (protégé)
DELETE /api/inscriptions/:id            → Annuler inscription (protégé)
GET    /api/inscriptions                → Récuperer inscriptions événement
GET    /api/inscriptions/mine           → Mes inscriptions (protégé)
```

#### **User Controller** (`controllers/userController.js`)
```
GET    /api/users/events                → Mes événements créés (protégé)
```

---

## 5. SECURITY - Authentification et autorisation

**Rôle** : Sécuriser l'API REST avec JWT et contrôle d'accès par rôle/propriété.

### 5.1 Authentification JWT

**Fichier** : `middlewares/authMiddleware.js`

```javascript
// Extraction du token du header Authorization: Bearer <token>
const token = req.headers.authorization?.split(' ')[1];

// Vérification et décodage JWT signature
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.utilisateur = decoded; // Attache { utilisateur_id, email, role }
```

**Génération du token** (`utilisateurController.js` - login)
```javascript
const token = jwt.sign(
  {
    utilisateur_id: utilisateur.utilisateur_id,
    email: utilisateur.email,
    role: utilisateur.Role.libelle,
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### 5.2 Contrôle d'accès par rôle

**Fichier** : `middlewares/requireRole.js`

```javascript
requireRole(['organisateur', 'admin'])
// Vérifie que req.utilisateur.role ∈ ['organisateur', 'admin']
// Sinon : 403 Forbidden
```

**Utilisation** :
```javascript
router.post('/', requireRole(['organisateur', 'admin']), eventsController.create);
```

### 5.3 Contrôle d'accès par propriété

**Fichier** : `middlewares/canModifyEvent.js`

```javascript
// Vérifie que l'utilisateur est propriétaire de l'événement
// evenement.organisateur_id === req.utilisateur.utilisateur_id
```

**Utilisations** :
```javascript
router.put('/:id', canModifyEvent, eventsController.update);
router.delete('/:id', canModifyEvent, eventsController.delete);
```

### 5.4 Hashage sécurisé des mots de passe

**Fichier** : `utilisateurController.js`

```javascript
// Enregistrement : hash le mot de passe avant stockage
const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

// Authentification : compare mot de passe avec hash
const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
```

### 5.5 Validation des entrées

**Fichier** : `middlewares/validationMiddleware.js`

```javascript
validateRegister = (req, res, next) => {
  // Vérifier présence : nom_utilisateur, email, mot_de_passe
  // Vérifier format email : regex
  // Vérifier mot de passe : min 6 caractères
}
```

**Utilisation** :
```javascript
router.post('/register', validateRegister, utilisateurController.register);
```

---

## Architecture de flux

```
┌─────────────────────┐
│   CLIENT (React)    │
└───────────┬─────────┘
            │ HTTP Request
            ▼
┌─────────────────────────────────┐
│  CONTROLLER (endpoint REST)     │
│  - Récupère req.body (DTO)      │
│  - Appelle Service              │
│  - Retourne réponse (DTO)       │
└────────────┬────────────────────┘
             │
┌────────────▼──────────────────────────┐
│  MIDDLEWARE (Security)                │
│  - authMiddleware (JWT)               │
│  - requireRole (contrôle rôle)        │
│  - canModifyEvent (propriété)         │
│  - validationMiddleware (DTO valide)  │
└────────────┬───────────────────────┤──┘
             │
┌────────────▼─────────────────────┐
│  SERVICE (Logique métier)        │
│  - Vérifications règles métier   │
│  - Appelle Repository            │
│  - Retourne résultat             │
└────────────┬────────────────────┘
             │
┌────────────▼─────────────────┐
│  REPOSITORY (Sequelize ORM)   │
│  - Requêtes aux modèles       │
│  - CRUD operations            │
│  - Gestion associations       │
└────────────┬────────────────┘
             │
┌────────────▼──────────────────┐
│  PostgreSQL Database          │
│  - Utilisateurs               │
│  - Événements                 │
│  - Inscriptions               │
│  - Rôles, Catégories, Lieux   │
└───────────────────────────────┘
```

---

## Résumé des couches

| Couche | Fichiers | Responsabilité |
|--------|----------|---|
| **Repository** | `models/*.js` | Accès données (Sequelize) |
| **Service** | À créer : `services/*.js` | Logique métier, vérifications |
| **DTO** | Implicite dans controllers | Échange frontend/backend |
| **Controller** | `controllers/*.js` | Endpoints HTTP |
| **Security** | `middlewares/auth*.js` | JWT, rôles, propriété |
| **Config** | `server.js`, `config/` | Express, routes, middleware |

