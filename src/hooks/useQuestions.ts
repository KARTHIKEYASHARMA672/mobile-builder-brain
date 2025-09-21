import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Question {
  id: string;
  user_id: string;
  original_text: string;
  image_url: string | null;
  subject: string | null;
  created_at: string;
}

export function useQuestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const fetchQuestions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: {
    original_text: string;
    image_url?: string;
    subject?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          ...questionData,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchQuestions();
      toast({
        title: "Success",
        description: "Question created successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      await fetchQuestions();
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const searchQuestions = async (searchTerm: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .rpc('search_questions', {
          search_term: searchTerm,
          user_uuid: user.id,
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search questions",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    questions,
    loading,
    createQuestion,
    deleteQuestion,
    searchQuestions,
    refetch: fetchQuestions,
  };
}