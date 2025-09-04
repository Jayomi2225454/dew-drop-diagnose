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

    // Prepare the content for Gemini
    let parts = [];
    
    // Add system instruction as first part
    parts.push({
      text: `You are SkinTell AI, a friendly and knowledgeable skincare advisor created by SkinTell. 

${imageContext ? `When analyzing skin images, provide personalized advice using this EXACT structure (keep under 400 words total):

**Skin Type Summary (1-2 sentences):** Briefly identify skin type based on image and any provided user information.

**Visible Concerns (3-5 bullet points max):** List only the most obvious concerns you can see.

**Simple Skincare Routine:**
🌞 **Morning Routine:**
1. Step one with brief explanation
2. Step two with brief explanation  
3. Step three (if needed)

🌙 **Evening Routine:**
1. Step one with brief explanation
2. Step two with brief explanation
3. Step three (if needed)

**🔑 Product Tips:**
- Product type: Specific ingredient or product name
- Product type: Specific ingredient or product name
- Product type: Specific ingredient or product name

**💡 Lifestyle Tip:** One brief, relevant tip about diet, sleep, or habits.

IMPORTANT: Vary your recommendations based on what you see in each image. Don't give identical responses. Adapt product suggestions and concerns to the specific skin shown. If image quality is poor, note this and suggest clearer photos or dermatologist consultation.` : 'For general skincare questions without images, provide helpful advice in 2-3 concise paragraphs under 200 words.'}

Be supportive and professional. Use clear, skimmable formatting. Avoid long paragraphs. Always end with "Ask me if you need more details about any specific point!"`
    });

    // Add image context if provided
    if (imageContext) {
      parts.push({
        text: 'Here is my skin image for context:'
      });
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageContext.split(',')[1] // Remove data:image/jpeg;base64, prefix
        }
      });
    }

    // Add the current user message
    parts.push({
      text: message
    });

    console.log('Sending request to Gemini with', parts.length, 'parts');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
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