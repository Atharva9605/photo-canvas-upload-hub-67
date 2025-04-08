
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Image as ImageIcon, FileCheck } from "lucide-react";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, or WebP image.",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
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
  };

  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload with progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Simulate server processing
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            
            toast({
              title: "Upload successful",
              description: `${file.name} has been uploaded successfully.`,
            });
            
            // Navigate to gallery in a real app
            setTimeout(() => {
              window.location.href = "/gallery";
            }, 1500);
          }, 500);
        }
        return newProgress;
      });
    }, 300);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Upload Photo</h1>
        
        <div className="mx-auto max-w-2xl">
          <div 
            className={`relative mb-6 flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100 ${
              isDragging ? "dropzone-active" : ""
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
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
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
                {!isUploading && (
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
                    {isUploading ? (
                      <div className="text-right text-sm font-medium text-brand-600">
                        {uploadProgress}%
                      </div>
                    ) : (
                      <FileCheck className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full bg-brand-500 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="min-w-[200px]"
            >
              {isUploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
