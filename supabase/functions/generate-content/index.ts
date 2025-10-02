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
    const { question, contentType, subject } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!question || !contentType) {
      throw new Error('Question and content type are required');
    }

    console.log('Generating content:', { question, contentType, subject });

    // Define prompts for different content types
    const prompts = {
      '2M': `Provide a clear and concise 2-minute explanation for the following question. Focus on the key concepts and essential information. Make it easily understandable. Include 2-3 relevant reference links at the end.\n\nQuestion: ${question}`,
      '5M': `Provide a detailed 5-minute explanation for the following question. Include background context, main concepts, examples, and practical applications. Include 3-4 relevant reference links at the end for further reading.\n\nQuestion: ${question}`,
      '10M': `Provide a comprehensive 10-minute explanation for the following question. Include thorough background, detailed analysis, multiple examples, comparisons, and real-world applications. Include 5-6 relevant reference links at the end covering different aspects of the topic.\n\nQuestion: ${question}`,
      'essay': `Write a well-structured essay response to the following question. Include an introduction, body paragraphs with supporting evidence and citations, and a strong conclusion. Add a "References" section at the end with 5-7 authoritative sources.\n\nQuestion: ${question}`,
      'notes': `Create structured study notes for the following question. Use bullet points, headings, key terms, and organize the information for easy review. Include a "Further Reading" section with 3-4 helpful reference links.\n\nQuestion: ${question}`
    };

    const prompt = prompts[contentType as keyof typeof prompts];
    if (!prompt) {
      throw new Error('Invalid content type');
    }

    // Add subject context if provided
    const contextualPrompt = subject 
      ? `Subject: ${subject}\n\n${prompt}` 
      : prompt;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: contextualPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No content generated from Gemini API');
    }

    const generatedContent = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      content: generatedContent,
      contentType,
      subject 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});