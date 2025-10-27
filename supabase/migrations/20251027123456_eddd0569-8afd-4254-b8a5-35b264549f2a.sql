-- Fix security definer view to include user access controls
-- Drop the existing view and recreate with proper access controls

DROP VIEW IF EXISTS quiz_questions_public;

-- Create view that only shows quiz questions for the authenticated user's quizzes
CREATE VIEW quiz_questions_public AS
SELECT 
  qq.id, 
  qq.quiz_id, 
  qq.question_text, 
  qq.option_a, 
  qq.option_b, 
  qq.option_c, 
  qq.option_d, 
  qq.order_index
FROM quiz_questions qq
INNER JOIN quizzes q ON q.id = qq.quiz_id
WHERE q.user_id = auth.uid();

-- Grant select permission to authenticated users
GRANT SELECT ON quiz_questions_public TO authenticated;