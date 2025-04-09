
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ShareDialog } from "@/components/ShareDialog";
import VoiceUpload from "@/components/VoiceUpload";
import { FileUploadList } from "@/components/FileUploadList";
import { supabase } from "@/integrations/supabase/client";
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
  RefreshCw,
  Share,
  Paintbrush,
  Download,
  Pencil,
  CheckCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [currentTab, setCurrentTab] = useState("preview");
  const [annotations, setAnnotations] = useState<Array<{x: number, y: number, text: string}>>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [currentAnnotationIndex, setCurrentAnnotationIndex] = useState(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

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

  // Draw annotations when they change or when the tab changes to annotations
  useEffect(() => {
    if (currentTab === "annotate" && canvasRef.current && imageRef.current && annotations.length > 0) {
      drawAnnotations();
    }
  }, [annotations, currentTab]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw annotations
    annotations.forEach((annotation, index) => {
      // Calculate position based on image dimensions
      const x = annotation.x * canvas.width;
      const y = annotation.y * canvas.height;
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.7)';
      ctx.fill();
      
      // Draw number
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
      
      // Draw annotation text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(annotation.text, x + 20, y);
    });
  };

  const handleAnnotationClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position relative to the image
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // If we're not editing an existing annotation, add a new one
    if (!isEditingAnnotation) {
      setAnnotations([...annotations, {x, y, text: annotationText || 'Note'}]);
      setAnnotationText('');
      drawAnnotations();
    } else {
      // If we're editing, update the existing annotation
      const updatedAnnotations = [...annotations];
      if (currentAnnotationIndex >= 0) {
        updatedAnnotations[currentAnnotationIndex] = {
          ...updatedAnnotations[currentAnnotationIndex],
          text: annotationText
        };
        setAnnotations(updatedAnnotations);
        setIsEditingAnnotation(false);
        setCurrentAnnotationIndex(-1);
        setAnnotationText('');
      }
    }
  };

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
      setUploadError("Invalid file type. Please upload a JPG, PNG, GIF, WebP, PDF, or text file.");
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a supported file type.",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Please upload a file less than 10MB in size.");
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file less than 10MB in size.",
      });
      return;
    }

    setFile(file);
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
    
    // Reset extracted data when a new file is selected
    setExtractedData(null);
    // Reset annotations
    setAnnotations([]);
    // Switch to preview tab
    setCurrentTab("preview");
  };

  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setUploadError(null);
    setAnnotations([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // For demonstration, simulate analysis with a delay
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
        description: "We've extracted information from your file.",
      });
    }, 2500);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Create a file path for storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 300);
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Save upload metadata to the database
      const { error: dbError } = await supabase
        .from('user_uploads')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath
        });
      
      if (dbError) throw dbError;
      
      // Complete upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Begin analysis after upload completes
      setTimeout(() => {
        setIsUploading(false);
        
        toast({
          title: "Upload successful",
          description: "Your file has been uploaded successfully.",
        });
        
        if (file.type.startsWith('image/')) {
          analyzeImage();
        } else {
          // For non-image files, just show success
          setExtractedData({
            metadata: {
              fileName: file.name,
              fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              fileType: file.type,
              createdAt: new Date().toISOString()
            }
          });
        }
      }, 500);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to upload the file. Please try again.");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload the file. Please try again.",
      });
      setIsUploading(false);
    }
  };

  const handleReanalyze = () => {
    if (file) {
      analyzeImage();
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
      case "clear":
        clearFile();
        break;
      case "analyze":
        handleReanalyze();
        break;
      case "cancel":
        if (isUploading || isAnalyzing) {
          // Simulate cancelling
          setIsUploading(false);
          setIsAnalyzing(false);
          toast({
            title: "Cancelled",
            description: "The current operation has been cancelled.",
          });
        }
        break;
      default:
        toast({
          description: `Command not recognized: ${command}`,
        });
    }
  };

  const downloadImage = () => {
    if (!preview) return;
    
    // If we're in annotation mode and have annotations, download the annotated image
    if (currentTab === "annotate" && annotations.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || !imageRef.current) return;
      
      // Create a new canvas for the combined image
      const downloadCanvas = document.createElement('canvas');
      downloadCanvas.width = canvas.width;
      downloadCanvas.height = canvas.height;
      const downloadCtx = downloadCanvas.getContext('2d');
      if (!downloadCtx) return;
      
      // Draw the original image
      downloadCtx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Draw the annotations on top
      downloadCtx.drawImage(canvas, 0, 0);
      
      // Convert to blob and download
      downloadCanvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotated_${file?.name || 'image.png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    } else {
      // Download the original image
      const a = document.createElement('a');
      a.href = preview;
      a.download = file?.name || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Upload & Analyze Files</h1>
        
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
                
                {extractedData && (
                  <ShareDialog
                    title={file?.name || "My File"}
                    description="Check out this file I analyzed"
                    imageUrl={preview}
                    trigger={
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                      >
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
          
          <Tabs defaultValue="upload" className="mb-8">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="files">My Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              {!preview && !file ? (
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
                  />
                  
                  <div className="text-center">
                    <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium">
                      Drag & drop your file here
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
                  {file?.type.startsWith('image/') ? (
                    <Tabs value={currentTab} onValueChange={setCurrentTab}>
                      <TabsList className="mb-4 grid w-full grid-cols-2">
                        <TabsTrigger value="preview" disabled={isUploading || isAnalyzing}>
                          Preview
                        </TabsTrigger>
                        <TabsTrigger value="annotate" disabled={!preview || isUploading || isAnalyzing}>
                          Annotate
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preview" className="relative min-h-[300px] overflow-hidden rounded-lg border bg-card shadow-sm">
                        <img
                          src={preview}
                          alt="Preview"
                          className="mx-auto max-h-[400px] max-w-full object-contain"
                          ref={imageRef}
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
                      </TabsContent>
                      
                      <TabsContent value="annotate" className="relative min-h-[300px] rounded-lg border bg-card p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant={isAnnotating ? "default" : "outline"}
                              onClick={() => setIsAnnotating(!isAnnotating)}
                              className="flex items-center gap-1"
                            >
                              {isAnnotating ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <Pencil className="h-4 w-4" />
                                  Add Annotation
                                </>
                              )}
                            </Button>
                            {isAnnotating && (
                              <input
                                type="text"
                                placeholder="Annotation text..."
                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={annotationText}
                                onChange={(e) => setAnnotationText(e.target.value)}
                              />
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setAnnotations([])}
                            className="h-9"
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto max-h-[400px] max-w-full object-contain"
                            ref={imageRef}
                            style={{ visibility: 'visible' }}
                          />
                          <canvas
                            ref={canvasRef}
                            onClick={handleAnnotationClick}
                            className="absolute left-0 top-0 cursor-crosshair"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              pointerEvents: isAnnotating ? 'auto' : 'none'
                            }}
                          />
                        </div>
                        
                        {annotations.length > 0 && (
                          <div className="mt-4">
                            <h3 className="mb-2 text-sm font-medium">Annotations:</h3>
                            <div className="space-y-2">
                              {annotations.map((annotation, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    {index + 1}
                                  </span>
                                  <span>{annotation.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Card className="relative min-h-[200px] flex items-center justify-center">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          {file?.type === 'application/pdf' ? (
                            <FileText className="h-16 w-16 text-red-500" />
                          ) : file?.type.includes('spreadsheet') || file?.type.includes('excel') ? (
                            <FileSpreadsheet className="h-16 w-16 text-green-500" />
                          ) : (
                            <FileText className="h-16 w-16 text-blue-500" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{file?.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {(file?.size ? (file.size / 1024 / 1024).toFixed(2) : '0')} MB • {file?.type}
                        </p>
                        
                        {!isUploading && !isAnalyzing && (
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-gray-200 p-1 text-gray-700 opacity-70 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
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
              
              {file && (
                <Card className="mb-6 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-5 w-5" />
                        ) : file.type === 'application/pdf' ? (
                          <FileText className="h-5 w-5" />
                        ) : file.type.includes('spreadsheet') || file.type.includes('excel') ? (
                          <FileSpreadsheet className="h-5 w-5" />
                        ) : (
                          <FileIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
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
                      {file?.type.startsWith('image/') && (
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
                      )}
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
                            <p className="text-sm text-foreground/80">{extractedData.text}</p>
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
                                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300"
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
                                <div key={i} className="color-item text-center">
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
                                  className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
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
                                  <span className="text-xs font-medium text-muted-foreground">
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
            </TabsContent>
            
            <TabsContent value="files">
              <FileUploadList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
