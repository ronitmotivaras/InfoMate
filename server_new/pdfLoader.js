const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function loadPdfText(pdfPath) {
  const abs = path.resolve(pdfPath);
  const data = await fs.promises.readFile(abs);
  const parsed = await pdfParse(data);
  // Normalize spaces
  return (parsed.text || '').replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function chunkText(text, chunkSize = 2000, overlap = 200) {
  if (!text) return [];
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const segment = text.slice(i, end);
    chunks.push(segment);
    if (end >= text.length) break;
    i = end - overlap;
  }
  return chunks;
}

function cosineSim(a, b) {
  // Very naive token overlap proxy; replace with embeddings later if desired
  const tokensA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const tokensB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let intersection = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersection++;
  const denom = Math.sqrt(tokensA.size || 1) * Math.sqrt(tokensB.size || 1);
  return intersection / denom;
}

function buildRetriever(text, { chunkSize = 2000, overlap = 200 } = {}) {
  const chunks = chunkText(text, chunkSize, overlap).map((t, idx) => ({ index: idx, text: t }));
  return {
    chunks,
    retrieve(query, k = 4) {
      if (!query || chunks.length === 0) return [];
      const scored = chunks.map(c => ({ ...c, score: cosineSim(query, c.text) }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, k);
    }
  };
}

module.exports = { loadPdfText, buildRetriever };
