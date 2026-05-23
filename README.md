# 🤖 AI Resume Screening System

> An NLP-powered resume screening and candidate ranking system — Final Year Project

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3-green?logo=flask)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Project Overview

The AI Resume Screening System automates the process of shortlisting candidates by comparing resumes against job descriptions using Natural Language Processing (NLP). It extracts skills, calculates match scores, identifies skill gaps, and ranks candidates — saving HR teams hours of manual work.

### Key Features
- 📄 Upload resumes as PDF or DOCX
- 🧠 NLP-based skill extraction using spaCy
- 📊 Match score calculation with ranking
- 🔍 Skill gap analysis per candidate
- 🏆 Auto-ranking dashboard
- 📧 Admin panel with filter & export
- 🔐 JWT-based authentication

---

## 🏗️ Architecture

```
resume-screening-ai/
│
├── frontend/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Screen, Dashboard, Admin pages
│       └── utils/             # API helpers, constants
│
├── backend/                   # Flask REST API
│   ├── app.py                 # Main entry point
│   ├── config.py              # Configuration
│   ├── routes/
│   │   ├── resume.py          # Resume upload & analysis endpoints
│   │   └── auth.py            # Authentication endpoints
│   ├── services/
│   │   ├── nlp_engine.py      # Core NLP skill extraction
│   │   ├── matcher.py         # Resume vs JD matching
│   │   └── parser.py          # PDF/DOCX text extraction
│   └── models/
│       └── candidate.py       # MongoDB models
│
├── uploads/                   # Uploaded resumes (gitignored)
├── docs/                      # Project documentation
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS |
| Backend | Python 3.10+, Flask |
| NLP | spaCy, NLTK |
| Resume Parsing | PyPDF2, python-docx |
| Database | MongoDB |
| Auth | JWT (Flask-JWT-Extended) |
| AI Scoring | Claude API (Anthropic) |

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB 4.0+ (running locally or cloud instance)
- pip & npm

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/resume-screening-ai.git
cd resume-screening-ai
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
cd backend
python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/resume_screening
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
```

Get your API key at: https://console.anthropic.com

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload and analyze a resume |
| POST | `/api/resume/analyze-text` | Analyze resume from raw text |
| GET | `/api/candidates` | Get all candidates (ranked) |
| GET | `/api/candidates/:id` | Get single candidate detail |
| DELETE | `/api/candidates/:id` | Delete a candidate |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/stats` | Dashboard statistics |

---

## 🧠 How the NLP Works

```
Resume Text → Text Extraction → Skill Identification → Score Calculation → Ranking
     ↓               ↓                  ↓                    ↓               ↓
  PDF/DOCX       PyPDF2/docx         spaCy NER          Match Formula    SQLite DB
```

**Match Formula:**
```
Match % = (Matched Skills / Total JD Skills) × 100
```

**Example:**
- JD Skills: Python, SQL, AWS, Docker (4 total)
- Resume has: Python, SQL (2 matched)
- Match = 2/4 × 100 = **50%**

---

## 📸 Screenshots

> Add screenshots of your app here for the project report

| Screen | Dashboard | Admin Panel |
|---|---|---|
| ![screen]() | ![dashboard]() | ![admin]() |

---

## 🎓 Viva Explanation

> **"The system uses NLP techniques — specifically named entity recognition and keyword matching via spaCy — to extract skills from uploaded resumes. These are then compared against parsed job description requirements to generate a percentage match score. Candidates are ranked in descending order of this score, with skill gap analysis highlighting missing competencies."**

---

## 👨‍💻 Author

**Your Name**  
Final Year B.Tech / MCA Project  
[GitHub](https://github.com/YOUR_USERNAME) · [LinkedIn](https://linkedin.com/in/YOUR_PROFILE)

---

## 📄 License

MIT License — free to use for academic purposes.
