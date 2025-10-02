import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Download, Share2, Trophy, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import { useQuestions } from "@/hooks/useQuestions";
import { useGeneratedContent } from "@/hooks/useGeneratedContent";
import { useFavorites } from "@/hooks/useFavorites";
import { exportToPDF } from "@/utils/pdfExport";
import { shareContent } from "@/utils/webApis";

export default function GeneratedContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getQuestionById } = useQuestions();
  const { getContentForQuestion } = useGeneratedContent();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [activeTab, setActiveTab] = useState("2M");
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Load question
      const questionData = await getQuestionById(id);
      if (!questionData) {
        toast({
          title: "Error",
          description: "Question not found",
          variant: "destructive",
        });
        navigate('/library');
        return;
      }
      setQuestion(questionData);

      // Load generated content
      const contentData = await getContentForQuestion(id);
      const contentMap: Record<string, string> = {};
      contentData.forEach((item) => {
        contentMap[item.content_type] = item.content;
      });
      setContents(contentMap);

      // Check if favorited
      const favoriteStatus = isFavorite(id);
      setIsFavorited(favoriteStatus);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!question) return;
    
    const currentContent = contents[activeTab] || '';
    const success = await shareContent({
      title: question.original_text,
      text: `${activeTab} Answer:\n\n${currentContent}`
    });

    if (success) {
      toast({
        title: "Shared",
        description: "Content shared successfully",
      });
    }
  };

  const handleGenerateQuiz = () => {
    if (!id) return;
    
    toast({
      title: "Generating quiz...",
      description: "Creating questions based on this content",
    });
    navigate(`/quiz/${id}`);
  };

  const handleExportPDF = async () => {
    if (!question) return;
    
    try {
      const formattedContent: Array<{ type: string; text: string }> = [];
      
      // Add all available content formats
      Object.entries(contents).forEach(([format, text]) => {
        formattedContent.push({
          type: format,
          text: text
        });
      });

      exportToPDF({
        question: question.original_text,
        subject: question.subject || undefined,
        content: formattedContent,
        createdAt: question.created_at
      });

      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    
    try {
      if (isFavorited) {
        await removeFromFavorites(id);
        setIsFavorited(false);
      } else {
        await addToFavorites(id);
        setIsFavorited(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Generated Content</h1>
                {question.subject && <Badge variant="secondary">{question.subject}</Badge>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={isFavorited ? "text-yellow-500" : ""}
            >
              <Star className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Question Display */}
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-medium">{question.original_text}</p>
            {question.image_url && (
              <img 
                src={question.image_url} 
                alt="Question" 
                className="mt-4 rounded-lg max-w-full h-auto"
              />
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Explanations</CardTitle>
            <CardDescription>
              Choose the format that best fits your study time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="2M">2 Min</TabsTrigger>
                <TabsTrigger value="5M">5 Min</TabsTrigger>
                <TabsTrigger value="10M">10 Min</TabsTrigger>
                <TabsTrigger value="essay">Essay</TabsTrigger>
              </TabsList>
              
              {(['2M', '5M', '10M', 'essay'] as const).map((format) => (
                <TabsContent key={format} value={format} className="mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {format === '2M' && '2-Minute Explanation'}
                      {format === '5M' && '5-Minute Explanation'}
                      {format === '10M' && '10-Minute Explanation'}
                      {format === 'essay' && 'Complete Essay'}
                    </h3>
                    {contents[format] ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-foreground">
                          {contents[format]}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <p>Content not available for this format</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleGenerateQuiz}>
            <Trophy className="mr-2 h-4 w-4" />
            Generate Quiz
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className="col-span-2">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* Related Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Related Questions</CardTitle>
            <CardDescription>
              You might also be interested in these topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "How does cellular respiration relate to photosynthesis?",
                "What are the different types of photosynthesis?",
                "How do environmental factors affect photosynthesis rate?"
              ].map((question, index) => (
                <Button key={index} variant="ghost" className="w-full justify-start h-auto p-3">
                  <div className="text-left">
                    <p className="text-sm">{question}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}