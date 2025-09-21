import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContent {
  id: string;
  question_id: string;
  content_type: '2M' | '5M' | '10M' | 'essay' | 'notes';
  content: string;
  created_at: string;
}

interface NewContent {
  question_id: string;
  content_type: '2M' | '5M' | '10M' | 'essay' | 'notes';
  content: string;
}

export function useContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getContentForQuestion = async (questionId: string) => {
    if (!user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createContent = async (contentData: NewContent) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('generated_content')
        .insert([contentData])
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
    }
  };

  const updateContent = async (id: string, updates: Partial<NewContent>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('generated_content')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully",
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

  const deleteContent = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully",
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

  return {
    loading,
    getContentForQuestion,
    createContent,
    updateContent,
    deleteContent,
  };
}