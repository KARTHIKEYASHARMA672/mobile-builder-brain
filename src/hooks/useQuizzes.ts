import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Quiz {
  id: string;
  question_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  order_index: number | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken: number | null;
  completed_at: string;
}

export function useQuizzes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (quizData: {
    question_id: string;
    title: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          user_id: user.id,
          ...quizData,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchQuizzes();
      toast({
        title: "Success",
        description: "Quiz created successfully",
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

  const getQuizQuestions = async (quizId: string): Promise<QuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as QuizQuestion[];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive",
      });
      return [];
    }
  };

  const createQuizQuestions = async (questions: Omit<QuizQuestion, 'id'>[]) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(questions)
        .select();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create quiz questions",
        variant: "destructive",
      });
      return null;
    }
  };

  const submitQuizAttempt = async (attemptData: {
    quiz_id: string;
    score: number;
    total_questions: number;
    time_taken?: number;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          ...attemptData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz completed successfully",
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

  const getQuizAttempts = async (quizId?: string): Promise<QuizAttempt[]> => {
    if (!user) return [];

    try {
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (quizId) {
        query = query.eq('quiz_id', quizId);
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load quiz attempts",
        variant: "destructive",
      });
      return [];
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      await fetchQuizzes();
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
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
    quizzes,
    loading,
    createQuiz,
    getQuizQuestions,
    createQuizQuestions,
    submitQuizAttempt,
    getQuizAttempts,
    deleteQuiz,
    refetch: fetchQuizzes,
  };
}