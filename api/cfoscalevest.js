import express from 'express';
import cors from 'cors';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import 'dotenv/config'; // Loads your GOOGLE_GENERATED_AI_API_KEY

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure CORS
// This replaces your manual CORS headers and OPTIONS handling
app.use(cors({
  origin: 'http://upscalevest.site',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// 2. Middleware to parse JSON bodies
app.use(express.json());

// 3. The Main POST Route
app.post('/api/cfo', async (req, res) => {
  try {
    const { message, userData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await generateText({
      model: google('gemini-1.5-pro-latest'),
      system: `You are the ScaleVest CFO. Analyze: ${JSON.stringify(userData)}. End with CFO COMMAND.`,
      messages: [{ role: 'user', content: message }],
    });

    return res.status(200).json({ response: result.text });

  } catch (error) {
    console.error('CFO API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'An error occurred processing your request' 
    });
  }
});

// 4. Start the server
app.listen(PORT, () => {
  console.log(`CFO Server running on port ${PORT}`);
});
