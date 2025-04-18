import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
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
  X,
  Camera,
  FilePlus,
  Smartphone,
  FileImage
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import CameraCapture from "@/components/CameraCapture";
import { createPdfFromImages, downloadPdf } from "@/services/pdfService";
import { useMediaQuery } from "@/hooks/use-mobile";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedFilesForPdf, setSelectedFilesForPdf] = useState<boolean[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, error, analyzeImage } = useGeminiApi();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [hasCameraSupport, setHasCameraSupport] = useState(false);
  
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCameraSupport(videoDevices.length > 0);
        })
        .catch(err => {
          console.error('Error checking camera:', err);
          setHasCameraSupport(false);
        });
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFilesToCollection(selectedFiles);
    }
  };

  const addFilesToCollection = (selectedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setUploadSuccess(false);
    setUploadError(null);
    const newPreviews = selectedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviews]);
    setSelectedFilesForPdf(prev => [...prev, ...selectedFiles.map(() => true)]);
    return () => {
      newPreviews.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFilesToCollection(droppedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    const newSelectedFiles = [...selectedFilesForPdf];
    
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    newSelectedFiles.splice(index, 1);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    setSelectedFilesForPdf(newSelectedFiles);
    
    if (newFiles.length === 0) {
      setUploadSuccess(false);
      setUploadError(null);
    }
  };

  const handleClearAllFiles = () => {
    previewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    setFiles([]);
    setPreviewUrls([]);
    setSelectedFilesForPdf([]);
    setUploadSuccess(false);
    setUploadError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (capturedFile: File) => {
    addFilesToCollection([capturedFile]);
    toast.success("Photo captured successfully!");
  };

  const toggleFileSelection = (index: number) => {
    const newSelectedFiles = [...selectedFilesForPdf];
    newSelectedFiles[index] = !newSelectedFiles[index];
    setSelectedFilesForPdf(newSelectedFiles);
  };

  const handleCreatePdf = async () => {
    const selectedImageFiles = files.filter((file, index) => 
      selectedFilesForPdf[index] && file.type.startsWith('image/')
    );
    
    if (selectedImageFiles.length === 0) {
      toast.error("Please select at least one image to create a PDF");
      return;
    }
    
    try {
      toast.info("Creating PDF...");
      
      const pdfBlob = await createPdfFromImages(selectedImageFiles);
      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const pdfFile = new File([pdfBlob], `photo-upload-${timestamp}.pdf`, { type: 'application/pdf' });
      
      addFilesToCollection([pdfFile]);
      
      toast.success("PDF created successfully!");
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    }
  };

  const handleCommand = (command: string) => {
    if (command === "select" || command === "upload") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else if (command === "clear") {
      handleClearAllFiles();
    } else if (command === "analyze" && files.length > 0) {
      handleUpload();
    } else if (command === "camera" && hasCameraSupport) {
      setIsCameraOpen(true);
    } else if (command === "pdf") {
      handleCreatePdf();
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      toast.info("Uploading files to storage...");
      
      const uploadedFiles = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('user_files')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { error: dbError, data: fileData } = await supabase
          .from('user_uploads')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath
          })
          .select('id')
          .single();
        
        if (dbError) throw dbError;
        
        uploadedFiles.push({
          id: fileData.id,
          file: file,
          path: filePath
        });
      }
      
      toast.info("Files uploaded, analyzing with Gemini AI...");
      
      const pdfFile = files.find(file => file.type === 'application/pdf');
      const fileToProcess = pdfFile || files[0];
      
      const results = await analyzeImage(fileToProcess);
      console.log("Analysis results:", results);
      
      let extractedData = [];
      
      if (results?.extractedData && Array.isArray(results.extractedData)) {
        extractedData = results.extractedData;
      } else if (results?.data && Array.isArray(results.data)) {
        extractedData = results.data;
      }
      
      const formattedData = extractedData.map((item: any, index: number) => ({
        Entry_ID: item.Entry_ID || index + 1,
        DATE: item.DATE || new Date().toISOString().split('T')[0],
        PARTICULARS: item.PARTICULARS || '',
        Voucher_BillNo: item.Voucher_BillNo || '',
        RECEIPTS_Quantity: Number(item.RECEIPTS_Quantity || 0),
        RECEIPTS_Amount: Number(item.RECEIPTS_Amount || 0),
        ISSUED_Quantity: Number(item.ISSUED_Quantity || 0),
        ISSUED_Amount: Number(item.ISSUED_Amount || 0),
        BALANCE_Quantity: Number(item.BALANCE_Quantity || 0),
        BALANCE_Amount: Number(item.BALANCE_Amount || 0)
      }));
      
      if (formattedData.length > 0) {
        toast.success("Data processed successfully");
      }
      
      setUploadSuccess(true);
      toast.success("Files successfully uploaded and analyzed");
      
      navigate('/spreadsheet-view', { 
        state: { 
          fileName: fileToProcess.name
        } 
      });
      
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to upload files");
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
                Upload Files
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
                  multiple
                />
                <div className="flex flex-col items-center justify-center text-center">
                  {files.length === 0 ? (
                    <>
                      <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                      <h3 className="mb-1 text-lg font-semibold">Drag & drop or click to upload</h3>
                      <p className="text-sm text-muted-foreground">
                        Support images, PDF files, and CSV spreadsheets
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mb-1 text-lg font-semibold">Selected Files: {files.length}</h3>
                      <p className="text-sm text-muted-foreground">
                        Click to add more files or drag & drop them here
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {hasCameraSupport && (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    {isMobile ? "Take Photo" : "Use Camera"}
                  </Button>
                )}
                
                {files.some(file => file.type.startsWith('image/')) && (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreatePdf();
                    }}
                  >
                    <FilePlus className="h-4 w-4" />
                    Create PDF
                  </Button>
                )}
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">Selected Files</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-destructive"
                      onClick={handleClearAllFiles}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-md border">
                    {files.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between border-b p-2 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith('image/') && (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedFilesForPdf[index]}
                                onChange={() => toggleFileSelection(index)}
                                onClick={(e) => e.stopPropagation()}
                                className="mr-2 h-4 w-4 rounded border-gray-300"
                              />
                              {previewUrls[index] && (
                                <img 
                                  src={previewUrls[index]}
                                  alt="Preview" 
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                            </div>
                          )}
                          {!file.type.startsWith('image/') && (
                            <FileIcon type={file.type} size={24} />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
                    <AlertDescription>Files uploaded and analyzed successfully</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    className="w-full"
                    disabled={files.length === 0 || isUploading || isLoading}
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
                <h3 className="mb-2 text-lg font-medium">Mobile Features</h3>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-1">
                    <Camera className="h-4 w-4 inline" />
                    Take photos with your device camera
                  </li>
                  <li className="flex items-center gap-1">
                    <FilePlus className="h-4 w-4 inline" />
                    Create PDF from multiple images
                  </li>
                  <li className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4 inline" />
                    Mobile-optimized interface
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="mb-2 text-lg font-medium">Process</h3>
                <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
                  <li>Upload your files securely to our storage</li>
                  <li>Gemini AI analyzes the content</li>
                  <li>Results are displayed as spreadsheet data</li>
                  <li>Data is synced with Google Sheets</li>
                  <li>Edit and save changes back to database</li>
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
      
      <CameraCapture 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </Layout>
  );
};

const FileIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  if (type.startsWith('image/')) {
    return <FileImage style={{ width: size, height: size }} className="text-blue-500" />;
  } else if (type === 'application/pdf') {
    return <FileX style={{ width: size, height: size }} className="text-red-500" />;
  } else {
    return <FileX style={{ width: size, height: size }} className="text-gray-500" />;
  }
};

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
