import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  total_questions: number;
  total_quizzes: number;
  total_attempts: number;
  average_score: number;
  study_streak: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', {
          user_uuid: user.id,
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}