
import { useState } from "react";
import { Copy, Twitter, Mail, Link as LinkIcon, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ShareDialogProps {
  title: string;
  description?: string;
  imageUrl?: string;
  trigger: React.ReactNode;
}

export function ShareDialog({ title, description, imageUrl, trigger }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = window.location.href;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share it with anyone",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTwitterShare = () => {
    const text = `Check out: ${title}${description ? ` - ${description}` : ""}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };
  
  const handleEmailShare = () => {
    const subject = `Check out: ${title}`;
    const body = `${description || ""}\n\nView it here: ${shareUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        
        {imageUrl && (
          <div className="flex justify-center py-4">
            <img 
              src={imageUrl} 
              alt={title} 
              className="max-h-40 rounded-md object-cover" 
            />
          </div>
        )}
        
        <div className="flex flex-col space-y-3 px-1 py-2">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="flex rounded-md border">
            <span className="flex w-full items-center truncate rounded-l-md border-r bg-muted px-3 py-2 text-sm">
              {shareUrl}
            </span>
            <Button 
              variant="ghost" 
              className="rounded-l-none px-3" 
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleCopyLink}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={handleTwitterShare}>
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" onClick={handleEmailShare}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
