-- Add UPDATE and DELETE RLS policies for generated_content table
CREATE POLICY "Users can update content for their questions"
ON public.generated_content FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questions
    WHERE questions.id = generated_content.question_id
    AND questions.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM questions
    WHERE questions.id = generated_content.question_id
    AND questions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete content for their questions"
ON public.generated_content FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questions
    WHERE questions.id = generated_content.question_id
    AND questions.user_id = auth.uid()
  )
);

-- Update avatars bucket with size and type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 2097152, -- 2MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'avatars';

-- Update question-images bucket with size and type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'question-images';