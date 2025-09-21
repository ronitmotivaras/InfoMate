# InfoMate Backend

This Express server parses `document.pdf` (one-time on startup) and uses Google Gemini to answer questions grounded in that content. The PDF never leaves the backend and is not exposed to the client.

Setup:
1. Create `server/.env` with your API key:

   GOOGLE_API_KEY=your_gemini_api_key

   Optional:
   GEMINI_MODEL=gemini-1.5-flash
   PORT=5050

2. Install deps from project root and start:
   - npm install
   - npm run dev (starts backend + frontend concurrently)

Endpoints:
- POST /api/chat { message: string, history?: Array<{role: 'user'|'model', content: string}> }
  -> { answer: string }
