import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Mail, Calendar, Trophy, Target, BookOpen, Brain, Settings, Download, LogOut } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: ''
  });

  // Mock data for demonstration
  const [mockStats] = useState({
    totalQuestions: 47,
    totalQuizzes: 23,
    averageScore: 89,
    studyStreak: 12,
    studyTime: 324, // minutes
    completedCourses: 3
  });

  const [mockAchievements] = useState([
    { id: "1", name: "First Quiz Master", description: "Complete your first quiz", earned: true, date: "2024-01-15" },
    { id: "2", name: "Study Streak", description: "Study for 7 days in a row", earned: true, date: "2024-01-20" },
    { id: "3", name: "Perfect Score", description: "Get 100% on a quiz", earned: true, date: "2024-01-18" },
    { id: "4", name: "Night Owl", description: "Study after 10 PM", earned: false, date: null },
    { id: "5", name: "Speed Learner", description: "Complete 10 quizzes in one day", earned: false, date: null },
    { id: "6", name: "Knowledge Seeker", description: "Upload 50 questions", earned: false, date: null }
  ]);

  const [mockActivity] = useState([
    { id: "1", type: "quiz", subject: "Physics", score: 92, date: "2024-01-22" },
    { id: "2", type: "upload", subject: "Mathematics", date: "2024-01-21" },
    { id: "3", type: "quiz", subject: "Chemistry", score: 88, date: "2024-01-20" },
    { id: "4", type: "study", subject: "History", duration: 45, date: "2024-01-19" }
  ]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will be ready shortly and sent to your email.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Brain className="h-4 w-4 text-accent" />;
      case "upload":
        return <BookOpen className="h-4 w-4 text-primary" />;
      case "study":
        return <Target className="h-4 w-4 text-secondary" />;
      default:
        return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case "quiz":
        return `Completed ${activity.subject} quiz - ${activity.score}%`;
      case "upload":
        return `Uploaded new ${activity.subject} question`;
      case "study":
        return `Studied ${activity.subject} for ${activity.duration} minutes`;
      default:
        return "Unknown activity";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Your Profile</h1>
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{profile?.full_name || user?.user_metadata?.full_name || "Student"}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {new Date(user?.created_at || "").toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {profile?.bio || "No bio added yet."}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveProfile} size="sm" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockStats.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockStats.totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Quizzes Taken</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockStats.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockStats.studyStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <UserIcon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{Math.floor(mockStats.studyTime / 60)}h</p>
              <p className="text-sm text-muted-foreground">Study Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockStats.completedCourses}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements and Activity Tabs */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Track your learning milestones and unlock new badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{achievement.name}</p>
                          {achievement.earned && (
                            <Badge variant="secondary">Earned</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned on {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest study sessions and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account data and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}