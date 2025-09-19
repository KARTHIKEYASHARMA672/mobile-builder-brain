import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, X, Flag, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Mock quiz data
const mockQuiz = {
  id: "1",
  title: "Quantum Physics Fundamentals",
  subject: "Physics",
  totalQuestions: 10,
  timeLimit: 1800, // 30 minutes in seconds
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
    },
    // Add more questions as needed...
  ]
};

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isPaused]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / mockQuiz.timeLimit) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 25) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [mockQuiz.questions[currentQuestion].id]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSubmitQuiz = () => {
    // Calculate results and navigate to results page
    const answeredQuestions = Object.keys(selectedAnswers).length;
    const correctAnswers = mockQuiz.questions.filter(q => 
      selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const results = {
      quizId: id,
      totalQuestions: mockQuiz.questions.length,
      answeredQuestions,
      correctAnswers,
      score: Math.round((correctAnswers / mockQuiz.questions.length) * 100),
      timeSpent: mockQuiz.timeLimit - timeRemaining,
      answers: selectedAnswers
    };

    // Store results in session storage for the results page
    sessionStorage.setItem('quizResults', JSON.stringify(results));
    navigate(`/quiz-results/${id}`);
  };

  const currentQ = mockQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuiz.questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{mockQuiz.title}</h1>
                <p className="text-sm text-muted-foreground">{mockQuiz.subject}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="text-muted-foreground"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              
              <div className={`flex items-center gap-2 ${getTimeColor()}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestion + 1} of {mockQuiz.questions.length}
              </span>
              <span className="text-muted-foreground">
                {answeredCount}/{mockQuiz.questions.length} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-start justify-between">
                <Badge variant="outline">Question {currentQuestion + 1}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFlagQuestion}
                  className={flaggedQuestions.has(currentQuestion) ? "text-yellow-600" : "text-muted-foreground"}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Question Text */}
              <div>
                <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-primary/50 ${
                      selectedAnswers[currentQ.id] === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQ.id] === option.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      }`}>
                        <span className="text-sm font-medium">
                          {option.id.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-foreground">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === mockQuiz.questions.length - 1 ? (
              <Button 
                onClick={() => setShowSubmitDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestion === mockQuiz.questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {mockQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? "bg-primary text-primary-foreground"
                      : selectedAnswers[mockQuiz.questions[index].id]
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : flaggedQuestions.has(index)
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Current</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved, but the timer will stop. You can resume this quiz later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(-1)}>
              Exit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {mockQuiz.questions.length} questions. 
              {answeredCount < mockQuiz.questions.length && " Unanswered questions will be marked as incorrect."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitQuiz}>
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <Pause className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Quiz Paused</h3>
              <p className="text-muted-foreground mb-4">Click the play button to resume</p>
              <Button onClick={() => setIsPaused(false)}>
                <Play className="h-4 w-4 mr-2" />
                Resume Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}