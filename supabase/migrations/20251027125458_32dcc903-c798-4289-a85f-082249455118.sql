-- Drop the existing view that's flagged as SECURITY DEFINER
DROP VIEW IF EXISTS public.quiz_questions_public;

-- Create a SECURITY INVOKER function instead
CREATE OR REPLACE FUNCTION public.get_quiz_questions_public(p_quiz_id UUID)
RETURNS TABLE (
  id UUID,
  quiz_id UUID,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  order_index INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
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
  WHERE q.user_id = auth.uid()
    AND qq.quiz_id = p_quiz_id
  ORDER BY qq.order_index ASC;
$$;