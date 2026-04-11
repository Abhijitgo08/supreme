# MedAuth AI

An AI-powered Prior Authorization system.

## Setup Instructions

1. **Install Ollama**
   Download and install Ollama from [ollama.com](https://ollama.com).
   Once installed, open a terminal and pull the required models:
   ```bash
   ollama pull llama3:8b
   ollama pull mistral:7b
   ```

2. **Environment Setup**
   Ensure `server/.env` is properly populated with your MongoDB connection string.

3. **Install & Run**
   Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   npm run seed
   npm run dev
   ```

4. **Launch Frontend**
   Open `client/pages/landing.html` directly in your browser. Since we use a CDN architecture, no frontend build tool is required!
