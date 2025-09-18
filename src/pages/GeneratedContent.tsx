import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Download, Share2, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";

// Mock data - in real app this would come from API
const mockContent = {
  question: "What is photosynthesis and how does it work?",
  subject: "biology",
  formats: {
    "2M": {
      title: "Quick Overview (2 minutes)",
      content: "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It occurs in two main stages: the light-dependent reactions in the thylakoids, where sunlight is captured and water is split to produce oxygen, and the light-independent reactions (Calvin cycle) in the stroma, where carbon dioxide is fixed into glucose using the energy from the first stage."
    },
    "5M": {
      title: "Detailed Explanation (5 minutes)",
      content: "Photosynthesis is a complex biochemical process that converts light energy into chemical energy. It takes place in chloroplasts, specifically in two locations: the thylakoids and the stroma.\n\n**Light-Dependent Reactions (Thylakoids):**\n- Chlorophyll absorbs photons of light\n- Water molecules are split (photolysis), releasing electrons, protons, and oxygen\n- Energy is used to pump protons across the thylakoid membrane\n- ATP and NADPH are produced\n\n**Light-Independent Reactions - Calvin Cycle (Stroma):**\n- CO₂ from the atmosphere is fixed by the enzyme RuBisCO\n- Using ATP and NADPH from the light reactions, CO₂ is reduced to form glucose\n- The cycle regenerates the starting molecule (RuBP) to continue the process\n\n**Overall Equation:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂"
    },
    "10M": {
      title: "Comprehensive Study (10 minutes)",
      content: "Photosynthesis is the fundamental process that sustains most life on Earth, converting solar energy into chemical energy stored in organic molecules.\n\n**Historical Context:**\nPhotosynthesis was first studied by Jan van Helmont in the 1600s, with major contributions from Joseph Priestley, Jan Ingenhousz, and others who gradually understood the role of light, air, and water.\n\n**Detailed Mechanism:**\n\n**1. Light-Dependent Reactions (Photo phase):**\n- Location: Thylakoid membranes of chloroplasts\n- Photosystem II (P680) captures light and splits water molecules\n- Electrons travel through electron transport chain\n- Photosystem I (P700) re-energizes electrons\n- Chemiosmosis produces ATP via ATP synthase\n- NADP⁺ is reduced to NADPH\n- Oxygen is released as a byproduct\n\n**2. Light-Independent Reactions (Calvin-Benson Cycle):**\n- Location: Stroma of chloroplasts\n- Carbon fixation: CO₂ combines with RuBP via RuBisCO enzyme\n- Reduction: 3-phosphoglycerate is reduced using ATP and NADPH\n- Regeneration: RuBP is regenerated to continue the cycle\n- Net product: Glucose (C₆H₁₂O₆)\n\n**Environmental Factors:**\n- Light intensity, wavelength, and duration\n- CO₂ concentration\n- Temperature\n- Water availability\n- Chlorophyll content\n\n**Ecological Importance:**\n- Primary source of oxygen in atmosphere\n- Base of most food chains\n- Carbon dioxide removal from atmosphere\n- Energy storage for ecosystems"
    },
    "essay": {
      title: "Complete Essay",
      content: "# Photosynthesis: The Foundation of Life on Earth\n\n## Introduction\n\nPhotosynthesis represents one of the most crucial biological processes on our planet, serving as the primary mechanism by which solar energy is converted into chemical energy and stored in organic compounds. This process, carried out by plants, algae, and certain bacteria, not only sustains these organisms but forms the foundation of virtually all food webs on Earth. Understanding photosynthesis is essential for comprehending how energy flows through ecosystems and how life as we know it is maintained.\n\n## The Process of Photosynthesis\n\nPhotosynthesis can be summarized by the equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. However, this simple equation masks a complex series of biochemical reactions that occur in two distinct phases.\n\n### Light-Dependent Reactions\n\nThe first phase occurs in the thylakoid membranes of chloroplasts. Here, chlorophyll and other pigments capture photons of light, initiating a cascade of energy transfers. Water molecules are split through photolysis, releasing electrons, protons, and oxygen gas. The energy from light is used to create a proton gradient across the thylakoid membrane, which drives the synthesis of ATP through chemiosmosis. Additionally, NADP⁺ is reduced to NADPH, creating the energy currency needed for the second phase.\n\n### Light-Independent Reactions (Calvin Cycle)\n\nIn the stroma, the Calvin cycle uses the ATP and NADPH produced in the light reactions to fix atmospheric CO₂ into organic molecules. The enzyme RuBisCO catalyzes the combination of CO₂ with ribulose bisphosphate (RuBP), beginning a cycle that ultimately produces glucose while regenerating RuBP to continue the process.\n\n## Significance and Impact\n\nPhotosynthesis has profound implications for life on Earth. It is responsible for producing the oxygen we breathe and removing carbon dioxide from the atmosphere. The process forms the base of food chains, converting inorganic carbon into organic compounds that serve as food for heterotrophic organisms. Furthermore, photosynthesis plays a crucial role in global climate regulation by acting as a carbon sink.\n\n## Conclusion\n\nPhotosynthesis stands as one of nature's most elegant solutions to energy conversion, supporting the vast majority of life on Earth. As we face challenges related to climate change and food security, understanding and potentially harnessing the principles of photosynthesis becomes increasingly important for developing sustainable technologies and maintaining our planet's delicate ecological balance."
    }
  }
};

export default function GeneratedContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("2M");
  const [isFavorited, setIsFavorited] = useState(false);

  const handleSaveToLibrary = () => {
    toast({
      title: "Saved to library",
      description: "Content has been added to your study library",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: mockContent.question,
          text: mockContent.formats[activeTab as keyof typeof mockContent.formats].content,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(mockContent.formats[activeTab as keyof typeof mockContent.formats].content);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
    }
  };

  const handleGenerateQuiz = () => {
    toast({
      title: "Generating quiz...",
      description: "Creating questions based on this content",
    });
    navigate(`/quiz/${id}`);
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF...",
      description: "Your study material is being prepared for download",
    });
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Content removed from your favorites" : "Content saved to your favorites",
    });
  };

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
                <Badge variant="secondary">{mockContent.subject}</Badge>
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
            <p className="text-foreground font-medium">{mockContent.question}</p>
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
              
              {Object.entries(mockContent.formats).map(([key, format]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{format.title}</h3>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-foreground">
                        {format.content}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleSaveToLibrary} variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Save to Library
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleGenerateQuiz}>
            <Trophy className="mr-2 h-4 w-4" />
            Generate Quiz
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
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