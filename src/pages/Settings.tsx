import { useState } from "react";
import { ArrowLeft, Bell, Moon, Sun, Globe, Shield, HelpCircle, Mail, Info, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    quizResults: true,
    achievements: true,
    weeklyProgress: false
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    defaultStudyTime: "25",
    autoGenerateQuiz: true
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Study Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified about scheduled study sessions</p>
                </div>
                <Switch
                  checked={notifications.studyReminders}
                  onCheckedChange={(value) => handleNotificationChange("studyReminders", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiz Results</p>
                  <p className="text-sm text-muted-foreground">Receive notifications when quiz results are ready</p>
                </div>
                <Switch
                  checked={notifications.quizResults}
                  onCheckedChange={(value) => handleNotificationChange("quizResults", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Achievements</p>
                  <p className="text-sm text-muted-foreground">Celebrate your learning milestones</p>
                </div>
                <Switch
                  checked={notifications.achievements}
                  onCheckedChange={(value) => handleNotificationChange("achievements", value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Progress</p>
                  <p className="text-sm text-muted-foreground">Weekly summary of your study progress</p>
                </div>
                <Switch
                  checked={notifications.weeklyProgress}
                  onCheckedChange={(value) => handleNotificationChange("weeklyProgress", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Appearance & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange("theme", value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange("language", value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Study Time</p>
                  <p className="text-sm text-muted-foreground">Default timer duration for study sessions</p>
                </div>
                <Select value={preferences.defaultStudyTime} onValueChange={(value) => handlePreferenceChange("defaultStudyTime", value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Generate Quiz</p>
                  <p className="text-sm text-muted-foreground">Automatically create quizzes from uploaded content</p>
                </div>
                <Switch
                  checked={preferences.autoGenerateQuiz}
                  onCheckedChange={(value) => handlePreferenceChange("autoGenerateQuiz", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Clear Cache
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Reset All Settings
              </Button>
            </CardContent>
          </Card>

          {/* Support & Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                    <DialogDescription>
                      We're here to help! Send us a message and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="What can we help you with?" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsSupportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsSupportDialogOpen(false)}>
                        Send Message
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ & Help Center
              </Button>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">App Version</p>
                  <p className="text-sm text-muted-foreground">AI Study Buddy v1.0.0</p>
                </div>
                <Badge variant="secondary">Latest</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Privacy Policy</p>
                <p>• Terms of Service</p>
                <p>• Open Source Licenses</p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <h4 className="font-semibold text-destructive mb-2">This will delete:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• All your uploaded questions</li>
                        <li>• Generated study materials</li>
                        <li>• Quiz history and progress</li>
                        <li>• Achievement records</li>
                        <li>• Account settings and preferences</li>
                      </ul>
                    </div>
                    <div>
                      <Label htmlFor="confirm">Type "DELETE" to confirm</Label>
                      <Input id="confirm" placeholder="DELETE" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}