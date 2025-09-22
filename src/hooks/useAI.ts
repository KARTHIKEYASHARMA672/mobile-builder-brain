import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentGenerationOptions {
  question: string;
  contentType: '2M' | '5M' | '10M' | 'essay' | 'notes';
  subject?: string;
}

interface QuizGenerationOptions {
  questionText?: string;
  content?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ImageToTextOptions {
  imageData: string;
  mimeType?: string;
}

export function useAI() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateContent = async (options: ContentGenerationOptions) => {
    try {
      setLoading(true);
      console.log('Generating content with options:', options);

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: options
      });

      if (error) {
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to generate content');
      }

      toast({
        title: "Success",
        description: "Content generated successfully",
      });

      return {
        content: data.content,
        contentType: data.contentType,
        subject: data.subject
      };

    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (options: QuizGenerationOptions) => {
    try {
      setLoading(true);
      console.log('Generating quiz with options:', options);

      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: options
      });

      if (error) {
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to generate quiz');
      }

      toast({
        title: "Success",
        description: "Quiz generated successfully",
      });

      return {
        questions: data.questions,
        difficulty: data.difficulty,
        subject: data.subject
      };

    } catch (error: any) {
      console.error('Quiz generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromImage = async (options: ImageToTextOptions) => {
    try {
      setLoading(true);
      console.log('Extracting text from image');

      const { data, error } = await supabase.functions.invoke('image-to-text', {
        body: options
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Failed to extract text from image');
      }

      if (!data.success) {
        toast({
          title: "Warning",
          description: "Could not extract clear text from image. Please try a clearer photo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Text extracted successfully",
        });
      }

      return {
        extractedText: data.extractedText || '',
        confidence: data.confidence || 0,
        success: data.success || false
      };

    } catch (error: any) {
      console.error('Image text extraction error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to extract text from image",
        variant: "destructive",
      });
      
      return {
        extractedText: '',
        confidence: 0,
        success: false
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContent,
    generateQuiz,
    extractTextFromImage,
  };
}