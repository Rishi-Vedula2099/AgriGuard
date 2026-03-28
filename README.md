# 🌱 AgriGuard — AI-Powered Agricultural Ecosystem

A full-stack AI-powered platform designed to help Indian farmers detect crop diseases, analyze field-level crop health, and improve yield using intelligent insights, computer vision, and conversational AI.

![AgriGuard](https://img.shields.io/badge/AgriGuard-v1.0.0-16A34A?style=for-the-badge&logo=leaf&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![PyTorch](https://img.shields.io/badge/PyTorch-ML-EE4C2C?style=flat-square)

---

## 🚀 Features

### 📸 Leaf-Level Disease Detection
- Upload a close-up leaf image
- AI detects disease name with confidence score
- Explains symptoms, causes, and treatments

### 🌾 Field Scan / Segmentation Analysis
- Upload a field/crop patch image
- U-Net segmentation generates pixel-level disease mask
- Reports % infected area, severity, spread pattern
- Provides area-based treatment strategy

### 🤖 AgroBuddy (AI Chatbot)
- Conversational farming assistant
- Answers questions about diseases, fertilizers, irrigation, seasonal crops
- Powered by LLM + RAG knowledge base
- Prefers low-cost, organic solutions

### 📊 Analytics & Insights
- Disease trends over time
- Crop health score
- Scan analytics and severity breakdown

### 🌦️ Weather Advisory
- Rain alerts and humidity warnings
- Seasonal crop recommendations

---

## 🏗️ Architecture

```
AgriGuard/
├── apps/
│   ├── web/              → Next.js 14 frontend (TypeScript, Tailwind, ShadCN)
│   ├── backend/          → FastAPI main API (Python)
│   ├── ml-service/       → ML inference service (PyTorch)
│   └── ai-assistant/     → AgroBuddy chatbot service (LangChain)
├── packages/
│   ├── schemas/          → Shared Pydantic models
│   ├── utils/            → Shared utilities
│   └── prompts/          → LLM prompt templates
├── storage/
│   ├── uploads/          → User uploaded images
│   ├── dataset/          → Training data
│   ├── models/           → Trained model weights
│   ├── knowledge-base/   → Agricultural knowledge docs
│   └── embeddings/       → FAISS vector indices
└── scripts/              → Training scripts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Query |
| Backend API | Python FastAPI, SQLAlchemy, JWT Auth |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ML Models | PyTorch EfficientNet-B0 (classification), U-Net (segmentation) |
| Image Processing | OpenCV |
| Chatbot | LangChain, OpenAI GPT-4o-mini, FAISS |
| Storage | Local filesystem |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- pip

### 1. Clone & Setup

```bash
git clone https://github.com/Rishi-Vedula2099/AgriGuard.git
cd AgriGuard
cp .env.example .env
```

### 2. Backend

```bash
cd apps/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. ML Service

```bash
cd apps/ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 4. AI Assistant

```bash
cd apps/ai-assistant
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

### 5. Frontend

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Crop health overview, quick scan, weather advisory |
| Smart Scan | `/scan` | Camera/upload UI with AI scan animation |
| Leaf Result | `/scan/result` | Disease diagnosis with symptoms, treatment tabs |
| Field Result | `/scan/field-result` | Heatmap overlay, infection %, severity analysis |
| History | `/history` | Timeline of past scans with filters |
| Insights | `/insights` | Analytics charts, disease distribution |
| AgroBuddy | `/chat` | AI chatbot with quick prompts |
| Profile | `/profile` | Preferences, region, language |
| Auth | `/auth` | OTP-based phone login |

---

## 🔌 API Endpoints

### Auth
- `POST /api/v1/auth/send-otp` — Send OTP
- `POST /api/v1/auth/verify-otp` — Verify OTP & get JWT
- `GET /api/v1/auth/me` — Get profile
- `PUT /api/v1/auth/me` — Update profile

### Scan
- `POST /api/v1/scan/leaf` — Leaf disease scan
- `POST /api/v1/scan/field` — Field segmentation scan
- `GET /api/v1/scan/{id}` — Get scan result

### History
- `GET /api/v1/history/` — Paginated scan history
- `DELETE /api/v1/history/{id}` — Delete scan

### Analytics
- `GET /api/v1/analytics/dashboard` — Dashboard stats
- `GET /api/v1/analytics/trends` — Disease trends
- `GET /api/v1/analytics/scans` — Scan analytics

### Chat (AgroBuddy)
- `POST /api/v1/chat` — Send message
- `GET /api/v1/chat/history/{session_id}` — Chat history
- `GET /api/v1/chat/suggestions` — Quick prompts

---

## 🧠 ML Models

### Leaf Disease Classification
- **Architecture**: EfficientNet-B0
- **Dataset**: PlantVillage (38 classes)
- **Input**: 224x224 leaf image
- **Output**: Disease name + confidence score

### Field Segmentation
- **Architecture**: U-Net
- **Input**: 256x256 field image
- **Output**: Binary disease mask → % infected area, severity, spread pattern

> **Note**: The system runs in demo mode with realistic mock predictions when no trained models are available.

---

## 🇮🇳 Made for Indian Farmers

- Simple, jargon-free language
- Mobile-first design
- Low-cost organic solutions prioritized
- Regional crop and weather context
- Phone-based auth (no email required)

---

## 📄 License

MIT License — Built with ❤️ for Indian agriculture
