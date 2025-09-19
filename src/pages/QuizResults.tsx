import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trophy, Clock, Target, RotateCcw, Share2, Download, BookOpen, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for demonstration
const mockQuizData = {
  id: "1",
  title: "Quantum Physics Fundamentals",
  subject: "Physics",
  questions: [
    {
      id: "q1",
      question: "What is the fundamental principle that describes the wave-particle duality of matter?",
      options: [
        { id: "a", text: "Heisenberg Uncertainty Principle" },
        { id: "b", text: "de Broglie Principle" },
        { id: "c", text: "Pauli Exclusion Principle" },
        { id: "d", text: "Schrödinger Equation" }
      ],
      correctAnswer: "b",
      explanation: "The de Broglie principle states that all matter exhibits both wave and particle properties, with the wavelength inversely proportional to momentum."
    },
    {
      id: "q2",
      question: "In quantum mechanics, what does the wave function ψ (psi) represent?",
      options: [
        { id: "a", text: "The exact position of a particle" },
        { id: "b", text: "The probability amplitude of finding a particle in a given state" },
        { id: "c", text: "The energy of a quantum system" },
        { id: "d", text: "The momentum of a particle" }
      ],
      correctAnswer: "b",
      explanation: "The wave function ψ represents the probability amplitude, and |ψ|² gives the probability density of finding a particle in a particular state."
    }
  ]
};

const mockPreviousAttempts = [
  { attempt: 1, score: 75, date: "2024-01-15", timeSpent: 1200 },
  { attempt: 2, score: 82, date: "2024-01-10", timeSpent: 1350 },
  { attempt: 3, score: 67, date: "2024-01-05", timeSpent: 1800 }
];

const mockRecommendations = [
  {
    topic: "Wave-Particle Duality",
    reason: "You missed 2 questions on this topic",
    action: "Review Chapter 3: Quantum Mechanics Fundamentals"
  },
  {
    topic: "Quantum States",
    reason: "Scored below average on quantum state questions",
    action: "Practice more problems on quantum state representation"
  }
];

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Get results from session storage
    const savedResults = sessionStorage.getItem('quizResults');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      
      // Show celebration for good scores
      if (parsedResults.score >= 80) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } else {
      // Redirect if no results found
      navigate('/dashboard');
    }
  }, [navigate]);

  if (!results) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    </div>;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 80) return { text: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 70) return { text: "Fair", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const scoreBadge = getScoreBadge(results.score);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className={`h-16 w-16 ${getScoreColor(results.score)}`} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground">{mockQuizData.title}</p>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold ${getScoreColor(results.score)} mb-2`}>
                {results.score}%
              </div>
              <Badge className={scoreBadge.color} variant="secondary">
                {scoreBadge.text}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{results.correctAnswers}/{results.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{formatTime(results.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((results.timeSpent / results.totalQuestions) / 60 * 10) / 10}
                </p>
                <p className="text-sm text-muted-foreground">Avg Time/Question (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button onClick={() => navigate(`/quiz/${id}`)} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review">Answer Review</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Study Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Answer Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {mockQuizData.questions.map((question, index) => {
                      const userAnswer = results.answers[question.id];
                      const isCorrect = userAnswer === question.correctAnswer;
                      const userOption = question.options.find(opt => opt.id === userAnswer);
                      const correctOption = question.options.find(opt => opt.id === question.correctAnswer);

                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-4">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            ) : userAnswer ? (
                              <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-foreground mb-2">
                                Question {index + 1}: {question.question}
                              </p>
                              
                              <div className="space-y-2">
                                {userAnswer && (
                                  <div className={`p-2 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <p className="text-sm">
                                      <span className="font-medium">Your answer:</span> {userOption?.text}
                                    </p>
                                  </div>
                                )}
                                
                                {!isCorrect && (
                                  <div className="p-2 rounded bg-green-50 border border-green-200">
                                    <p className="text-sm">
                                      <span className="font-medium">Correct answer:</span> {correctOption?.text}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="p-2 rounded bg-blue-50 border border-blue-200">
                                  <p className="text-sm">
                                    <span className="font-medium">Explanation:</span> {question.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6">
              {/* Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPreviousAttempts.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Attempt {attempt.attempt}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(attempt.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {formatTime(attempt.timeSpent)}
                          </span>
                          <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                            {attempt.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Wave-Particle Duality</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Quantum States</span>
                        <span className="text-sm font-medium">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Mathematical Formalism</span>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Study Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{rec.topic}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                          <p className="text-sm font-medium text-primary">{rec.action}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievement Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Quiz Completion</p>
                        <p className="text-sm text-green-600">Complete your first quiz</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Earned!</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">High Scorer</p>
                        <p className="text-sm text-muted-foreground">Score 90% or higher on a quiz</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{results.score}/90%</p>
                      <Progress value={(results.score / 90) * 100} className="w-20 h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}