import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Users, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            AI Study Buddy
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your learning with AI-powered explanations, interactive quizzes, and personalized study materials
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose AI Study Buddy?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant explanations in multiple formats: 2-minute, 5-minute, 10-minute, and full essays
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically generate structured study notes from your questions and organize by subject
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Interactive Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Test your knowledge with AI-generated quizzes and track your progress over time
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your learning journey with detailed analytics and personalized recommendations
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students who are already learning smarter with AI Study Buddy
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/auth">Start Learning Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AI Study Buddy. Your intelligent learning companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
