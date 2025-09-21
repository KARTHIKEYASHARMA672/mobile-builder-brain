import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  user_id: string;
  original_text: string;
  image_url: string | null;
  subject: string | null;
  created_at: string;
}

interface NewQuestion {
  original_text: string;
  image_url?: string;
  subject?: string;
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

  const createQuestion = async (questionData: NewQuestion) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{ ...questionData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setQuestions(prev => [data, ...prev]);
      
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

  const updateQuestion = async (id: string, updates: Partial<NewQuestion>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== id));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const searchQuestions = async (searchTerm: string) => {
    if (!user || !searchTerm.trim()) {
      return questions;
    }

    try {
      const { data, error } = await supabase
        .rpc('search_questions', {
          search_term: searchTerm,
          user_uuid: user.id
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
      return questions;
    }
  };

  return {
    questions,
    loading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    refetch: fetchQuestions,
  };
}