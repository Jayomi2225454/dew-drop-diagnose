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
    const systemInstructionText = `You are SkinTell AI, a friendly skincare advisor.

${imageContext ? `For skin images, reply in ~150–180 words:
- Skin Type: 1 sentence.
- Concerns: 3–4 bullets.
- Routine: Morning & evening, 2–3 steps each (short).
- Products: 2–3 bullets with key ingredients.
- Lifestyle: 1 tip.
Use simple words, bullet points. If image is unclear, say so and suggest dermatologist.` : `For text questions, answer in 2–3 short sentences. Be direct and simple.`}

Keep supportive, professional. End with: "Ask if you need details!"`;

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
            maxOutputTokens: imageContext ? 180 : 120,
            temperature: 0.4,
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