import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { message, imageContext } = await req.json();

    console.log('Received chat request:', { message, hasImageContext: !!imageContext });

    const messages: any[] = [
      {
        role: 'system',
        content: `You are SkinTell AI, a professional skincare expert created by SkinTell. Answer the user's skincare question in a helpful, friendly, and professional manner.

IMPORTANT: Keep your responses concise and easy to read (2-3 short paragraphs maximum). Focus on the most important information first. If the user wants more details, they can ask follow-up questions.

You are SkinTell's AI assistant, not affiliated with Google, Gemini, or any other company. You were created by SkinTell to help users with their skincare journey.

${imageContext ? 'You have access to the user\'s skin image that was previously analyzed. Use this context to provide personalized advice.' : ''}

Provide a clear, helpful response without using asterisks (*), bullets, or special formatting symbols. Use plain text with short paragraphs. End with "Ask me if you need more details about any specific point!"`
      }
    ];

    // Add image context if provided
    if (imageContext) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Here is my skin image for context:'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageContext
            }
          }
        ]
      });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    if (data.choices && data.choices[0]?.message?.content) {
      const aiResponse = data.choices[0].message.content;
      
      return new Response(JSON.stringify({ 
        success: true, 
        response: aiResponse 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid response from OpenAI API');
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