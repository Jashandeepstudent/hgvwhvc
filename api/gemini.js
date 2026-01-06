import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. Standard CORS and Method Checks
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { prompt } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            // FORCE JSON output using Generation Config (Best Practice)
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
       systemInstruction: `
        # ROLE
        ScaleVest Elite CFO Market Analyst (Live Data: Jan 2026).
        
        # 2026 TREND INJECTION (PRIORITIZE THESE)
        Analyze the following real-time high-velocity trends:
        1. Angel Hair Chocolate (Pismaniye-filled bars) - Viral on TikTok/Shorts.
        2. Ube-Matcha Swirl Ice Cream - Aesthetic "Purple & Green" craze.
        3. Freeze-Dried Cheesecake Bites - Ultra-crunchy "Space Food" trend.
        4. Savory-Sweet Biscuits (Miso Caramel, Chili-Honey).

        # TASK
        Select exactly 3 unique items. Do NOT use placeholders like "Viral Discovery".
        Use EXACT keys: "name", "growth", "type".

        # FORMAT
        [
          {"name": "Angel Hair Chocolate", "growth": "+3900%", "type": "Viral Breakout"},
          {"name": "Ube-Matcha Swirls", "growth": "+145%", "type": "Aesthetic Velocity"},
          {"name": "Freeze-Dried Cheesecake", "growth": "+210%", "type": "Texture King"}
        ]
    `
});

        let responseText = result.response.text();
        
        // 2. SAFETY: Strip backticks if the model ignored the instruction
        const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
        let parsedData = JSON.parse(cleanJsonString);

        // 3. MAP FIX: Ensure we are sending an array, even if the AI returned an object
        const finalArray = Array.isArray(parsedData) ? parsedData : (parsedData.trends || [parsedData]);

        res.status(200).json(finalArray);

    } catch (error) {
        console.error("CFO API Error:", error);
        res.status(500).json({ error: "Analysis Failed", details: error.message });
    }
}
