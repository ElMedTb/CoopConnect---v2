# CoopConnect AI — Architecture & Documentation Technique

## Présentation du projet

CoopConnect AI est une plateforme d'économie circulaire et de coopération économique au Maroc.
Elle permet aux particuliers, professionnels, coopératives et associations de publier des annonces
de biens ou services disponibles à l'échange, et utilise un moteur d'intelligence artificielle
pour détecter automatiquement les meilleures correspondances entre annonces.

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

**Catégories disponibles** : ELECTRONICS, CLOTHING, HOME_GARDEN, TOOLS, SERVICES,
SKILLS_EDUCATION, SPORTS_OUTDOORS, BOOKS_MEDIA, TRANSPORTATION, REAL_ESTATE,
HEALTH_BEAUTY, AUTOMOTIVE, OTHER

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
de 6 dimensions :

```
Score final = Σ (poids_i × score_i)
```

| Dimension | Poids | Méthode de calcul |
|-----------|-------|-------------------|
| Similarité de contenu | 30% | TF-IDF bigramme + similarité cosinus |
| Correspondance catégorie | 20% | Correspondance exacte ou catégories complémentaires |
| Proximité géographique | 20% | Distance haversine (km) entre les coordonnées GPS |
| Complémentarité offre/besoin | 15% | OFFER vs NEED, analyse sémantique |
| Proximité de valeur estimée | 10% | Estimation de prix par Gemini AI |
| Score de confiance | 5% | Note de confiance du propriétaire (0-5) |

#### TF-IDF bigramme (30% du score)

Chaque annonce est représentée par un vecteur TF-IDF calculé sur son titre + description.
Le vectoriseur utilise des bigrammes (paires de mots consécutifs) ce qui capture
le contexte ("tomates bio", "panneau solaire", etc.). La similarité cosinus entre
les vecteurs mesure à quel point les contenus sont proches sémantiquement.

Exemple : "Surplus 600kg tomates bio" ↔ "Recherche fournisseur légumes frais" → score élevé.

#### Proximité géographique (20% du score)

Distance calculée par la formule haversine (distance orthodromique sur la sphère terrestre)
entre les coordonnées GPS des deux annonces. La fonction de score décroît avec la distance :
- 0 km → score 1.0
- 10 km → score ~0.82
- 50 km → score ~0.45
- 100 km → score ~0.22

#### Estimation de prix par Gemini (10% du score)

Pour chaque annonce, le service appelle l'API **Gemini 2.5 Flash** (Google) avec un prompt
en français décrivant l'annonce. Gemini retourne une estimation du prix de marché en MAD.

Cette estimation est mise en **cache en mémoire** (par ID d'annonce) pour éviter
les appels répétés. La proximité de prix est calculée comme :

```
score_prix = max(0, 1 - |prix_A - prix_B| / max(prix_A, prix_B))
```

#### Explication générée

Pour chaque correspondance, le service génère une explication textuelle en français
décrivant pourquoi les deux annonces sont compatibles.

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
| `/browse` | Parcourir toutes les annonces avec filtres |
| `/map` | Carte géographique des annonces (Leaflet + ESRI) |
| `/listings/:id` | Détail d'une annonce |
| `/listings/:id/edit` | Modifier une annonce |
| `/listings/create` | Créer une annonce |
| `/listings/my` | Mes annonces |
| `/dashboard` | Tableau de bord |
| `/matches` | Recommandations IA par annonce |
| `/exchanges` | Mes demandes d'échange + messagerie |
| `/profile` | Mon profil |
| `/login` | Connexion |
| `/register` | Inscription |

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

**Core Service** : 121 annonces couvrant tous les secteurs :
agriculture & alimentation, électronique, outillage, services professionnels,
transport, formation, artisanat, immobilier, énergies renouvelables, BTP, etc.
Toutes les annonces ont des coordonnées GPS réelles correspondant à leur ville.

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

| Membre | Spécialité |
|--------|------------|
| Bendahou Saad | MIAGE IA |
| Nyazi Walid | MIAGE IA |
| Qejiou Salah-Eddine | MIAGE IA |
| Tabrani El Mehdi | MIAGE IA |

MIAGE — Université Côte d'Azur / EMSI Casablanca — 2025-2026
