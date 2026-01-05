import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// REMOVED: export const config = { runtime: 'edge' }; 
// Using the default Node.js runtime fixes the "unsupported modules" error.

export default async function handler(req) {
    // 1. Setup CORS headers so your GitHub frontend can talk to this Vercel backend
    const headers = {
        'Access-Control-Allow-Origin': '*', // Allows any domain to access (or put your github URL)
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 2. Handle the "Preflight" request from the browser
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const { messages } = await req.json();

        // 3. Initialize the AI Stream
        const result = await streamText({
            model: google('gemini-1.5-pro-latest'),
            messages: messages,
            system: `You are the ScaleVest Elite CFO. Analyze the provided inventory and sales data 
                     to give professional financial advice and stock alerts.`,
        });

        // 4. Return the response with CORS headers
        return result.toDataStreamResponse({ headers });

    } catch (error) {
        console.error('CFO Error:', error);
        return new Response(JSON.stringify({ error: "CFO is busy thinking. Try again." }), { 
            status: 500, 
            headers 
        });
    }
}
