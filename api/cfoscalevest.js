import { google } from '@ai-sdk/google';
import { generateText } from 'ai'; // Changed to generateText for compatibility

export default async function handler(req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        // Match the keys being sent by your Frontend
        const { message, userData } = await req.json();

        const result = await generateText({
            model: google('gemini-1.5-pro-latest'),
            system: `You are the ScaleVest CFO. Your tone is professional and "Steel."
            
            BUSINESS DATA DATA VAULT:
            ${JSON.stringify(userData)}

            RULES:
            1. DATA-FIRST: Use the Vault data above to calculate profit or stock.
            2. SHORT & SHARP: Use bullet points. 
            3. ACTION-ORIENTED: End with one "CFO COMMAND".`,
            messages: [{ role: 'user', content: message }],
        });

        return new Response(JSON.stringify({ response: result.text }), { 
            status: 200, 
            headers 
        });

    } catch (error) {
        console.error('CFO Error:', error);
        return new Response(JSON.stringify({ error: 'CFO Offline' }), { 
            status: 500, 
            headers 
        });
    }
}
