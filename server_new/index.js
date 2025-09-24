/*
  Extended Express server that:
  - Parses document.pdf on startup (server-side only)
  - Uses Gemini to answer questions grounded in the PDF content
  - Exposes POST /api/chat for the frontend
  - Provides dynamic data endpoints for faculty, courses, semesters, and subjects
*/

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { loadPdfText, buildRetriever } = require('./pdfLoader');

dotenv.config({ path: path.resolve(__dirname, '.env') });

let PORT = process.env.PORT || 5051;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn('[startup] Missing GOOGLE_API_KEY in .env or environment. /api/chat will return 500 until set.');
}

// Data extraction functions using Gemini to parse PDF content
async function extractDataFromPDF(contextText, dataType) {
  if (!GOOGLE_API_KEY || !contextText) return [];

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let prompt = '';
  
  switch (dataType) {
    case 'faculty':
      prompt = `Extract faculty information from the following ICT department document. Return ONLY a valid JSON array with objects containing: id (string), name (string), designation (string), specialization (string), email (string), phone (string, optional), experience (string, optional), office (string, optional).

Document: ${contextText.substring(0, 10000)}

Return only the JSON array, no other text:`;
      break;

    case 'courses':
      prompt = `Extract course information from the following ICT department document. Return ONLY a valid JSON array with objects containing: id (string), name (string), type (string like "Undergraduate" or "Postgraduate"), duration (string), intake (string, optional).

Document: ${contextText.substring(0, 10000)}

Return only the JSON array, no other text:`;
      break;

    default:
      return [];
  }

  try {
    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || '';
    
    // Clean the response to extract JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error(`[extractData] Error extracting ${dataType}:`, err.message);
    return [];
  }
}

async function extractSemestersFromPDF(contextText, courseId) {
  if (!GOOGLE_API_KEY || !contextText) return [];

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Extract semester information for course ID "${courseId}" from the following ICT department document. Return ONLY a valid JSON array with objects containing: id (string), name (string like "Semester 1", "Semester 2", etc.), subjectCount (number, optional).

Document: ${contextText.substring(0, 15000)}

Return only the JSON array, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || '';
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error('[extractSemesters] Error:', err.message);
    return [];
  }
}

async function extractSubjectsFromPDF(contextText, courseId, semesterId) {
  if (!GOOGLE_API_KEY || !contextText) return [];

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Extract subject information for course ID "${courseId}" and semester ID "${semesterId}" from the following ICT department document. Return ONLY a valid JSON array with objects containing: id (string), name (string), code (string, optional), credits (string, optional), type (string like "Core", "Elective", etc., optional).

Document: ${contextText.substring(0, 15000)}

Return only the JSON array, no other text:`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || '';
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error('[extractSubjects] Error:', err.message);
    return [];
  }
}

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));

  // Load PDF once on startup
  const pdfPath = path.resolve(__dirname, 'document.pdf');
  console.log(`[startup] Loading PDF from: ${pdfPath}`);
  let contextText = '';
  try {
    contextText = await loadPdfText(pdfPath);
    console.log(`[startup] PDF loaded. Characters: ${contextText.length.toLocaleString()}`);
  } catch (err) {
    console.warn('[startup] Failed to load/parse PDF:', err.message);
  }

  // Simple retriever over chunks
  const retriever = buildRetriever(contextText, { chunkSize: 2000, overlap: 200 });

  // Cache for extracted data to avoid re-processing
  let cachedFaculty = null;
  let cachedCourses = null;
  const semesterCache = new Map();
  const subjectCache = new Map();

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      pdfLoaded: contextText.length > 0,
      chunks: retriever?.chunks?.length || 0
    });
  });

  // Faculty endpoint
  app.get('/api/faculty', async (req, res) => {
    try {
      if (!cachedFaculty) {
        console.log('[faculty] Extracting faculty data from PDF...');
        cachedFaculty = await extractDataFromPDF(contextText, 'faculty');
        console.log(`[faculty] Extracted ${cachedFaculty.length} faculty members`);
      }
      res.json(cachedFaculty);
    } catch (err) {
      console.error('[faculty] Error:', err);
      res.status(500).json({ error: 'Failed to fetch faculty data' });
    }
  });

  // Courses endpoint
  app.get('/api/courses', async (req, res) => {
    try {
      if (!cachedCourses) {
        console.log('[courses] Extracting course data from PDF...');
        cachedCourses = await extractDataFromPDF(contextText, 'courses');
        console.log(`[courses] Extracted ${cachedCourses.length} courses`);
      }
      res.json(cachedCourses);
    } catch (err) {
      console.error('[courses] Error:', err);
      res.status(500).json({ error: 'Failed to fetch courses data' });
    }
  });

  // Semesters endpoint
  app.get('/api/courses/:courseId/semesters', async (req, res) => {
    try {
      const { courseId } = req.params;
      const cacheKey = `semesters_${courseId}`;
      
      if (!semesterCache.has(cacheKey)) {
        console.log(`[semesters] Extracting semester data for course ${courseId}...`);
        const semesters = await extractSemestersFromPDF(contextText, courseId);
        semesterCache.set(cacheKey, semesters);
        console.log(`[semesters] Extracted ${semesters.length} semesters for course ${courseId}`);
      }
      
      res.json(semesterCache.get(cacheKey));
    } catch (err) {
      console.error('[semesters] Error:', err);
      res.status(500).json({ error: 'Failed to fetch semesters data' });
    }
  });

  // Subjects endpoint
  app.get('/api/courses/:courseId/semesters/:semesterId/subjects', async (req, res) => {
    try {
      const { courseId, semesterId } = req.params;
      const cacheKey = `subjects_${courseId}_${semesterId}`;
      
      if (!subjectCache.has(cacheKey)) {
        console.log(`[subjects] Extracting subject data for course ${courseId}, semester ${semesterId}...`);
        const subjects = await extractSubjectsFromPDF(contextText, courseId, semesterId);
        subjectCache.set(cacheKey, subjects);
        console.log(`[subjects] Extracted ${subjects.length} subjects for course ${courseId}, semester ${semesterId}`);
      }
      
      res.json(subjectCache.get(cacheKey));
    } catch (err) {
      console.error('[subjects] Error:', err);
      res.status(500).json({ error: 'Failed to fetch subjects data' });
    }
  });

  // Original chat endpoint
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

      const systemPreamble = `You are InfoMate, an assistant that strictly answers using the provided context which comes from our ICT department documentation.\n` +
        `If the answer is not present, say you don't have enough information. Be concise and factual. When providing information about faculty, courses, or academics, use the exact data from the context.`;

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
      const responseText = result?.response?.text?.() ||
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const answer = responseText?.trim() ||
        "I'm sorry, I don't have enough information to answer that right now.";

      res.json({ answer, meta: { model: modelName, usedChunks: relevant.map(r => r.index) } });
    } catch (err) {
      console.error('[chat] Error:', err);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // Cache clearing endpoint (optional, for development)
  app.post('/api/clear-cache', (req, res) => {
    cachedFaculty = null;
    cachedCourses = null;
    semesterCache.clear();
    subjectCache.clear();
    console.log('[cache] All caches cleared');
    res.json({ message: 'Cache cleared successfully' });
  });

  // Start server (retry if port busy)
  function startServer(port) {
    const server = app.listen(port, () => {
      console.log(`[server] InfoMate backend running on http://localhost:${port}`);
      console.log(`[server] Available endpoints:`);
      console.log(`  - GET  /api/health`);
      console.log(`  - GET  /api/faculty`);
      console.log(`  - GET  /api/courses`);
      console.log(`  - GET  /api/courses/:courseId/semesters`);
      console.log(`  - GET  /api/courses/:courseId/semesters/:semesterId/subjects`);
      console.log(`  - POST /api/chat`);
      console.log(`  - POST /api/clear-cache`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[server] Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('[server] Failed to start:', err);
      }
    });
  }

  startServer(PORT);
}

createServer();