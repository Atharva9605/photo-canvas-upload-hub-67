import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import VoiceUpload from "@/components/VoiceUpload";
import { FileUploadList } from "@/components/FileUploadList";
import { 
  Upload as UploadIcon, 
  X,
  Image as ImageIcon, 
  FileCheck, 
  FileText, 
  Download,
  Files,
  FileCog,
  Brain
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useGeminiApi } from "@/hooks/useGeminiApi";
import { toast } from "sonner";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();
  const { analyzeImage, processFiles, isLoading: isApiLoading } = useGeminiApi();

  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      validateAndSetFiles(fileArray);
    }
  };

  const validateAndSetFiles = (files: File[]) => {
    setUploadError(null);
    setAnalysisResults(null);
    
    const validFiles = files.filter(file => {
      if (!acceptedFileTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Please upload a supported file type.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Please upload a file less than 10MB in size.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) {
      return;
    }
    
    setSelectedFiles(validFiles);
    
    // Set preview for the first image if it's an image
    if (validFiles[0].type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(validFiles[0]);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  };

  const clearFiles = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFiles([]);
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 300);
      
      // Process all selected files
      const result = await processFiles(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result && result.analysisId) {
        setAnalysisId(result.analysisId);
      }
      
      setAnalysisResults(result);
      
      setTimeout(() => {
        setIsUploading(false);
        toastNotification({
          title: "Upload successful",
          description: "Your files have been uploaded and analyzed successfully.",
        });
      }, 500);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadError("Failed to upload the files. Please try again.");
      toastNotification({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload the files. Please try again.",
      });
      setIsUploading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please upload files to analyze");
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await processFiles(selectedFiles);
      setAnalysisResults(result);
      
      // If we have an analysis ID, store it for navigation
      if (result && result.analysisId) {
        setAnalysisId(result.analysisId);
      }
      
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Error analyzing files:", error);
      toast.error("Failed to analyze files. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewAnalysisDetails = () => {
    if (analysisId) {
      navigate(`/analysis/${analysisId}`);
    } else {
      toast.error("No analysis ID available");
    }
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "select":
        fileInputRef.current?.click();
        break;
      case "upload":
        handleUpload();
        break;
      case "analyze":
        handleAnalyzeImage();
        break;
      case "clear":
        clearFiles(); // Fixed: Changed from clearFile to clearFiles
        break;
      case "cancel":
        if (isUploading) {
          setIsUploading(false);
          toastNotification({
            title: "Cancelled",
            description: "The upload has been cancelled.",
          });
        }
        break;
      default:
        toastNotification({
          description: `Command not recognized: ${command}`,
        });
    }
  };

  const downloadImage = () => {
    if (!preview) return;
    
    const a = document.createElement('a');
    a.href = preview;
    a.download = selectedFiles[0]?.name || 'image.png'; // Fixed: Changed from file to selectedFiles[0]
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Upload Files</h1>
        
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <VoiceUpload onCommand={handleVoiceCommand} />
              <p className="text-sm text-muted-foreground">Use voice commands to control uploads</p>
            </div>
            {preview && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={downloadImage}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="upload" className="mb-8" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="files">My Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              {selectedFiles.length === 0 ? (
                <div 
                  className={`relative mb-6 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/40 p-6 transition-colors hover:bg-muted/70 ${
                    isDragging ? "border-primary bg-primary/5" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={acceptedFileTypes.join(",")}
                    onChange={handleFileChange}
                    multiple
                  />
                  
                  <div className="text-center">
                    <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium">
                      Drag & drop your files here
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF, WebP, PDF, TXT, XLS, XLSX (max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  {selectedFiles[0]?.type.startsWith('image/') && preview ? (
                    <div className="relative min-h-[300px] overflow-hidden rounded-lg border bg-card shadow-sm">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto max-h-[400px] max-w-full object-contain"
                      />
                      {!isUploading && (
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-full bg-gray-800 p-1 text-white opacity-70 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFiles();
                          }}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <Card className="relative min-h-[200px] flex items-center justify-center">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          {selectedFiles[0]?.type === 'application/pdf' ? (
                            <FileText className="h-16 w-16 text-red-500" />
                          ) : selectedFiles[0]?.type.includes('spreadsheet') || selectedFiles[0]?.type.includes('excel') ? (
                            <FileCog className="h-16 w-16 text-green-500" />
                          ) : (
                            <FileText className="h-16 w-16 text-blue-500" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{selectedFiles.length} file(s) selected</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {(selectedFiles[0]?.size ? (selectedFiles[0].size / 1024 / 1024).toFixed(2) : '0')} MB • {selectedFiles[0]?.type}
                        </p>
                        
                        {!isUploading && (
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-gray-200 p-1 text-gray-700 opacity-70 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFiles();
                            }}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
              {uploadError && (
                <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {uploadError}
                </div>
              )}
              
              {selectedFiles.length > 0 && (
                <Card className="mb-6 overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Selected Files ({selectedFiles.length})</h3>
                    
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-5 w-5" />
                          ) : file.type === 'application/pdf' ? (
                            <FileText className="h-5 w-5" />
                          ) : file.type.includes('spreadsheet') || file.type.includes('excel') ? (
                            <FileCog className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div>
                          {isUploading ? (
                            <div className="text-right text-sm font-medium text-brand-600">
                              {uploadProgress}%
                            </div>
                          ) : (
                            <FileCheck className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isUploading && (
                      <div className="mt-3">
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {analysisResults && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(analysisResults, null, 2)}
                      </pre>
                    </div>
                    {analysisId && (
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={viewAnalysisDetails}
                          size="sm"
                        >
                          View Full Analysis
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="min-w-[200px]"
                >
                  {isUploading ? "Uploading..." : "Process Files"}
                </Button>
                
                {selectedFiles.length > 0 && !isAnalyzing && (
                  <Button
                    onClick={handleAnalyzeImage}
                    disabled={isUploading || isAnalyzing || isApiLoading}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze with Gemini
                  </Button>
                )}
                
                {isAnalyzing && (
                  <Button disabled className="min-w-[200px]">
                    <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing...
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="files">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Files</h2>
                <Button onClick={() => navigate("/all-files")} variant="outline" size="sm" className="flex items-center gap-1">
                  <Files className="h-4 w-4" />
                  View All Files
                </Button>
              </div>
              <FileUploadList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
