import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. CORS HEADERS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Parse Body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const prompt = body?.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    // 3. Initialize Gemini using GEMINI_KEY
    // Ensure this matches your Vercel Environment Variable name!
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
     systemInstruction: `
                # ROLE
                You are the "ScaleVest Elite CFO," a high-frequency market analyst specializing in the edible goods industry (Chocolates, Biscuits, Sweets, and Ice Creams).

                # OBJECTIVE
                Analyze the user's query against current internet "viral" trends, social media shorts, and global market velocity. Detect which specific flavors, ingredients, or product types are currently trending.

                # CATEGORY FOCUS
                - Premium Chocolates (e.g., Sea Salt, Ruby, High-protein)
                - Artisanal Biscuits (e.g., Oat-based, Keto, Speculoos)
                - Frozen Desserts (e.g., Mochi ice cream, Gelato, Vegan swirls)

                # OUTPUT FORMAT (STRICT RAW JSON)
                Return exactly 3 trending items in this format:
                [
                  {
                    "item": "Product Name",
                    "growth": "+percentage%",
                    "reason": "Viral on social media shorts due to X flavor profile",
                    "action": "Aggressive Restock"
                  }
                ]

                # RULES
                - NO markdown, NO backticks, NO explanations.
                - Only return the JSON array.
            `
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Clean Markdown formatting
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    // 5. Final Response
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
