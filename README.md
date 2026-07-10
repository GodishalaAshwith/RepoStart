# RepoStart - Local AI Onboarding Engine

RepoStart is a containerized, AI-powered onboarding assistant designed to democratize repository knowledge without relying on external LLM APIs or cloud services. By leveraging local Natural Language Processing (NLP) with `sentence-transformers` and `faiss-cpu`, RepoStart securely processes structural documentation directly on your machine and offers a sleek chat interface to answer your setup and architectural questions.

---

## 🚀 Features
- **100% Local AI:** No data leakage, no paid API keys. Computations happen locally.
- **Context-Aware Search:** Uses vector embeddings and semantic similarity to fetch exact documentation snippets.
- **Modern UI:** Built with React, Vite, and custom CSS featuring glassmorphism and smooth animations.
- **Containerized:** Ready-to-go Docker setup for seamless environment parity.

## 🛠️ Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (for Method 1)
- [Python 3.11+](https://www.python.org/downloads/) (for Method 2)
- [Node.js 18+](https://nodejs.org/) (for Method 2)

---

## 🐳 Method 1: Running with Docker (Recommended)

Running with Docker is the easiest way to start the application, as it handles all system dependencies (like C++ build tools required by vector databases) automatically.

1. **Clone the repository and navigate into it:**
   ```bash
   # git clone <your-repo-url>
   cd RepoStart
   ```

2. **Build and start the containers:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - Frontend UI: `http://localhost:80` (or simply `http://localhost`)
   - Backend API: `http://localhost:8000`

*To stop the application, press `CTRL+C` or run `docker compose down` in another terminal.*

---

## 💻 Method 2: Running Locally via Terminal

If you prefer to run the application outside of Docker, you will need to start the backend and frontend separately.

### 1. Start the Backend (FastAPI)
Open a new terminal window and navigate to the project root:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*Note: The first time you ingest a repository, the backend will download the `all-MiniLM-L6-v2` model weights (~80MB).*

### 2. Start the Frontend (React + Vite)
Open a second terminal window and navigate to the project root:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```
- Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

---

## 📖 How to Use

1. **Connect a Repository:** On the main screen, paste a standard GitHub URL (e.g., `https://github.com/tiangolo/fastapi`).
2. **Ingestion:** Click "Ingest". The backend will fetch the `README.md` and `CONTRIBUTING.md` files, chunk the text, compute vector embeddings, and store them in the local FAISS index.
3. **Ask Questions:** Once the ingestion is complete, the Chat Interface will appear. Ask questions like *"How do I run this project locally?"* or *"What is the main architecture?"* to receive context-matched documentation snippets instantly.
