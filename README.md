# 🏥 MedAuth AI — Autonomous Healthcare Prior Authorization Engine

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-4285F4?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Fallback-F05032)](https://groq.com/)
[![Ollama](https://img.shields.io/badge/AI-Ollama%20Local-000000?logo=ollama&logoColor=white)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**MedAuth AI** is a state-of-the-art, autonomous **multi-agent AI platform** built to revolutionize the Healthcare Prior Authorization (PA) process. By orchestrating specialized AI agents, MedAuth AI automates document extraction, clinical necessity assessment, insurance policy compliance checking, and escalation management — reducing authorization turnaround times from **days/weeks down to seconds**.

---

## 📌 Table of Contents

- [Overview & Value Proposition](#-overview--value-proposition)
- [Multi-Agent Architecture](#-multi-agent-architecture)
- [Key Features & Role-Based Portals](#-key-features--role-based-portals)
- [Resilient AI & LLM Engine](#-resilient-ai--llm-engine)
- [Repository Structure](#-repository-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Sample Test Documents](#-sample-test-documents)
- [License](#-license)

---

## 💡 Overview & Value Proposition

Traditional Prior Authorization is one of healthcare's largest administrative bottlenecks. Healthcare providers spend hundreds of hours navigating complex payer guidelines, filling out forms, submitting medical records, and waiting for manual reviews.

**MedAuth AI solves this by introducing an end-to-end autonomous decisioning system:**

- ⚡ **Instant Processing**: Converts hours of manual review into real-time evaluations (< 5 seconds per case).
- 🔍 **Transparent & Auditable**: Every decision includes exact clinical citations, policy section references, and full audit logs.
- 🤝 **Human-in-the-Loop Governance**: Low-confidence cases or complex edge cases are automatically flagged and pre-summarized for physician review.
- 🔐 **Payer-Agnostic Compliance**: Dynamically checks cases against configurable insurer rules (CPT codes, ICD-10 criteria, step therapy prerequisites).

---

## 🤖 Multi-Agent Architecture

MedAuth AI employs an event-driven **4-Agent Sequential Pipeline** managed by an Orchestrator service. Each agent specializes in a distinct domain of the prior authorization workflow:

```
                  ┌─────────────────────────────────────────┐
                  │       Uploaded Medical Record           │
                  │        (PDF / Clinical Text)            │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ 1. Document Agent                                                   │
    │    • Extracts structured patient, diagnosis & procedure data        │
    │    • Parses ICD-10 & CPT codes, physician details, clinical summary │
    └──────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ 2. Clinical Agent                                                   │
    │    • Assesses medical necessity based on standard criteria          │
    │    • Evaluates conservative treatment & urgency indicators          │
    └──────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ 3. Policy Agent                                                     │
    │    • Cross-references data with Insurer Policy Guidelines           │
    │    • Verifies coverage, step therapy, and section criteria          │
    └──────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ 4. Escalation Agent (Governance Engine)                             │
    │    • Calculates overall Confidence Score (0–100)                    │
    │    • Determines final verdict: Approved | Denied | Escalated        │
    │    • Generates physician review summary if escalated                │
    └─────────────────────────────────────────────────────────────────────┘
```

### Agent Breakdown

| Agent | Icon | Function & Description | Output Payload |
| :--- | :---: | :--- | :--- |
| **Document Agent** | 📄 | Parses clinical notes/PDFs and extracts structured metadata using LLMs. | `patientName`, `ICD-10`, `CPT codes`, `requestedProcedure`, `clinicalSummary` |
| **Clinical Agent** | 🩺 | Evaluates clinical medical necessity, indicators, step therapy attempts, and urgency. | `medicallyNecessary` (boolean), `rationale`, `indicators`, `confidence` |
| **Policy Agent** | 📋 | Checks requested procedure against insurer policy rules and coverage criteria. | `covered`, `policySection`, `citedRule`, `unmetRequirements`, `recommendation` |
| **Escalation Agent**| ⚖️ | Synthesizes previous agent outputs, computes confidence, enforces human-in-the-loop rules. | `requiresHuman`, `confidenceScore`, `overallRecommendation`, `decisionExplanation`, `summary` |

---

## ✨ Key Features & Role-Based Portals

### 🌐 Portals & Dashboards

1. **👨‍⚕️ Doctor Portal (`upload.html`, `doctor-portal.html`)**
   - Upload clinical documents (PDF or plain text).
   - View structured extraction in real-time.
   - Track prior authorization request status instantly.

2. **👤 Patient Portal (`patient-portal.html`)**
   - Clean, patient-facing view of case status.
   - Clear, plain-English explanations of authorization decisions without complex medical jargon.

3. **🛡️ Admin & Reviewer Dashboard (`dashboard.html`, `admin-portal.html`)**
   - High-level analytical metrics (Total cases, approval/denial rates, avg processing time).
   - Live stream of processing cases via Server-Sent Events (SSE).
   - Case review workspace for medical directors to approve, deny, or review escalated requests.
   - Real-time immutable **Audit Log Viewer**.

4. **📑 PDF Decision Letter Generator (`createPdf.js`)**
   - Built-in PDFKit integration that automatically generates downloadable determination letters complete with patient details, policy citations, and audit signatures.

---

## 🧠 Resilient AI & LLM Engine

MedAuth AI features a zero-downtime, multi-tier LLM execution engine designed for high availability and strict JSON output compliance:

- **Primary Provider**: **Google Gemini 2.0 Flash** (`gemini-2.0-flash`) via official Generative Language API (`system_instruction` support).
- **Fallback Provider**: **Groq API** (`llama-3.3-70b-versatile` / `mixtral-8x7b`) — automatically activated if Gemini API key is missing or rate-limited.
- **Local / Offline Mode**: Compatible with **Ollama** (`llama3:8b`, `mistral:7b`) for fully local, HIPAA-compliant on-premise execution.
- **Robustness Mechanisms**: Automated prompt retry on JSON parse failures, response sanitization, and fallback triggers.

---

## 📂 Repository Structure

```
MedAuth-AI/
└── medauth-ai/
    ├── client/                         # Frontend Application (Vanilla JS / HTML5 / CSS3)
    │   ├── assets/                     # Styles, navigation utilities, static assets
    │   │   ├── styles.css
    │   │   └── nav.js
    │   ├── components/                 # Reusable UI components (agent cards, metrics, navbar)
    │   ├── pages/                      # Page templates
    │   │   ├── landing.html            # Product landing page
    │   │   ├── select-user.html         # User role switcher
    │   │   ├── doctor-portal.html      # Doctor submission interface
    │   │   ├── upload.html             # Document upload modal
    │   │   ├── processing.html         # Live SSE processing pipeline visualization
    │   │   ├── result.html             # Final case decision view
    │   │   ├── patient-portal.html     # Patient status portal
    │   │   ├── admin-portal.html       # Reviewer workspace
    │   │   └── dashboard.html          # Analytics dashboard
    │   └── samples/                    # Sample test files for instant demo
    │
    ├── server/                         # Backend API Server (Node.js & Express)
    │   ├── agents/                     # Specialized AI Agent implementations
    │   │   ├── documentAgent.js        # Document extraction agent
    │   │   ├── clinicalAgent.js        # Medical necessity evaluation agent
    │   │   ├── policyAgent.js          # Insurer policy compliance agent
    │   │   └── escalationAgent.js      # Governance & decision escalation agent
    │   ├── config/                     # Configurations (MongoDB, Gemini API, Groq API)
    │   │   ├── db.js
    │   │   ├── gemini.js
    │   │   └── groq.js
    │   ├── models/                     # MongoDB Mongoose Models
    │   │   ├── Case.js                 # PA Case model with agent outputs
    │   │   ├── Patient.js              # Patient profile model
    │   │   ├── Insurer.js              # Insurer policy & rules model
    │   │   └── AuditLog.js             # Immutability audit logging model
    │   ├── routes/                     # REST API Endpoints
    │   │   ├── cases.js
    │   │   ├── patients.js
    │   │   ├── insurers.js
    │   │   ├── dashboard.js
    │   │   ├── upload.js
    │   │   └── auditlogs.js
    │   ├── seed/                       # Database seed scripts
    │   │   └── seedInsurers.js         # Payer policy rules seeder
    │   ├── services/                   # Business logic & event bus
    │   │   ├── orchestrator.js         # Sequential multi-agent pipeline orchestrator
    │   │   ├── eventBus.js             # Node EventEmitter for SSE
    │   │   └── scorer.js               # Confidence calculation helper
    │   ├── createPdf.js                # PDF determination letter generator
    │   └── index.js                    # Express server entry point
    │
    ├── scripts/                        # Utility maintenance scripts
    ├── test_documents/                 # Sample patient PDF medical records
    └── render.yaml                     # Cloud deployment configuration for Render
```

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, MongoDB / Mongoose, PDFKit, `pdf-parse`, Multer.
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Modern CSS3 (Glassmorphism, CSS Variables, Flexbox/Grid), Server-Sent Events (SSE).
- **AI / Machine Learning**: Google Gemini 2.0 Flash, Groq Cloud API, Ollama (Llama 3 / Mistral).
- **Deployment & Cloud**: Render Web Service ready (`render.yaml`).

---

## 🚀 Getting Started & Local Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher) & **npm**
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string)
- **Google Gemini API Key** (Free tier available at [Google AI Studio](https://aistudio.google.com/)) *(Optional if using Groq or Ollama)*

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Abhijitgo08/MedAuth-AI.git
cd MedAuth-AI/medauth-ai
```

---

### Step 2: Configure Environment Variables

Navigate to the `server` directory and create a `.env` file:

```bash
cd server
cp .env.example .env  # Or create .env manually
```

Add your credentials to `server/.env`:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medauth-ai
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.0-flash
GROQ_API_KEY=your_groq_api_key_optional
```

---

### Step 3: Install Dependencies & Seed Database

```bash
# Install server dependencies
npm install

# Seed insurer policy rules into MongoDB
npm run seed
```

---

### Step 4: Run the Application

Start the backend server:

```bash
# Development mode with nodemon
npm run dev

# Or standard production start
npm start
```

Once started, the server will output:
```
Server running on port 3001
Frontend Client ready! Open this link: http://localhost:3001
```

Open your browser and navigate to:
👉 **`http://localhost:3001`**

*(Note: The server statically serves the frontend application directly!)*

---

## 🔌 API Reference

### 📋 Cases API (`/api/cases`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cases` | Fetch all PA cases (supports filter by status or patientId). |
| `POST` | `/api/cases` | Submit a new Prior Authorization request and trigger Orchestrator. |
| `GET` | `/api/cases/:id` | Fetch specific case details and agent outputs. |
| `PUT` | `/api/cases/:id/status` | Update case status manually (e.g., Physician Review override). |
| `GET` | `/api/cases/:id/pdf` | Download official PDF determination report. |

### 📄 Upload & SSE API (`/api/upload`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload PDF/text file and extract content for authorization. |
| `GET` | `/api/upload/stream/:caseId` | Server-Sent Events (SSE) stream for live agent progression updates. |

### 📊 Dashboard & Health API (`/api/dashboard`, `/api/health`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Summary statistics (approval rate, average confidence, total volume). |
| `GET` | `/api/auditlogs` | Retrieve full immutable audit trail of agent operations. |
| `GET` | `/api/health` | General server health check. |
| `GET` | `/api/health/db` | MongoDB connection status check. |
| `GET` | `/api/health/ai` | AI service & Gemini API configuration health check. |

---

## ☁️ Deployment

MedAuth AI is pre-configured for one-click deployment on **Render** using `render.yaml`.

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and create a **New Blueprint Instance**.
3. Select your `MedAuth-AI` repository.
4. Set your Environment Variables (`MONGODB_URI`, `GEMINI_API_KEY`) in the Render Dashboard.
5. Deploy!

---

## 🧪 Sample Test Documents

Sample medical records are included in the repository for testing prior authorization evaluations:
- `test_documents/patient_rahul_cardiology_record.pdf` (Cardiology case)
- `test_documents/patient_sarah_ortho_records.pdf` (Orthopedic knee surgery case)
- `medauth-ai/sample_cardiology_request.txt`
- `medauth-ai/comprehensive_ortho_record.txt`

You can upload these files directly via the **Doctor Portal** to experience the multi-agent decision pipeline in real-time.

---
