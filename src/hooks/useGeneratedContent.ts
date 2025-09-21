import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeneratedContent {
  id: string;
  question_id: string;
  content_type: '2M' | '5M' | '10M' | 'essay' | 'notes';
  content: string;
  created_at: string;
}

export function useGeneratedContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getContentForQuestion = async (questionId: string): Promise<GeneratedContent[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as GeneratedContent[];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load generated content",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: {
    question_id: string;
    content_type: '2M' | '5M' | '10M' | 'essay' | 'notes';
    content: string;
  }) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_content')
        .insert(contentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content generated successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    getContentForQuestion,
    createContent,
    deleteContent,
  };
}