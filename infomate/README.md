# InfoMate

InfoMate is a React app with a Node/Express backend. The backend parses a private PDF and uses Gemini for grounded answers. The PDF never appears on the frontend.

## Quick start

1) Create `server/.env` from `server/.env.example` and set your key:

	GOOGLE_API_KEY=YOUR_GEMINI_API_KEY

2) Install deps and run both servers:

	- npm install
	- npm run dev

Frontend: http://localhost:3000

Backend: http://localhost:5050 (endpoints under /api)

## Endpoints

- POST /api/chat
  Body: { message: string, history?: Array<{ role: 'user'|'model', content: string }> }
  Returns: { answer: string }

## Notes

- The backend loads `document.pdf` once at startup and keeps it private.
- Optionally set GEMINI_MODEL in `server/.env` (defaults to gemini-1.5-flash).
