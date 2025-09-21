-- Create questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  image_url TEXT,
  subject VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated content table
CREATE TABLE public.generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content_type VARCHAR(20) CHECK (content_type IN ('2M', '5M', '10M', 'essay', 'notes')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')) NOT NULL,
  explanation TEXT,
  order_index INTEGER
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user favorites table
CREATE TABLE public.favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for questions table
CREATE POLICY "Users can view their own questions" 
ON public.questions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
ON public.questions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
ON public.questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for generated_content table
CREATE POLICY "Users can view content for their questions" 
ON public.generated_content 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.questions 
  WHERE questions.id = generated_content.question_id 
  AND questions.user_id = auth.uid()
));

CREATE POLICY "Users can create content for their questions" 
ON public.generated_content 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.questions 
  WHERE questions.id = generated_content.question_id 
  AND questions.user_id = auth.uid()
));

-- Create RLS policies for quizzes table
CREATE POLICY "Users can view their own quizzes" 
ON public.quizzes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.questions 
  WHERE questions.id = quizzes.question_id 
  AND questions.user_id = auth.uid()
));

CREATE POLICY "Users can update their own quizzes" 
ON public.quizzes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes" 
ON public.quizzes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for quiz_questions table
CREATE POLICY "Users can view questions for their quizzes" 
ON public.quiz_questions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quizzes 
  WHERE quizzes.id = quiz_questions.quiz_id 
  AND quizzes.user_id = auth.uid()
));

CREATE POLICY "Users can create questions for their quizzes" 
ON public.quiz_questions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quizzes 
  WHERE quizzes.id = quiz_questions.quiz_id 
  AND quizzes.user_id = auth.uid()
));

-- Create RLS policies for quiz_attempts table
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.quizzes 
  WHERE quizzes.id = quiz_attempts.quiz_id 
  AND quizzes.user_id = auth.uid()
));

-- Create RLS policies for favorites table
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.questions 
  WHERE questions.id = favorites.question_id 
  AND questions.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for question images
CREATE POLICY "Users can view their own question images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own question images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own question images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own question images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'question-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_questions_user_id ON public.questions(user_id);
CREATE INDEX idx_questions_subject ON public.questions(subject);
CREATE INDEX idx_questions_created_at ON public.questions(created_at);
CREATE INDEX idx_generated_content_question_id ON public.generated_content(question_id);
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- Create function for search functionality
CREATE OR REPLACE FUNCTION public.search_questions(search_term TEXT, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  original_text TEXT,
  subject VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.original_text,
    q.subject,
    q.created_at
  FROM public.questions q
  WHERE q.user_id = user_uuid
    AND (
      q.original_text ILIKE '%' || search_term || '%'
      OR q.subject ILIKE '%' || search_term || '%'
    )
  ORDER BY q.created_at DESC;
END;
$$;

-- Create function for user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_questions INTEGER,
  total_quizzes INTEGER,
  total_attempts INTEGER,
  average_score NUMERIC,
  study_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.questions WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM public.quizzes WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM public.quiz_attempts WHERE user_id = user_uuid),
    (SELECT COALESCE(AVG(score::NUMERIC / total_questions::NUMERIC * 100), 0) FROM public.quiz_attempts WHERE user_id = user_uuid),
    -- Simple streak calculation - count consecutive days with quiz attempts
    (SELECT COUNT(DISTINCT DATE(completed_at))::INTEGER 
     FROM public.quiz_attempts 
     WHERE user_id = user_uuid 
     AND completed_at >= CURRENT_DATE - INTERVAL '30 days')
  ;
END;
$$;