import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Plus, BookOpen, Trophy, Clock, Menu, Brain, Camera, Target, Zap } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import StudyTimer from "@/components/StudyTimer";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock data for demonstration
  const [mockStats] = useState({
    totalQuestions: 12,
    studyTime: 45, // minutes
    quizzesTaken: 8,
    averageScore: 85,
    studyStreak: 5
  });

  const [mockActivity] = useState([
    { id: "1", title: "Quantum Physics Quiz", subject: "Physics", type: "quiz", score: 92, date: "2024-01-22" },
    { id: "2", title: "Calculus Problems", subject: "Mathematics", type: "upload", date: "2024-01-21" },
    { id: "3", title: "Chemistry Review", subject: "Chemistry", type: "study", date: "2024-01-20" }
  ]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">AI Study Buddy</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.studyTime} min</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">Quiz performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity, Quick Actions & Study Timer */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Brain className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subject} • {activity.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.score ? `${activity.score}%` : activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/upload">
                  <Button className="w-full justify-start" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Question
                  </Button>
                </Link>
                <Link to="/quiz/1">
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Button>
                </Link>
                <Link to="/library">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Library
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Study Goals
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Timer */}
          <StudyTimer className="lg:col-span-1" />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}