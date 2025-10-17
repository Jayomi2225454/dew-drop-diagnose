import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

console.log('Starting chat-ai function');
console.log('Gemini API Key available:', !!geminiApiKey);
console.log('Gemini API Key prefix:', geminiApiKey?.substring(0, 7));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key first
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      throw new Error('Gemini API key is not configured');
    }

    const { message, imageContext } = await req.json();
    console.log('Received chat request:', { message, hasImageContext: !!imageContext });

    // Prepare system instruction and user content for Gemini (v1 schema)
    const systemInstructionText = `You are SkinTell AI, a friendly, expert skincare advisor.

${imageContext ? `When analyzing skin images, reply compactly (max ~250 words) with:
- Skin Type: 1 short sentence.
- Visible Concerns: 3–5 bullets.
- Simple Routine: 3 steps for morning and 3 for evening (short phrases).
- Product Tips: 3 bullets with specific ingredients.
- Lifestyle Tip: 1 short, relevant tip.
If the image quality is poor, say so briefly and suggest clearer photos or a dermatologist visit.` : `For general skincare questions (no images), answer in 1–2 short paragraphs (max ~140 words). Be direct and practical.`}

Keep tone supportive and professional. Use concise, skimmable formatting. End with: "Ask me if you need more details about any specific point!"`;

    const userParts: any[] = [];
    if (imageContext) {
      userParts.push({ text: 'Here is my skin image for context:' });
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageContext.split(',')[1]
        }
      });
    }
    userParts.push({ text: message });

    console.log('Sending request to Gemini (v1) with image?', !!imageContext);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemInstructionText }]
          },
          contents: [{
            role: 'user',
            parts: userParts
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.6,
          }
        }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received successfully');
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ 
        success: true, 
        response: aiResponse 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      fallbackResponse: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, I recommend maintaining a consistent skincare routine and staying hydrated!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});