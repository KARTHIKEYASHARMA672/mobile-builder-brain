import { useState } from "react";
import { User, Settings, Trophy, Clock, BookOpen, Brain, Target, Download, LogOut, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNavigation from "@/components/BottomNavigation";
import { Link } from "react-router-dom";

// Mock user data
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "/placeholder.svg",
  joinedDate: "2024-01-01",
  profileCompletion: 85
};

// Mock statistics
const mockStats = {
  totalQuestions: 42,
  studyTime: 156, // hours
  quizzesTaken: 28,
  averageScore: 87,
  studyStreak: 12,
  subjectsStudied: 6
};

// Mock achievements
const mockAchievements = [
  { id: "1", name: "First Steps", description: "Upload your first question", earned: true, earnedDate: "2024-01-02" },
  { id: "2", name: "Quiz Master", description: "Take 10 quizzes", earned: true, earnedDate: "2024-01-10" },
  { id: "3", name: "Study Streak", description: "Study for 7 days in a row", earned: true, earnedDate: "2024-01-15" },
  { id: "4", name: "Subject Expert", description: "Master 5 different subjects", earned: false, progress: 60 },
  { id: "5", name: "Time Scholar", description: "Study for 100 hours total", earned: true, earnedDate: "2024-01-20" },
  { id: "6", name: "Perfect Score", description: "Get 100% on a quiz", earned: false, progress: 87 }
];

// Mock recent activity
const mockActivity = [
  { id: "1", type: "quiz", subject: "Physics", score: 92, date: "2024-01-22" },
  { id: "2", type: "upload", subject: "Mathematics", date: "2024-01-21" },
  { id: "3", type: "quiz", subject: "Chemistry", score: 88, date: "2024-01-20" },
  { id: "4", type: "study", subject: "History", duration: 45, date: "2024-01-19" }
];

export default function Profile() {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editedName, setEditedName] = useState(mockUser.name);
  const [editedEmail, setEditedEmail] = useState(mockUser.email);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Brain className="h-4 w-4 text-green-600" />;
      case "upload":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "study":
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                <AvatarFallback className="text-lg">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{mockUser.name}</h2>
                    <p className="text-muted-foreground">{mockUser.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(mockUser.joinedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                  
                  <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsEditProfileOpen(false)}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profile Completion</span>
                    <span className="text-sm font-medium">{mockUser.profileCompletion}%</span>
                  </div>
                  <Progress value={mockUser.profileCompletion} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.studyTime}h</p>
              <p className="text-sm text-muted-foreground">Study Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.quizzesTaken}</p>
              <p className="text-sm text-muted-foreground">Quizzes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.studyStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{mockStats.subjectsStudied}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Achievements and Activity */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid gap-4">
              {mockAchievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.earned ? "bg-primary/5 border-primary/20" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${achievement.earned ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Trophy className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                          {achievement.earned && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        
                        {achievement.earned ? (
                          <p className="text-xs text-muted-foreground">
                            Earned on {new Date(achievement.earnedDate!).toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justified-between">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              {mockActivity.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}