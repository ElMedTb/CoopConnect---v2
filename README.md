# CoopConnect

Plateforme d'économie circulaire et de coopération économique au Maroc.

**Projet académique** — MIAGE · Université Côte d'Azur / EMSI Casablanca · 2025–2026

---

## Équipe

| Membre | Option |
|---|---|
| Bendahou Saad | MIAGE IA |
| Nyazi Walid | MIAGE IA |
| Qejiou Salah-Eddine | MIAGE IA |
| Tabrani El Mehdi | MIAGE MBDS |

---

## Le projet

CoopConnect permet aux particuliers, professionnels, coopératives et associations de publier des annonces de biens ou services disponibles à l'échange. Un moteur de matching détecte automatiquement les meilleures correspondances entre annonces.

La plateforme s'appuie sur l'IA pour :
- analyser les **besoins** et **surplus** (produits, services, ressources) ;
- recommander des partenariats **mutuellement bénéfiques** (matching offre ↔ demande) ;
- prédire les **tendances du marché local** pour anticiper la demande ;
- détecter des opportunités d'**économie circulaire** (déchets/ressources des uns → intrants pour les autres) ;
- réduire le **gaspillage**, les **coûts de transport**, et renforcer un écosystème local **résilient** et **durable**.

---

## Documents du projet

- [Business Plan — CoopConnect AI v02](Business_Plan_Projet_CoopConnect_AI_version02.pdf)
- [Plan de financement](Financement_Coop_Connect.pdf)

---

## Structure du dépôt

```
coopconnect-git/
├── coopconnectCodeV1/          ← Code du prototype (V1)
│   ├── start.ps1               ← Lanceur unique (PowerShell)
│   ├── discovery-service/      ← Registre Eureka (Spring Boot)
│   ├── api-gateway/            ← API Gateway (Spring Cloud Gateway)
│   ├── auth-service/           ← Authentification + JWT (Spring Boot)
│   ├── backend/                ← Core Service — logique métier (Spring Boot)
│   ├── matching-service/       ← Moteur IA de matching (Python / FastAPI)
│   └── frontend/               ← Interface utilisateur (React + Vite)
│
├── Business_Plan_Projet_CoopConnect_AI_version02.pdf
├── Financement_Coop_Connect.pdf
└── README.md
```

---

## Technologies utilisées

| Composant | Technologie |
|---|---|
| Frontend | React 18 · Tailwind CSS · Vite · React Router v6 · Leaflet |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Auth Service | Spring Boot 3.2 · Spring Security · JWT (JJWT) · H2 |
| Core Service | Spring Boot 3.2 · Spring Data JPA · H2 |
| Matching AI | Python 3.10 · FastAPI · scikit-learn · NLTK · Google Gemini |
| Registre | Netflix Eureka Server |

---

## Prérequis

- Java 17+
- Maven 3.8+
- Node.js 18+
- Python 3.10+
- Une clé API Google Gemini (`GEMINI_API_KEY`)

---

## Lancer le prototype

### En une commande (Windows)

Depuis le dossier `coopconnectCodeV1/`, faire un **clic droit sur `start.ps1`** → **"Exécuter avec PowerShell"**.

> Si Windows bloque l'exécution, ouvrir PowerShell et taper :
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
> puis relancer `start.ps1`.

Le script démarre les 6 services dans le bon ordre et ouvre automatiquement le navigateur sur `http://localhost:5173` après environ 90 secondes.

### Lancement service par service

```powershell
# 1. Discovery Service (Eureka)
cd discovery-service
mvn spring-boot:run

# 2. API Gateway
cd api-gateway
mvn spring-boot:run

# 3. Auth Service
cd auth-service
mvn spring-boot:run

# 4. Core Service
cd backend
mvn spring-boot:run

# 5. Matching AI
cd matching-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 6. Frontend
cd frontend
npm install
npm run dev
```

### Ports utilisés

| Service | Port | URL |
|---|---|---|
| Frontend | 5173 | http://localhost:5173 |
| API Gateway | 8080 | http://localhost:8080 |
| Auth Service | 8081 | — |
| Core Service | 8082 | http://localhost:8082/swagger-ui.html |
| Matching AI | 8000 | http://localhost:8000/docs |
| Eureka Dashboard | 8761 | http://localhost:8761 |

### Compte de démonstration

```
Identifiant : ahmed.benali
Mot de passe : Test1234!
```

---

## Documentation technique détaillée

Voir [`coopconnectCodeV1/README.md`](coopconnectCodeV1/README.md) pour l'architecture complète, le détail de chaque service, les endpoints API, et le fonctionnement du moteur de matching.

---

## Changelog frontend (V1 → V1.1)

### Accessibilité & qualité
- Tous les boutons icône-seul ont un `aria-label`
- Formulaires : associations `htmlFor`/`id` sur tous les champs
- `text-stone-400` remplacé par `text-stone-500` pour le texte de contenu (contraste WCAG AA)
- `window.confirm` / `alert()` remplacés par des confirmations inline dans l'interface
- `prefers-reduced-motion` respecté globalement

### UX & flux
- **Saisie de localisation** : l'adresse texte est remplacée par un sélecteur de carte (Leaflet, clic ou GPS) dans les formulaires Créer/Modifier une annonce
- **Page d'annonce** (visiteur) : mini-carte de localisation affichée sous la description si coordonnées disponibles
- **Page d'annonce** (propriétaire) : mise en page 3 colonnes — carte | description | détails — avec les recommandations en bas
- **Annonces échangées** (`status = EXCHANGED`) masquées dans Browse et Mes annonces
- **Horodatage** ("Il y a X minutes") retiré des cartes d'annonce
- **Compteur de vues** retiré de la page détail d'annonce
- **Premier accès** : tableau de bord simplifié pour les nouveaux utilisateurs (sans les stats à zéro)
- États vides améliorés dans Recommandations, Échanges et Tableau de bord

### Nomenclature
- Nom de l'application : "CoopConnect AI" → "CoopConnect"
- Labels "IA" retirés de la navigation et des titres de page ("Mes matchs IA" → "Mes matchs", etc.)
- Crédit académique retiré du footer de la landing page

### Landing page
- Stats remplacées par une ligne de preuve textuelle (suppression du pattern "hero metrics")
- Section fonctionnalités remplacée par une démo produit interactive (maquettes d'annonce + résultats de matching)

### Matching / Recommandations
- Texte "Utilisateur fiable" et scores de confiance filtrés côté frontend dans les explications des correspondances *(note : à supprimer côté matching-service dans le prompt Gemini pour une solution définitive)*
- Distance + adresse de localisation affichées ensemble dans les cartes de correspondance (si le service retourne `locationText` dans la réponse)
