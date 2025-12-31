export default async function handler(req, res) {
    const { productName } = req.query;
    const apiKey = process.env.GEMINI_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_KEY is not set in Vercel" });
    }

    const prompt = `Provide a short real-world origin, a 2-sentence story, and a sustainability score (1-100) for "${productName}". Format strictly as JSON: {"origin": "...", "description": "...", "score": 85}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        // Safety check for Gemini response structure
        if (!data.candidates || !data.candidates[0]) {
            throw new Error("Invalid AI Response");
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const jsonString = rawText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(jsonString));
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "AI Fetch Failed", details: error.message });
    }
}
