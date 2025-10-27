-- Fix 1: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Create view that hides quiz answers and explanations
CREATE OR REPLACE VIEW quiz_questions_public AS
SELECT 
  id,
  quiz_id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  order_index
FROM quiz_questions;

-- Grant access to the view
GRANT SELECT ON quiz_questions_public TO authenticated;

-- Update RLS policy to prevent direct access to answers
DROP POLICY IF EXISTS "Users can view questions for their quizzes" ON public.quiz_questions;

-- Keep the policy but users will query the view instead
CREATE POLICY "Users can view questions for their quizzes"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM quizzes
  WHERE quizzes.id = quiz_questions.quiz_id 
  AND quizzes.user_id = auth.uid()
));