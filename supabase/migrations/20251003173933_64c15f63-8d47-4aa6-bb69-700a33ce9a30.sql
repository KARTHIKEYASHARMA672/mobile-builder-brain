-- Fix foreign key constraint on questions table
-- Drop existing foreign key if it exists
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_user_id_fkey;

-- Add correct foreign key referencing profiles table
ALTER TABLE public.questions
ADD CONSTRAINT questions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;