import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, mimeType } = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageData) {
      throw new Error('Image data is required');
    }

    console.log('Processing image for text extraction');

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Please extract and transcribe all visible text from this image. Focus on:
1. Questions or problems that need to be solved
2. Mathematical equations or formulas
3. Any educational content or instructions
4. Maintain the original formatting and structure as much as possible
5. If there are multiple questions, number them clearly

Please provide the extracted text in a clear, readable format. If you cannot see any text in the image, please say "No readable text found in the image."`;

    // Call Lovable AI Gateway with Gemini vision
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI error:', error);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to your workspace.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI vision response received');

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No text extracted from image');
    }

    const extractedText = data.choices[0].message.content;

    // Basic confidence scoring based on text quality
    let confidence = 0.8;
    if (extractedText.toLowerCase().includes('no readable text') || extractedText.length < 10) {
      confidence = 0.2;
    } else if (extractedText.length > 100) {
      confidence = 0.95;
    }

    return new Response(JSON.stringify({ 
      extractedText,
      confidence,
      success: confidence > 0.5
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in image-to-text function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to extract text from image',
      extractedText: '',
      confidence: 0,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});