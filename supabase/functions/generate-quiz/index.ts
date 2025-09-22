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
    const { questionText, content, subject, difficulty = 'medium' } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!questionText && !content) {
      throw new Error('Either question text or content is required');
    }

    console.log('Generating quiz:', { questionText, subject, difficulty });

    const sourceContent = content || questionText;
    const prompt = `Based on the following content, create a multiple-choice quiz with 5-10 questions.

Subject: ${subject || 'General'}
Difficulty Level: ${difficulty}
Content: ${sourceContent}

Generate questions that test understanding of key concepts. For each question, provide:
- A clear question
- 4 multiple choice options (A, B, C, D)
- The correct answer (A, B, C, or D)
- A brief explanation of why the answer is correct

Format your response as valid JSON with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Explanation of why this answer is correct"
    }
  ]
}

Make sure the JSON is properly formatted and valid.`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini quiz response received');

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No quiz generated from Gemini API');
    }

    let generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const quizData = JSON.parse(generatedText);
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format generated');
      }

      return new Response(JSON.stringify({ 
        questions: quizData.questions,
        difficulty,
        subject 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse generated quiz JSON:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error('Failed to parse generated quiz data');
    }

  } catch (error: any) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate quiz' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});