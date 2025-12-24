import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an inventory voice assistant.
Understand English, Hindi, and Hinglish.

Return ONLY valid JSON:
{
  "action": "add | increase | decrease | remove",
  "product": "product name",
  "quantity": number,
  "unit": "pcs | kg | litre"
}
          `
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0
    });

    const reply = completion.choices[0].message.content;

    // Force JSON safety
    const json = JSON.parse(reply);

    return res.status(200).json(json);

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.status(500).json({
      error: "AI failed",
      details: err.message
    });
  }
}
