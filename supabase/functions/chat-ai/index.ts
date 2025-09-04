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
      text: `You are SkinTell AI, a professional skincare expert created by SkinTell. You analyze skin images and provide detailed, personalized skincare advice.

${imageContext ? `When analyzing a skin image, ALWAYS structure your response in this EXACT format with numbered sections:

**1) Professional Skin Type Assessment**
Analyze the skin type from the image (normal, dry, oily, combination, sensitive). Note any visible characteristics like shine, texture, or pore visibility. Explain how this might relate to their reported skin type and any contributing factors like age or hormones.

**2) Possible Visible Skin Concerns**
Identify specific concerns visible in the image such as acne, enlarged pores, uneven skin tone, dark spots, fine lines, or texture issues. Be honest about image quality limitations while providing helpful observations.

**3) Personalized Skincare Routine**
Create a customized routine with:
- ✅ **Morning Routine**: Cleanser, Treatment (if needed), Moisturizer, Sunscreen
- 🌙 **Evening Routine**: Cleanser, Treatment (if needed), Moisturizer
Include specific product types and application tips.

**4) Product Ingredient Recommendations**
List specific ingredients to look for and avoid in:
- Cleanser recommendations
- Treatment options (with concentrations)
- Moisturizer ingredients
- Sunscreen types
Always mention patch testing.

**5) Lifestyle & Dietary Tips for Better Skin**
Include advice on hydration, diet, sleep, stress management, and other lifestyle factors that affect skin health.

**6) What to Expect: Timeline for Improvement**
Set realistic expectations for when they might see results and emphasize consistency. Mention when to consult a dermatologist.

**Final Thoughts**
Remind them this is based on image analysis and recommend professional consultation for best results.

Use emojis and formatting as shown in the example. Be thorough but personalized to their specific image and concerns.` : 'For general skincare questions without images, provide helpful, professional advice in 2-3 concise paragraphs.'}

You are SkinTell's AI assistant, not affiliated with Google, Gemini, or any other company. Always end responses with "Ask me if you need more details about any specific point!"`
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