# CoopConnect — Architecture & Documentation Technique

## Présentation du projet

CoopConnect est une plateforme d'économie circulaire et de coopération économique au Maroc.
Elle permet aux particuliers, professionnels, coopératives et associations de publier des annonces
de biens ou services disponibles à l'échange, et utilise un moteur de matching pour détecter
automatiquement les meilleures correspondances entre annonces.

**Projet académique** — MIAGE IA · Université Côte d'Azur / EMSI Casablanca · 2025-2026
**Équipe** : Bendahou Saad · Nyazi Walid · Qejiou Salah-Eddine · Tabrani El Mehdi

---

## Lancement du projet

### Prérequis
- Java 17+
- Maven 3.8+
- Node.js 18+
- Python 3.10+

### Démarrage en une commande

**Clic droit sur `start.ps1`** → **"Exécuter avec PowerShell"**

> Si Windows bloque l'exécution la première fois, ouvrir PowerShell et taper :
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
> puis relancer `start.ps1`.

Le script lance automatiquement les 6 services dans le bon ordre avec les délais nécessaires,
et ouvre le navigateur sur `http://localhost:5173` après environ 90 secondes.

**Compte de démonstration** : `ahmed.benali` / `Test1234!`

---

## Architecture microservices

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND :5173                        │
│         React 18 + Tailwind CSS + Vite                   │
│    Proxy /api/v1/auth → :8081 (Auth Service)             │
│    Proxy /api/v1     → :8082 (Core Service)              │
│    Proxy /api/match  → :8000 (Matching AI)               │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│           API GATEWAY :8080 (Spring Cloud Gateway)       │
│   /api/v1/auth/**  → lb://auth-service  :8081            │
│   /api/v1/**       → lb://core-service  :8082            │
│   /api/match/**    → http://localhost:8000               │
└───┬──────────────────────┬───────────────────────────────┘
    │                      │
┌───▼───────────┐   ┌──────▼────────┐   ┌──────────────────┐
│ AUTH SERVICE  │   │ CORE SERVICE  │   │  MATCHING AI     │
│   :8081       │   │   :8082       │   │   :8000          │
│ Spring Boot   │   │ Spring Boot   │   │ FastAPI + Python  │
│ Java 17       │   │ Java 17       │   │ TF-IDF + Gemini  │
└───────────────┘   └──────────────┘   └──────────────────┘
        │                  │
        └──────────────────┘
                   │
    ┌──────────────▼────────────────┐
    │   DISCOVERY SERVICE :8761     │
    │   Eureka Server               │
    │   Registre des microservices  │
    └───────────────────────────────┘
```

---

## Services en détail

### 1. Discovery Service — port 8761

**Rôle** : Registre de services (Eureka Server). Chaque microservice Spring Boot
s'enregistre au démarrage. Le Gateway utilise la découverte de services pour
résoudre `lb://auth-service` et `lb://core-service` avec load balancing automatique.

**Dashboard** : http://localhost:8761

---

### 2. API Gateway — port 8080

**Rôle** : Point d'entrée unique de l'API. Gère le routage vers les microservices,
la configuration CORS globale, et la déduplication des headers de réponse.

**Stack** : Spring Cloud Gateway (WebFlux / Netty)

**Routes configurées** :
| Pattern | Destination |
|---------|-------------|
| `/api/v1/auth/**` | Auth Service :8081 |
| `/api/v1/**` | Core Service :8082 |
| `/api/match/**` | Matching AI :8000 |
| `/swagger-ui/**`, `/v3/api-docs/**` | Core Service :8082 |

---

### 3. Auth Service — port 8081

**Rôle** : Authentification et gestion des comptes utilisateurs.

**Stack** : Spring Boot 3.2 · Spring Security · Spring Data JPA · H2 (dev) · JWT (JJWT 0.11)

**Fonctionnalités** :
- Inscription (`POST /api/v1/auth/register`)
- Connexion (`POST /api/v1/auth/login`) → retourne un JWT access token + refresh token
- Rafraîchissement du token (`POST /api/v1/auth/refresh`)
- Réinitialisation de mot de passe (`POST /api/v1/auth/forgot-password`)

**Sécurité JWT** :
- Algorithme : HS256
- Durée du token : 24h (configurable via `jwt.expiration`)
- Le secret JWT est **partagé** entre Auth Service et Core Service → le Core Service
  peut valider les tokens localement sans appeler Auth Service (tokens auto-suffisants)

**Base de données** : H2 in-memory `coopconnect-auth` (dev) · PostgreSQL (prod)

**DataSeeder** : Au démarrage en profil `dev`, crée automatiquement 20 utilisateurs
de démonstration avec des profils réalistes (nom, ville, coordonnées GPS, score de confiance).
Mot de passe universel : `Test1234!`

---

### 4. Core Service — port 8082

**Rôle** : Logique métier principale de la plateforme.

**Stack** : Spring Boot 3.2 · Spring Security · Spring Data JPA · H2 (dev)

**Modules** :

#### Annonces (`/api/v1/listings`)
- CRUD complet des annonces (titre, description, catégorie, type, état, localisation)
- Pagination et tri
- Recherche par mot-clé (`/search?q=...`)
- Filtrage par catégorie (`?category=TOOLS`)
- Mes annonces (`/my`) → retourne les annonces de l'utilisateur connecté
- Soft-delete (les annonces supprimées passent en statut `DELETED`, non visibles)

**Catégories disponibles** (biens physiques uniquement) :
ELECTRONICS, CLOTHING, HOME_GARDEN, TOOLS, SPORTS_OUTDOORS, BOOKS_MEDIA,
HEALTH_BEAUTY, AUTOMOTIVE, TOYS_GAMES, PETS, OTHER

> **Supprimé** : SERVICES, SKILLS_EDUCATION, TRANSPORTATION, REAL_ESTATE — CoopConnect est une
> plateforme de **troc de biens physiques** (échange non-monétaire tangible). Les prestations de
> service, formations, transport et locations immobilières ne correspondent pas au concept.

**Type d'annonce** : `ITEM` uniquement (bien physique). Les types SERVICE, SKILL, SPACE, TRANSPORT ont été supprimés.

**Statuts d'annonce** : ACTIVE, DRAFT, EXCHANGED, SUSPENDED, DELETED

#### Échanges (`/api/v1/exchanges`)
- Demande d'échange : `POST /api/v1/exchanges` (requester → provider)
- Accepter : `PUT /api/v1/exchanges/{id}/accept` → marque l'annonce comme EXCHANGED
- Refuser : `PUT /api/v1/exchanges/{id}/reject`
- Annuler : `PUT /api/v1/exchanges/{id}/cancel`
- Mes échanges : `GET /api/v1/exchanges/my`

#### Messagerie d'échange (`/api/v1/exchanges/{id}/messages`)
- Système de messages texte entre les deux parties d'un échange
- Lecture des messages : `GET /api/v1/exchanges/{id}/messages`
- Envoi d'un message : `POST /api/v1/exchanges/{id}/messages`
- Communication directe entre les deux utilisateurs concernés par l'échange

#### Profil utilisateur (`/api/v1/users`)
- Mon profil : `GET /api/v1/users/me`
- Mise à jour (prénom, nom, bio, ville, pays, téléphone) : `PUT /api/v1/users/me`
- Changement de mot de passe : `PUT /api/v1/users/me/password`

#### Matching (proxy vers Matching AI) (`/api/v1/matches`)
- Recommandations pour une annonce : `POST /api/v1/matches/listing/{id}`
  - Filtre automatiquement les annonces du même propriétaire
  - Enrichit les résultats avec les titres des annonces recommandées
  - Retourne les N meilleures correspondances avec scores et explication

**Base de données** : H2 in-memory `coopconnect-core` (dev)

---

### 5. Matching AI Service — port 8000

**Rôle** : Moteur d'intelligence artificielle de recommandation d'annonces.

**Stack** : FastAPI · Python 3.10+ · scikit-learn · NLTK · Google Generative AI

#### Comment fonctionne le moteur de matching ?

Le service reçoit une annonce "requête" et une liste d'annonces "candidates".
Pour chaque candidate, il calcule un **score composite** entre 0 et 1 à partir
de 5 dimensions. **La valeur estimée et la distance sont les deux critères dominants**
(60% du score total), reflétant la logique de troc : on échange des biens de valeur
comparable, le plus près possible.

```
Score final = Σ (poids_i × score_i)
```

| Dimension | Poids | Méthode de calcul |
|-----------|-------|-------------------|
| **Proximité de valeur estimée** | **35%** | Estimation MAD par Gemini · tolérance barter ±30% |
| **Proximité géographique** | **25%** | Distance haversine (km) entre les coordonnées GPS |
| Similarité de contenu | 20% | TF-IDF bigramme + similarité cosinus |
| Correspondance catégorie | 10% | Correspondance exacte ou catégories complémentaires |
| Complémentarité (troc) | 10% | OFFER+OFFER = 1.0, paires non-troc = 0.2 |

> **Supprimé** : le "Score de confiance" (5%) a été retiré du scoring et des explications Gemini.

---

#### Proximité de valeur estimée (35% du score) ← PRIORITÉ MAXIMALE

C'est le critère le plus important du moteur. CoopConnect est une plateforme de **troc**
(échange sans monnaie), donc recommander des biens de valeur radicalement différente
n'a aucun sens. Le moteur doit favoriser les échanges équilibrés.

**Étape 1 — Estimation à la création de l'annonce (recommandé)**

L'estimation de valeur doit être calculée **une seule fois**, au moment de la création
ou de la modification d'une annonce, et stockée dans le champ `estimatedValueMAD` de
l'entité `Listing` (à ajouter dans le Core Service).

Le Core Service appelle le Matching AI après la sauvegarde de l'annonce :
```
POST /api/match/estimate
{ "title": "...", "description": "...", "category": "...", "condition": "..." }
→ { "estimated_value_mad": 850.0, "currency": "MAD" }
```

La valeur est persistée en base et transmise dans le tableau de candidats lors du matching.
Ce design évite N appels Gemini par requête de matching (latence réduite de ~60%).

**Étape 2 — Prompt Gemini pour l'estimation (marché marocain)**

Le prompt doit contextualiser l'estimation au marché marocain :

```
Tu es un expert du marché de l'occasion au Maroc. Estime la valeur marchande
de l'objet ou service décrit ci-dessous en dirhams marocains (MAD).
Prends en compte les prix réels du marché marocain (Avito.ma, Jumia Maroc,
marchés locaux). Réponds uniquement avec un nombre entier.

Titre : {title}
Description : {description}
Catégorie : {category}
État : {condition}
```

**Étape 3 — Calcul du score de proximité de valeur**

La logique de troc tolère une marge d'écart : des biens dont les valeurs diffèrent
de moins de 30% sont considérés échangeables sans déséquilibre majeur.

```python
def value_score(val_a, val_b):
    if val_a is None or val_b is None or max(val_a, val_b) == 0:
        return 0.5  # valeur inconnue → score neutre
    ratio = abs(val_a - val_b) / max(val_a, val_b)
    # Score 1.0 si écart < 10%, décroissance douce jusqu'à 30%, puis steep
    if ratio <= 0.10:
        return 1.0
    elif ratio <= 0.30:
        return 1.0 - (ratio - 0.10) / 0.20 * 0.3   # 1.0 → 0.7
    else:
        return max(0.0, 0.7 - (ratio - 0.30) * 1.4)  # descente rapide
```

---

#### Proximité géographique (25% du score) ← 2e PRIORITÉ

Distance calculée par la formule haversine (distance orthodromique sur la sphère terrestre)
entre les coordonnées GPS des deux annonces. La fonction de score décroît avec la distance :
- 0 km → score 1.0
- 10 km → score ~0.82
- 50 km → score ~0.45
- 100 km → score ~0.22

---

#### TF-IDF bigramme (20% du score)

Chaque annonce est représentée par un vecteur TF-IDF calculé sur son titre + description.
Le vectoriseur utilise des bigrammes (paires de mots consécutifs) ce qui capture
le contexte ("tomates bio", "panneau solaire", etc.). La similarité cosinus entre
les vecteurs mesure à quel point les contenus sont proches sémantiquement.

Exemple : "Surplus 600kg tomates bio" ↔ "Recherche fournisseur légumes frais" → score élevé.

---

#### Explication générée

Pour chaque correspondance, le service génère une explication textuelle en français
décrivant pourquoi les deux annonces sont compatibles. **L'explication doit mentionner
la compatibilité de valeur estimée** (ex : "Valeurs estimées comparables : ~800 MAD / ~950 MAD").
Ne pas mentionner le score de confiance ou la fiabilité de l'utilisateur.

**Endpoints** :
```
POST /api/match/            — matching pour une liste de candidats
GET  /api/match/health      — santé du service + statut Gemini
POST /api/match/cache/clear — vider le cache des prix estimés
GET  /docs                  — Documentation Swagger interactive
```

---

### 6. Frontend — port 5173

**Stack** : React 18 · Tailwind CSS · Vite · Axios · React Router v6 · Leaflet · Lucide React

**Pages** :
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/browse` | Parcourir les annonces disponibles (filtre EXCHANGED automatique) |
| `/map` | Carte géographique des annonces (Leaflet + ESRI) |
| `/listings/:id` | Détail d'une annonce |
| `/listings/:id/edit` | Modifier une annonce (localisation via carte) |
| `/listings/create` | Créer une annonce (localisation via carte ou GPS) |
| `/listings/my` | Mes annonces actives |
| `/dashboard` | Tableau de bord |
| `/matches` | Recommandations par annonce |
| `/exchanges` | Mes demandes d'échange + messagerie |
| `/profile` | Mon profil |
| `/login` | Connexion |
| `/register` | Inscription |

**Notes développeur** :

1. **Filtre `EXCHANGED`** : Le frontend filtre les annonces au statut `EXCHANGED` côté client dans Browse et Mes annonces. Pour une solution propre, le endpoint `GET /api/v1/listings` devrait exclure les annonces échangées par défaut.

2. **Sélecteur de localisation** : Le composant `LocationPicker` (Leaflet) utilise l'API publique Nominatim (OpenStreetMap) pour le géocodage inverse. En production, prévoir un service de géocodage privé.

---

## Variables d'environnement

| Variable | Service | Valeur par défaut |
|----------|---------|-------------------|
| `GEMINI_API_KEY` | Matching AI | requis |
| `JWT_SECRET` | Auth + Core | clé de 60+ caractères |
| `JWT_EXPIRATION` | Auth | 86400000 (24h en ms) |
| `SERVER_PORT` | Auth/Core | 8081/8082 |

---

## Structure des dossiers

```
coopconnect/
├── start.ps1              ← Lanceur unique (PowerShell)
├── README.md              ← Ce fichier
│
├── discovery-service/     ← Eureka Server (Spring Boot)
├── api-gateway/           ← Spring Cloud Gateway
├── auth-service/          ← Authentification + JWT
├── backend/               ← Core Service (métier principal)
│   └── src/main/java/com/coopconnect/
│       ├── controller/    ← ListingController, ExchangeController, UserController
│       ├── service/       ← ListingService, ExchangeService, UserService, MatchingService
│       ├── domain/model/  ← Listing, Exchange, ExchangeMessage, User, ...
│       ├── repository/    ← Spring Data JPA repositories
│       ├── dto/           ← DTOs requête/réponse
│       ├── security/      ← JWT filter, SecurityConfig
│       └── config/        ← DataSeeder (données de démonstration)
│
├── matching-service/      ← Moteur IA Python
│   ├── main.py            ← Point d'entrée FastAPI
│   └── app/
│       ├── matching.py    ← Algorithme de scoring composite
│       ├── price_estimator.py ← Estimation prix via Gemini
│       ├── models.py      ← Schémas Pydantic
│       └── routers/       ← Endpoints API
│
└── frontend/              ← Interface React
    └── src/
        ├── pages/         ← Toutes les pages de l'application
        ├── components/    ← ListingCard, MatchCard, Navbar
        ├── api/           ← Clients Axios (auth.js, listings.js, users.js)
        └── context/       ← AuthContext (état de connexion global)
```

---

## Données de démonstration

**Auth Service** : 20 utilisateurs répartis dans 10 villes marocaines
(Casablanca, Rabat, Marrakech, Fes, Tanger, Agadir, Meknes, Oujda, Kenitra...)
avec des profils variés (particuliers, professionnels, entreprises, associations).

**Core Service** : 63 annonces OFFER couvrant tous les secteurs :
agriculture & alimentation, électronique, outillage, artisanat, textile,
santé, automobile, énergies renouvelables, BTP, sport, grand public, etc.
Toutes les annonces ont des coordonnées GPS réelles correspondant à leur ville.
Toutes sont de type OFFER avec une valeur estimée en MAD — aucune annonce NEED
(CoopConnect est une plateforme de **troc pur** : les deux parties doivent offrir quelque chose).

---

## Flux utilisateur principal

```
1. Inscription/Connexion  →  Auth Service émet un JWT
2. L'utilisateur publie une annonce  →  Core Service enregistre
3. L'utilisateur consulte ses recommandations  →
   Core Service → Matching AI (TF-IDF + Gemini) → résultats enrichis
4. L'utilisateur clique "Proposer un échange" sur une recommandation →
   Core Service crée un Exchange (statut REQUESTED)
5. Le propriétaire de l'annonce reçoit la demande →
   Accepte (ACCEPTED) ou Refuse (REJECTED)
6. Si accepté → l'annonce passe en statut EXCHANGED
7. Les deux parties s'envoient des messages via la messagerie d'échange
```

---

## Équipe

| Membre | Option |
|--------|--------|
| Bendahou Saad | MIAGE IA |
| Nyazi Walid | MIAGE IA |
| Qejiou Salah-Eddine | MIAGE IA |
| Tabrani El Mehdi | MIAGE MBDS |

MIAGE — Université Côte d'Azur / EMSI Casablanca — 2025-2026

---

## Changelog

| Version | Date | Changements principaux |
|---------|------|------------------------|
| V1.4 | Juin 2026 | **Troc pur** : suppression des 34 annonces NEED du DataSeeder — toutes les annonces sont désormais OFFER avec valeur estimée en MAD · **Matching** : OFFER+OFFER = complémentarité 1.0 (les deux parties ont quelque chose à donner) · **Nettoyage backend** : suppression de 16 fichiers morts (Organization, Partnership, Resource, UserSkill, Notification, ListingImage, ListingTag, ExchangeDocument, Review + leurs repositories/DTOs) et des relations JPA inutilisées dans User, Listing, Exchange |
| V1.3 | Juin 2026 | **Concept troc clarifié** : suppression catégories SERVICES/SKILLS_EDUCATION/TRANSPORTATION/REAL_ESTATE et types SERVICE/SKILL/SPACE/TRANSPORT partout (backend enum, DataSeeder, frontend) · ~40 annonces demo service retirées · **Matching AI** : poids valeur → 35%, distance → 25%, trust supprimé, price_proximity_score avec tolérance troc ±30% · Prompt Gemini MAD contextualisé marché marocain · Favicon leaf + titre onglet "CoopConnect" · Fix pagination Browse |
| V1.2 | Mai 2026 | **Matching** : poids valeur estimée → 35% (priorité max), distance → 25%, score confiance supprimé · Spécification estimation MAD via Gemini (marché marocain) · Spécification `estimatedValueMAD` dans entité Listing · Carte MapView : barre de contrôle transparente + carte arrondie avec marges · Landing : illustration échange avec fondu de bords |
| V1.1 | Mai 2026 | Sélecteur carte pour localisation · Mini-carte sur page annonce · Layout 3-col pour propriétaire · Filtre annonces échangées · Suppression horodatage et vues · Nom app → CoopConnect · Labels "IA" retirés · États vides améliorés · Accessibilité WCAG AA · Design system Refont 2026 (Manrope + Bricolage Grotesque, palette parchment/moss/clay) |
| V1.0 | 2025-2026 | Prototype initial |
