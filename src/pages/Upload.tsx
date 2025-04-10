
import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import VoiceUpload from "@/components/VoiceUpload";
import { useGeminiApi } from "@/hooks/useGeminiApi";
import { toast } from "sonner";
import { 
  Upload as UploadIcon, 
  ArrowRight, 
  Image as ImageIcon, 
  FileX,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, error, analyzeImage } = useGeminiApi();
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Reset states
      setFile(selectedFile);
      setUploadSuccess(false);
      setUploadError(null);
      
      // Preview for images
      if (selectedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        
        // Clean up the URL when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setPreviewUrl(null);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Reset states
      setFile(droppedFile);
      setUploadSuccess(false);
      setUploadError(null);
      
      // Preview for images
      if (droppedFile.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(droppedFile);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommand = (command: string) => {
    if (command === "select" || command === "upload") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (command === "clear") {
      handleClearFile();
    } else if (command === "analyze" && file) {
      handleUpload();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      // First, upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      // Show initial progress toast
      toast.info("Uploading file to storage...");
      
      const { error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Show progress update
      toast.info("File uploaded, analyzing with Gemini AI...");
      
      // Record the upload in the database
      const { error: dbError } = await supabase
        .from('user_uploads')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath
        });
      
      if (dbError) throw dbError;
      
      // Now, analyze the image with Gemini API with timeout handling
      try {
        const results = await analyzeImage(file);
        console.log("Analysis results:", results);
        
        setUploadSuccess(true);
        toast.success("File successfully uploaded and analyzed");
        
        // Navigate to the CSV display page with the result data
        navigate('/csv-display', { state: { data: results.extractedData || results } });
      } catch (analyzeError) {
        console.error("Analysis error:", analyzeError);
        
        // Check if it's a timeout error
        if (analyzeError.message && analyzeError.message.includes('timeout')) {
          setUploadError("Analysis timed out. The file may be too large or complex. Please try a smaller file or try again later.");
          toast.error("Analysis timed out. Please try again with a smaller file.");
        } else {
          setUploadError(analyzeError instanceof Error ? analyzeError.message : "An unknown error occurred during analysis");
          toast.error("Failed to analyze file");
        }
        
        // Even with analysis error, we'll still show a basic view of the uploaded file
        navigate('/csv-display', { 
          state: { 
            data: { 
              message: "Analysis unavailable. File was uploaded successfully but couldn't be processed.",
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            } 
          } 
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">Upload Files</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Upload images or documents for analysis using Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  isDragging ? 'border-brand-500 bg-brand-50' : 'border-muted hover:bg-muted/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,text/csv"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  {file ? (
                    <>
                      <div className="relative mb-4 overflow-hidden rounded-lg">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt="File preview" 
                            className="h-36 w-auto object-cover" 
                          />
                        ) : (
                          <div className="flex h-36 w-36 items-center justify-center bg-muted text-muted-foreground">
                            <FileIcon type={file.type} size={48} />
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearFile();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                      <h3 className="mb-1 text-lg font-semibold">Drag & drop or click to upload</h3>
                      <p className="text-sm text-muted-foreground">
                        Support images, PDF files, and CSV spreadsheets
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex flex-col space-y-3">
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Upload failed</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                {uploadSuccess && (
                  <Alert variant="default" className="border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>File uploaded and analyzed successfully</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    className="w-full"
                    disabled={!file || isUploading || isLoading}
                  >
                    {isUploading || isLoading ? (
                      <span className="flex items-center gap-1">
                        <LoadingSpinner />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-4 w-4" />
                        Upload & Analyze
                      </span>
                    )}
                  </Button>
                  <VoiceUpload onCommand={handleCommand} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>File Processing</CardTitle>
              <CardDescription>
                How your files are processed and analyzed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium">Supported Files</h3>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>Images (.jpg, .png, .webp)</li>
                  <li>Documents (.pdf)</li>
                  <li>Spreadsheets (.csv)</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="mb-2 text-lg font-medium">Process</h3>
                <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                  <li>Upload your file securely to our storage</li>
                  <li>Gemini AI analyzes the content</li>
                  <li>Results are displayed as CSV data for easy use</li>
                  <li>Download your data for offline access</li>
                </ol>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="mb-2 text-lg font-medium">Privacy & Security</h3>
                <p className="text-muted-foreground">
                  Files are securely stored and only accessible to you. 
                  Processing happens on our secure servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Helper component for file icons
const FileIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  if (type.startsWith('image/')) {
    return <ImageIcon style={{ width: size, height: size }} className="text-blue-500" />;
  } else if (type === 'application/pdf') {
    return <FileX style={{ width: size, height: size }} className="text-red-500" />;
  } else {
    return <FileX style={{ width: size, height: size }} className="text-gray-500" />;
  }
};

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default Upload;
