import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionText, content, subject, difficulty = 'medium' } = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!questionText && !content) {
      throw new Error('Either question text or content is required');
    }

    console.log('Generating quiz:', { questionText, subject, difficulty });

    const sourceContent = content || questionText;
    const systemPrompt = `You are an expert quiz generator. Create multiple-choice quizzes that test understanding of key concepts.`;
    const userPrompt = `Based on the following content, create a multiple-choice quiz with 5-10 questions.

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

    // Call Lovable AI Gateway (standardized approach)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('AI credits exhausted');
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const error = await response.text();
      console.error('AI Gateway error:', response.status, error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Gateway quiz response received');

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No quiz generated from AI Gateway');
    }

    const messageContent = data.choices[0].message.content;
    
    try {
      const quizData = JSON.parse(messageContent);
      
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
      console.error('Generated text:', messageContent);
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
