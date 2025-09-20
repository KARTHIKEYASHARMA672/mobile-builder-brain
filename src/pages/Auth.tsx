import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, Brain } from "lucide-react";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("fullName") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Brain className="h-8 w-8" />
            AI Study Buddy
          </CardTitle>
          <CardDescription>Your intelligent learning companion</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}