import { useState } from "react";
import { Search, Filter, Download, Trash2, BookOpen, FileText, Brain, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BottomNavigation from "@/components/BottomNavigation";

// Mock data for demonstration
const mockContent = [
  {
    id: "1",
    title: "Quantum Physics Fundamentals",
    subject: "Physics",
    type: "notes",
    preview: "Understanding wave-particle duality and quantum mechanics principles...",
    createdAt: "2024-01-15",
    thumbnail: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Calculus Integration Methods",
    subject: "Mathematics",
    type: "quiz",
    preview: "Various techniques for solving integration problems...",
    createdAt: "2024-01-14",
    thumbnail: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Organic Chemistry Reactions",
    subject: "Chemistry",
    type: "notes",
    preview: "Key organic reactions and their mechanisms...",
    createdAt: "2024-01-13",
    thumbnail: "/placeholder.svg"
  },
  {
    id: "4",
    title: "World War II Timeline",
    subject: "History",
    type: "essay",
    preview: "Major events and turning points of WWII...",
    createdAt: "2024-01-12",
    thumbnail: "/placeholder.svg"
  }
];

const subjects = ["All", "Physics", "Mathematics", "Chemistry", "History", "Biology", "English"];
const contentTypes = ["All", "notes", "quiz", "essay", "questions"];

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const matchesType = selectedType === "All" || item.type === selectedType;
    
    return matchesSearch && matchesSubject && matchesType;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "subject":
        return a.subject.localeCompare(b.subject);
      default:
        return 0;
    }
  });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.length === sortedContent.length ? [] : sortedContent.map(item => item.id));
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "notes":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <Brain className="h-4 w-4" />;
      case "essay":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "notes":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "quiz":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "essay":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (sortedContent.length === 0 && searchQuery === "" && selectedSubject === "All" && selectedType === "All") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Library</h1>
          
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <BookOpen className="h-24 w-24 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your library is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Start uploading questions and generating content to build your personal study library.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Upload Your First Question
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">My Library</h1>
          <Button
            variant="outline"
            onClick={() => setIsSelectMode(!isSelectMode)}
            className="text-sm"
          >
            {isSelectMode ? "Cancel" : "Select"}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {isSelectMode && (
          <div className="bg-card border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.length === sortedContent.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} of {sortedContent.length} selected
                </span>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subject Tabs */}
        <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="mb-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
              {subjects.map(subject => (
                <TabsTrigger
                  key={subject}
                  value={subject}
                  className="whitespace-nowrap px-3 py-1.5 text-sm font-medium"
                >
                  {subject}
                  {subject !== "All" && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {mockContent.filter(item => item.subject === subject).length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        {/* Content Grid */}
        {sortedContent.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No content found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedContent.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        {getContentIcon(item.type)}
                        <Badge variant="secondary" className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Generate Quiz</DropdownMenuItem>
                        <DropdownMenuItem>Export PDF</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.subject}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}