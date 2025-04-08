
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  UploadIcon, 
  X, 
  Image as ImageIcon, 
  FileCheck, 
  FileText, 
  FileImage, 
  FilePen, 
  Eye, 
  EyeOff, 
  RefreshCw 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(true);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Clear previous errors
    setUploadError(null);
    
    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.");
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Please upload an image less than 10MB in size.");
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image less than 10MB in size.",
      });
      return;
    }

    setFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    // Reset extracted data when a new file is selected
    setExtractedData(null);
  };

  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis with a delay
    setTimeout(() => {
      // Mock extracted data based on file type and name
      const isDocument = file.name.toLowerCase().includes("doc") || 
                          file.name.toLowerCase().includes("text") ||
                          file.name.toLowerCase().includes("pdf");
      
      const isPhoto = file.name.toLowerCase().includes("photo") || 
                      file.name.toLowerCase().includes("img") ||
                      file.type === "image/jpeg";
      
      const mockData = {
        text: isDocument ? "Sample extracted text from the document. This would be actual OCR result in production." : "",
        objects: isPhoto ? ["person", "tree", "building"] : [],
        colors: ["#3B82F6", "#10B981", "#F59E0B"],
        metadata: {
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: file.type,
          dimensions: "1200 x 800 px",
          createdAt: new Date().toISOString()
        },
        tags: isDocument ? ["document", "text"] : isPhoto ? ["photo", "landscape"] : ["drawing", "artwork"],
        confidence: 0.89,
        language: "English",
      };
      
      setExtractedData(mockData);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: "We've extracted information from your image.",
      });
    }, 2500);
  };

  const handleUpload = () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    // Simulate upload with progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Begin analysis after upload completes
          setTimeout(() => {
            setIsUploading(false);
            analyzeImage();
          }, 500);
        }
        return newProgress;
      });
    }, 300);
  };

  const handleReanalyze = () => {
    if (file) {
      analyzeImage();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Upload & Analyze Photo</h1>
        
        <div className="mx-auto max-w-2xl">
          <div 
            className={`relative mb-6 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100 ${
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
            />
            
            {!preview ? (
              <div className="text-center">
                <UploadIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-lg font-medium text-gray-700">
                  Drag & drop your photo here
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: JPG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative h-full w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-[250px] max-w-full rounded-lg object-contain"
                />
                {!isUploading && !isAnalyzing && (
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-gray-800 p-1 text-white opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {uploadError && (
            <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {uploadError}
            </div>
          )}
          
          {file && (
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    {isUploading || isAnalyzing ? (
                      <div className="text-right text-sm font-medium text-brand-600">
                        {isUploading ? `${uploadProgress}%` : 'Analyzing...'}
                      </div>
                    ) : (
                      <FileCheck className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-3">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {isAnalyzing && (
                  <div className="mt-3">
                    <Progress value={undefined} className="h-2 animate-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {extractedData && (
            <Collapsible
              open={isDataOpen}
              onOpenChange={setIsDataOpen}
              className="mb-6 rounded-lg border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-lg font-semibold">Extracted Data</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReanalyze();
                    }}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Re-analyze
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isDataOpen ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="border-t px-4 py-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    {extractedData.text && (
                      <div className="analysis-section">
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Extracted Text</h4>
                        </div>
                        <p className="text-sm text-gray-600">{extractedData.text}</p>
                      </div>
                    )}
                    
                    {extractedData.objects && extractedData.objects.length > 0 && (
                      <div className="analysis-section">
                        <div className="mb-2 flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Detected Objects</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {extractedData.objects.map((obj: string, i: number) => (
                            <span 
                              key={i} 
                              className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {extractedData.colors && extractedData.colors.length > 0 && (
                      <div className="analysis-section">
                        <div className="mb-2 flex items-center gap-2">
                          <FilePen className="h-4 w-4 text-purple-500" />
                          <h4 className="font-medium">Dominant Colors</h4>
                        </div>
                        <div className="flex gap-2">
                          {extractedData.colors.map((color: string, i: number) => (
                            <div key={i} className="color-item">
                              <div 
                                className="h-8 w-8 rounded-md" 
                                style={{ backgroundColor: color }}
                              />
                              <span className="mt-1 text-xs">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {extractedData.tags && extractedData.tags.length > 0 && (
                      <div className="analysis-section">
                        <div className="mb-2 flex items-center gap-2">
                          <FilePen className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium">Tags</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {extractedData.tags.map((tag: string, i: number) => (
                            <span 
                              key={i} 
                              className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {extractedData.metadata && (
                      <div className="analysis-section col-span-full">
                        <div className="mb-2 flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Metadata</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                          {Object.entries(extractedData.metadata).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <span className="text-xs font-medium text-gray-500">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                              <p className="truncate">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || isAnalyzing}
              className="min-w-[200px]"
            >
              {isUploading 
                ? "Uploading..." 
                : isAnalyzing 
                  ? "Analyzing..." 
                  : extractedData 
                    ? "Upload Again" 
                    : "Upload & Analyze"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
