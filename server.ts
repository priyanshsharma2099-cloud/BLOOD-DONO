import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client if API key is present
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'LifeLink AI Full-Stack Coordination Server',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Draft donor emergency message via Gemini AI
app.post('/api/gemini/draft-message', async (req: Request, res: Response) => {
  const { bloodGroup, component, unitsRequested, hospitalName, conditionCategory, conditionNote } = req.body;

  const componentLabel = (component || 'whole blood').toString().replace('_', ' ');
  const fallbackDraft = `Urgent request for ${bloodGroup || 'unspecified'} ${componentLabel} (${unitsRequested || 1} unit(s)) at ${hospitalName || 'regional hospital'}. If you are a consenting registered donor willing to help, please respond through LifeLink AI. Clinical cross-matching and donation arrangements will be confirmed directly by the transfusion service.`;

  if (!aiClient || !process.env.GEMINI_API_KEY) {
    return res.json({
      message: fallbackDraft,
      isAiGenerated: false,
      provider: 'template_fallback',
      reason: 'GEMINI_API_KEY is not configured in environment secrets.',
    });
  }

  try {
    const prompt = `You are a medical coordination assistant for LifeLink AI, an emergency blood discovery and coordination service.
Write a clear, concise, respectful, and urgent donor outreach message (max 280 characters).
DO NOT disclose private patient identifiers (no full names, no clinical diagnosis details).
Focus strictly on:
- Blood group: ${bloodGroup || 'O-'}
- Component: ${componentLabel}
- Units needed: ${unitsRequested || 1}
- Location: ${hospitalName || 'the medical center'}
- Condition urgency category: ${conditionCategory || 'critical situation'}
${conditionNote ? `- Non-confidential context: ${conditionNote}` : ''}
Include a reminder that authorized blood transfusion personnel will confirm clinical eligibility and cross-matching.
Return ONLY the message text without quotation marks or bullet points.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const generatedText = response.text?.trim() || fallbackDraft;

    return res.json({
      message: generatedText,
      isAiGenerated: true,
      provider: 'gemini',
      model: 'gemini-3.8-flash',
    });
  } catch (err: unknown) {
    console.error('Gemini draft error:', err);
    return res.json({
      message: fallbackDraft,
      isAiGenerated: false,
      provider: 'template_fallback',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// Proxy route for Gmail API send (bypasses browser iframe CORS limits)
app.post('/api/gmail/send', async (req: Request, res: Response) => {
  const { accessToken, raw } = req.body;

  if (!accessToken || !raw) {
    return res.status(400).json({ error: 'Missing accessToken or raw email content.' });
  }

  try {
    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    const data = await gmailRes.json();
    if (!gmailRes.ok) {
      return res.status(gmailRes.status).json({
        error: data.error?.message || `Gmail API returned ${gmailRes.status}`,
        details: data,
      });
    }

    return res.json(data);
  } catch (err: unknown) {
    console.error('Server Gmail proxy error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error while communicating with Gmail API',
    });
  }
});

// Start server with Vite middleware in dev or static in prod
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LifeLink AI Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
