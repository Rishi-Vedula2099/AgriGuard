# 🌱 AgriGuard — Premium AI Crop Health & Productivity Platform

AgriGuard is a state-of-the-art, full-stack AI ecosystem designed to revolutionize agriculture. Built specifically for the modern agricultural landscape, it empowers **Farmers** with real-time disease detection and **Students** with a comprehensive learning marketplace, all driven by the power of **Google Gemini 1.5 Pro & Flash**.

![AgriGuard Desktop](https://img.shields.io/badge/AgriGuard-v2.0.0--Production-16A34A?style=for-the-badge&logo=leaf&logoColor=white)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%201.5-4285F4?style=flat-square&logo=google-gemini)

---

## 🚀 One-Step Startup (Recommended)

The easiest way to start the entire AgriGuard ecosystem is via **Docker Compose**. This will automatically launch the PostgreSQL database, the Backend, the ML service, the AI assistant, and the Web frontend in a single network.

> [!IMPORTANT]
> **Prerequisite:** Ensure you have **Docker Desktop** installed and running. Create a `.env` file in the root with your `GOOGLE_API_KEY`.

```bash
# Start all 5 services at once
docker-compose up --build
```
*Access the dashboard at [http://localhost:3000](http://localhost:3000)*

---

## 🏃 Manual Development Startup

If you are developing and need to run services individually, follow this terminal-by-terminal sequence. Each command should be executed from the **root directory**.

### 1. Database (Postgres)
Ensure the database is running on its own first (port 5433):
```cmd
docker run --name agriguard-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=agriguard -p 5433:5432 -d postgres
```

### 2. Backend API (Port 8000)
```cmd
cd apps/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 3. ML Service (Port 8001)
```cmd
cd apps/ml-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

### 4. AI Assistant (Port 8002)
```cmd
cd apps/ai-assistant
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8002
```

### 5. Web Frontend (Port 3000)
```cmd
cd apps/web
npm install
npm run dev
```

---

## ✨ Features Breakdown

### 🛡️ Role-Based Access Control (RBAC)
- **Farmer Identity:** Dedicated dashboard for crop monitoring, weather advisories, and real-time scanning.
- **Student Identity:** A specialized Learning Hub to browse expert sessions, book appointments with farmers, and manage agricultural notes.

### 📸 Real-Time AI Vision (Gemini 1.5 Flash)
- **Accurate Crop Detection:** Moves beyond static models to accurately identify exact crop species and varieties in real-time.
- **Expert Pathologist Analysis:** Uses Google's Vision AI to provide high-confidence disease diagnosis, explaining symptoms, causes, and precise treatment plans.

### 🤖 Intelligent AgroBuddy Assistant (Gemini 1.5 Pro)
- Conversational AI powered by the latest **Gemini 1.5 Pro** model.
- Context-aware responses tailored to regional Indian agricultural needs.

---

## 🏗️ System Architecture

```text
AgriGuard/
├── apps/
│   ├── web/              → Next.js 14 Premium Frontend (Tailwind, Framer Motion)
│   ├── backend/          → FastAPI Core (Python, SQLAlchemy, PostgreSQL)
│   ├── ml-service/       → Real-time Vision Service (Gemini 1.5 Flash Integration)
│   └── ai-assistant/     → AgroBuddy Conversational Service (Gemini 1.5 Pro)
├── packages/
│   ├── promis/           → Specialized LLM Prompt Engineering templates
│   └── schemas/          → Shared pydantic data models
└── storage/
    └── docker/           → PostgreSQL 16 containerized infrastructure
```

---

## 🛠️ Tech Stack Highlights
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
- **Backend API**: Python FastAPI, Pydantic v2, SQLAlchemy.
- **Database**: **PostgreSQL 16 (Port 5433)**.
- **Intelligence**: **Google Gemini 1.5** (Pro and Flash).

---

## 📄 License
MIT License — Driving the future of Indian Agriculture with ❤️
