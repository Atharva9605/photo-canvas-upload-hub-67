
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase, UserUpload } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  FileIcon, 
  Trash2, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  File, 
  FileSpreadsheet, 
  FilePlus,
  FileCode
} from "lucide-react";
import { format } from "date-fns";

type FileCategory = 'image' | 'document' | 'spreadsheet' | 'other';

const AllFiles = () => {
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<UserUpload | null>(null);
  const [activeTab, setActiveTab] = useState<FileCategory>('image');
  const { toast } = useToast();

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const uploadsWithUrls = await Promise.all((data || []).map(async (upload) => {
        try {
          // Try getting a public URL first
          const publicUrlData = supabase.storage
            .from('user_files')
            .getPublicUrl(upload.storage_path);
            
          // Fallback to signed URL if public URL is not available
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('user_files')
            .createSignedUrl(upload.storage_path, 60 * 60);
            
          if (signedUrlError) {
            console.error(`Error getting signed URL for ${upload.file_name}:`, signedUrlError);
          }
          
          const url = publicUrlData?.data?.publicUrl || signedUrlData?.signedUrl;
          
          return {
            ...upload,
            url: url || null,
          };
        } catch (err) {
          console.error(`Error processing URL for ${upload.file_name}:`, err);
          return {
            ...upload,
            url: null,
          };
        }
      }));
      
      setUploads(uploadsWithUrls as UserUpload[]);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your uploads.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUpload = async (id: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_uploads')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setUploads(uploads.filter(upload => upload.id !== id));
      
      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the file.',
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html')) {
      return <FileCode className="h-5 w-5 text-purple-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const previewFile = (file: UserUpload) => {
    setSelectedFile(file);
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download the file.',
      });
    }
  };

  const getFileCategory = (fileType: string): FileCategory => {
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf' || fileType.includes('document')) {
      return 'document';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return 'spreadsheet';
    } else {
      return 'other';
    }
  };

  const filteredUploads = uploads.filter(upload => 
    getFileCategory(upload.file_type) === activeTab
  );

  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.file_type.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center">
          <img 
            src={selectedFile.url || ''} 
            alt={selectedFile.file_name} 
            className="max-h-[500px] max-w-full object-contain rounded-md"
            onError={(e) => {
              console.error('Image failed to load:', selectedFile.url);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    } else if (selectedFile.file_type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center w-full">
          <iframe 
            src={selectedFile.url || ''} 
            className="w-full h-[70vh] border rounded-md"
            title={selectedFile.file_name}
          ></iframe>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center gap-4 text-center p-8">
          {getFileIcon(selectedFile.file_type)}
          <p className="text-lg font-medium">{selectedFile.file_name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedFile.file_type} • {(selectedFile.file_size / 1024).toFixed(1)} KB
          </p>
          <Button 
            onClick={() => selectedFile.url && downloadFile(selectedFile.url, selectedFile.file_name)}
            className="mt-2"
            disabled={!selectedFile.url}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">All Files</h1>
          <Button asChild>
            <Link to="/upload">
              <FilePlus className="mr-2 h-4 w-4" />
              Upload New
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="image" value={activeTab} onValueChange={(value) => setActiveTab(value as FileCategory)}>
          <TabsList className="mb-6">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Spreadsheets
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              Other Files
            </TabsTrigger>
          </TabsList>

          {['image', 'document', 'spreadsheet', 'other'].map((category) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {category === 'image' && 'Images'}
                    {category === 'document' && 'Documents'}
                    {category === 'spreadsheet' && 'Spreadsheets'}
                    {category === 'other' && 'Other Files'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-2 items-center animate-pulse">
                          <div className="h-10 w-10 rounded bg-muted"></div>
                          <div className="h-4 w-48 bg-muted rounded"></div>
                          <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredUploads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUploads.map((file) => (
                        <Card key={file.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {getFileIcon(file.file_type)}
                              <h3 className="font-medium truncate">{file.file_name}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground mb-3">
                              <p>{(file.file_size / 1024).toFixed(1)} KB</p>
                              <p>{format(new Date(file.created_at), 'MMM d, yyyy')}</p>
                            </div>
                            <div className="flex space-x-2 justify-end">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => previewFile(file)}
                                  >
                                    Preview
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="sm:max-w-lg">
                                  <SheetHeader>
                                    <SheetTitle>{selectedFile?.file_name}</SheetTitle>
                                    <SheetDescription>
                                      Uploaded on {selectedFile?.created_at ? format(new Date(selectedFile.created_at), 'PPP') : ''}
                                    </SheetDescription>
                                  </SheetHeader>
                                  <div className="mt-6">
                                    {renderFilePreview()}
                                  </div>
                                </SheetContent>
                              </Sheet>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => file.url && downloadFile(file.url, file.file_name)}
                                disabled={!file.url}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteUpload(file.id, file.storage_path)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No {category} files</h3>
                      <p className="text-muted-foreground mb-4">
                        Upload some {category} files to see them here
                      </p>
                      <Button asChild>
                        <Link to="/upload">Upload Files</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default AllFiles;
