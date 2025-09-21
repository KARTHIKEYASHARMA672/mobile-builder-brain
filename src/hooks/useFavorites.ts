import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Favorite {
  user_id: string;
  question_id: string;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('question_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.question_id) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (questionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          question_id: questionId,
        });

      if (error) throw error;

      setFavorites(prev => [...prev, questionId]);
      toast({
        title: "Success",
        description: "Added to favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (questionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== questionId));
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isFavorite = (questionId: string) => {
    return favorites.includes(questionId);
  };

  const toggleFavorite = async (questionId: string) => {
    if (isFavorite(questionId)) {
      await removeFromFavorites(questionId);
    } else {
      await addToFavorites(questionId);
    }
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}