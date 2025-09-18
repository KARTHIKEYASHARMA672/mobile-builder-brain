import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload as UploadIcon, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Computer Science",
  "Economics",
  "Psychology",
  "Other"
];

export default function Upload() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "Image selected",
        description: "Ready to process your question image",
      });
    }
  };

  const handleCameraCapture = () => {
    // Trigger file input with camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        toast({
          title: "Photo captured",
          description: "Ready to process your question",
        });
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!question.trim() && !selectedFile) {
      toast({
        title: "Missing content",
        description: "Please provide a question or upload an image",
        variant: "destructive",
      });
      return;
    }

    if (!subject) {
      toast({
        title: "Missing subject",
        description: "Please select a subject for your question",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      toast({
        title: "Question processed!",
        description: "Your AI-generated content is ready",
      });
      navigate("/content/demo-123");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Upload Question</h1>
          <p className="text-sm text-muted-foreground">
            Get AI-powered explanations for your questions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Upload Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Camera Capture
              </CardTitle>
              <CardDescription>
                Take a photo of your question directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCameraCapture} className="w-full" size="lg">
                <Camera className="mr-2 h-4 w-4" />
                Open Camera
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadIcon className="mr-2 h-5 w-5" />
                Upload Image
              </CardTitle>
              <CardDescription>
                Select an image from your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full" size="lg">
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Input</CardTitle>
            <CardDescription>
              Type your question directly if you prefer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Subject</CardTitle>
            <CardDescription>
              Select the subject area for better AI responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj.toLowerCase()}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={processing}
          className="w-full" 
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              Process Question
            </>
          )}
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}