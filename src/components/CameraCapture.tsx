
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check if camera is available
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      })
      .catch(err => {
        console.error('Error checking camera:', err);
        setHasCamera(false);
      });

    // Clean up function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && hasCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, hasCamera]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCaptured(false);
    setCapturedImage(null);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL and then to a blob
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setIsCaptured(true);
      
      // Stop the camera after capturing
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    
    // Convert data URL to Blob
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        // Create a File object from the Blob
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      })
      .catch(err => {
        console.error('Error creating file from captured image:', err);
      });
  };

  const handleRetry = () => {
    setIsCaptured(false);
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Photo</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {!hasCamera && (
            <div className="text-center p-4">
              <p className="text-red-500">No camera detected or camera access denied.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check your camera permissions and try again.
              </p>
            </div>
          )}
          
          {hasCamera && !isCaptured && (
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {hasCamera && isCaptured && capturedImage && (
            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Captured photo" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          {!isCaptured ? (
            <Button onClick={handleCapture} disabled={!hasCamera || !stream}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry}>
                Retake
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Use Photo
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;
