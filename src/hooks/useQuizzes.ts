import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  question_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

interface QuizQuestion {
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

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken: number | null;
  completed_at: string;
}

interface NewQuiz {
  question_id: string;
  title: string;
}

interface NewQuizQuestion {
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  order_index?: number;
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

  const createQuiz = async (quizData: NewQuiz) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{ ...quizData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setQuizzes(prev => [data, ...prev]);
      
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

  const getQuizQuestions = async (quizId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load quiz questions",
        variant: "destructive",
      });
      return [];
    }
  };

  const createQuizQuestion = async (questionData: NewQuizQuestion) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;
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

  const createQuizAttempt = async (attemptData: {
    quiz_id: string;
    score: number;
    total_questions: number;
    time_taken?: number;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([{ ...attemptData, user_id: user.id }])
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

  const getQuizAttempts = async (quizId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

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

  return {
    quizzes,
    loading,
    createQuiz,
    getQuizQuestions,
    createQuizQuestion,
    createQuizAttempt,
    getQuizAttempts,
    refetch: fetchQuizzes,
  };
}