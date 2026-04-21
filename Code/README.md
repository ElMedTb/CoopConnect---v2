# CoopConnect AI 🚀

Plateforme d'économie circulaire pour coopératives, TPE, artisans et particuliers.

## 🎯 Fonctionnalités

- 👥 Gestion utilisateurs (Particulier/Coop/Admin)
- 🔐 Authentification OTP + JWT
- 📦 Annonces (Offre/Besoin/Don)
- 🤖 Matching IA intelligent
- 💬 Chat temps réel
- 🤝 Workflow d'échange sécurisé

## 🚀 Quick Start (Windows)

```cmd
REM 1. Démarrer DB + Redis
docker-compose up -d

REM 2. Backend setup (after creating backend/)
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

REM 3. Frontend (after creating frontend/)
cd frontend
npm install
npm run dev
```

## 📱 URLs

- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173
- **PostgreSQL**: localhost:5432 (coopconnect/coopconnect123)

## 🗂️ Structure

```
CoopConnectAI_V0/
├── backend/          # FastAPI API
├── frontend/         # React App
├── docker-compose.yml
├── .env.example
└── TODO.md          # Progress tracker
```

## 🔧 Configuration

Copier `.env.example` → `.env` et ajuster les clés.

## Progress

Voir [TODO.md](./TODO.md)
