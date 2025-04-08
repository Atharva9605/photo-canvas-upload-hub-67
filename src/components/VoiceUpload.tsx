
import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface VoiceUploadProps {
  onCommand: (command: string) => void;
}

const VoiceUpload = ({ onCommand }: VoiceUploadProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Commands that the voice control can recognize
  const commands = {
    "upload": () => onCommand("upload"),
    "select file": () => onCommand("select"),
    "upload file": () => onCommand("upload"),
    "clear": () => onCommand("clear"),
    "analyze": () => onCommand("analyze"),
    "cancel": () => onCommand("cancel"),
  };
  
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        variant: "destructive",
        title: "Voice commands not supported",
        description: "Your browser doesn't support voice commands. Try using Chrome or Edge.",
      });
      return;
    }
    
    // Clean up function
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, []);
  
  const startListening = () => {
    // This is a mock implementation since actual SpeechRecognition requires browser support
    // In a real app, you would use the Web Speech API
    setIsListening(true);
    toast({
      title: "Listening...",
      description: "Try saying: 'upload', 'select file', 'analyze', 'clear'",
    });
    
    // Simulate speech recognition (in a real app, this would use the Web Speech API)
    const mockRecognitionTimeout = setTimeout(() => {
      const mockCommands = ["upload", "select file", "analyze", "clear"];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setTranscript(randomCommand);
      setIsProcessing(true);
      
      // Process the command
      setTimeout(() => {
        if (commands[randomCommand as keyof typeof commands]) {
          commands[randomCommand as keyof typeof commands]();
          toast({
            title: "Command recognized",
            description: `Executing: "${randomCommand}"`,
          });
        }
        setIsProcessing(false);
        setIsListening(false);
      }, 1000);
    }, 2000);
    
    return mockRecognitionTimeout;
  };
  
  const stopListening = () => {
    setIsListening(false);
    setTranscript("");
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`relative h-10 w-10 rounded-full ${isListening ? 'bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40' : ''}`}
        onClick={() => isListening ? stopListening() : startListening()}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        {isListening && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3 animate-pulse">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        )}
      </Button>
      
      {transcript && (
        <div className="rounded-md bg-muted px-3 py-1 text-sm">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceUpload;
