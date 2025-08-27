/*
  Express server that:
  - Parses document.pdf on startup (server-side only)
  - Uses Gemini to answer questions grounded in the PDF content
  - Exposes POST /api/chat for the frontend
*/

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { loadPdfText, buildRetriever } = require('./pdfLoader');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 5050;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  // Log once; requests will also be guarded
  console.warn('[startup] Missing GOOGLE_API_KEY in server/.env or environment. /api/chat will return 500 until set.');
}

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));

  // Load PDF once on startup
  const pdfPath = path.resolve(__dirname, '..', 'document.pdf');
  console.log(`[startup] Loading PDF from: ${pdfPath}`);
  let contextText = '';
  try {
    contextText = await loadPdfText(pdfPath);
    console.log(`[startup] PDF loaded. Characters: ${contextText.length.toLocaleString()}`);
  } catch (err) {
    console.error('[startup] Failed to load/parse PDF:', err.message);
  }

  // Simple retriever over chunks
  const retriever = buildRetriever(contextText, { chunkSize: 2000, overlap: 200 });

  // Health endpoint (optional)
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, pdfLoaded: contextText.length > 0, chunks: retriever?.chunks?.length || 0 });
  });

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Server misconfigured: GOOGLE_API_KEY not set.' });
      }

      const { message, history } = req.body || {};
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'message is required' });
      }

      // Retrieve relevant context
      const relevant = retriever.retrieve(message, 4);
      const context = relevant.map(r => r.text).join('\n\n---\n\n');

      const systemPreamble = `You are InfoMate, an assistant that strictly answers using the provided context which comes from an internal PDF.\n` +
        `If the answer is not present, say you don't have enough information. Be concise and factual.\n` +
        `Do not mention the PDF or internal sources. Refer to "our documentation" if needed.`;

      const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const fewshotHistory = Array.isArray(history) ? history.slice(-6) : [];

      // Build content for Gemini
      const contents = [
        { role: 'user', parts: [{ text: systemPreamble }] },
        { role: 'user', parts: [{ text: `Context:\n${context}` }] },
      ];

      for (const h of fewshotHistory) {
        if (h?.role && h?.content) {
          contents.push({ role: h.role, parts: [{ text: h.content }] });
        }
      }

      contents.push({ role: 'user', parts: [{ text: `Question: ${message}` }] });

      const result = await model.generateContent({ contents });
      const responseText = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Final guard: If empty or evasive, provide a default fallback
      const answer = responseText?.trim() || "I'm sorry, I don't have enough information to answer that right now.";

      res.json({ answer, meta: { model: modelName, usedChunks: relevant.map(r => r.index) } });
    } catch (err) {
      console.error('[chat] Error:', err);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  app.listen(PORT, () => {
    console.log(`[server] InfoMate backend running on http://localhost:${PORT}`);
  });
}

createServer();
