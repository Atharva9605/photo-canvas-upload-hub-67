
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  FileIcon, 
  Trash2, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  File, 
  SortAscending, 
  SortDescending, 
  Clock, 
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type SortField = 'file_name' | 'created_at' | 'file_type';
type SortOrder = 'asc' | 'desc';

export function FileUploadList() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { toast } = useToast();

  // Fetch all uploads
  const fetchUploads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      
      // Get signed URLs for each file
      const uploadsWithUrls = await Promise.all((data || []).map(async (upload) => {
        const { data: urlData } = await supabase.storage
          .from('user_files')
          .createSignedUrl(upload.storage_path, 60 * 60); // 1 hour expiry
          
        return {
          ...upload,
          url: urlData?.signedUrl || null,
        };
      }));
      
      setUploads(uploadsWithUrls);
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

  // Delete an upload
  const deleteUpload = async (id: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_uploads')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update the list
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

  // Handle sort change
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Preview file
  const previewFile = (file: any) => {
    setSelectedFile(file);
  };

  // Download file
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

  // Load uploads when component mounts or sort params change
  useEffect(() => {
    fetchUploads();
  }, [sortField, sortOrder]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="h-6 w-40 bg-muted rounded animate-pulse"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-2 items-center animate-pulse">
                <div className="h-10 w-10 rounded bg-muted"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
                <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Files</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              {sortField === 'file_name' && (
                <>
                  <SortAscending className="h-4 w-4" />
                  Sort by Name
                </>
              )}
              {sortField === 'created_at' && (
                <>
                  <Clock className="h-4 w-4" />
                  Sort by Date
                </>
              )}
              {sortField === 'file_type' && (
                <>
                  <FileIcon className="h-4 w-4" />
                  Sort by Type
                </>
              )}
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4 ml-1" />
              ) : (
                <ArrowDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange('file_name', 'asc')}>
              <SortAscending className="h-4 w-4 mr-2" />
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('file_name', 'desc')}>
              <SortDescending className="h-4 w-4 mr-2" />
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('created_at', 'desc')}>
              <ArrowDown className="h-4 w-4 mr-2" />
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('created_at', 'asc')}>
              <ArrowUp className="h-4 w-4 mr-2" />
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('file_type', 'asc')}>
              <FileIcon className="h-4 w-4 mr-2" />
              File Type
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {uploads.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload files in the upload section to see them here.
          </p>
          <Button asChild>
            <a href="/upload">Upload Files</a>
          </Button>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {getFileIcon(upload.file_type)}
                      <span className="truncate max-w-[200px]">{upload.file_name}</span>
                    </TableCell>
                    <TableCell>{upload.file_type.split('/')[1]?.toUpperCase() || 'UNKNOWN'}</TableCell>
                    <TableCell>{(upload.file_size / 1024).toFixed(1)} KB</TableCell>
                    <TableCell>{format(new Date(upload.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => previewFile(upload)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="sm:max-w-lg">
                          <SheetHeader>
                            <SheetTitle>{selectedFile?.file_name}</SheetTitle>
                            <SheetDescription>
                              Uploaded on {selectedFile?.created_at ? format(new Date(selectedFile.created_at), 'PPP') : ''}
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 flex justify-center">
                            {selectedFile?.file_type.startsWith('image/') ? (
                              <img 
                                src={selectedFile?.url} 
                                alt={selectedFile?.file_name} 
                                className="max-h-[500px] max-w-full object-contain rounded-md"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-4 text-center p-8">
                                {getFileIcon(selectedFile?.file_type || '')}
                                <p className="text-lg font-medium">{selectedFile?.file_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedFile?.file_type} • {(selectedFile?.file_size / 1024).toFixed(1)} KB
                                </p>
                                <Button 
                                  onClick={() => selectedFile?.url && downloadFile(selectedFile.url, selectedFile.file_name)}
                                  className="mt-2"
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => upload.url && downloadFile(upload.url, upload.file_name)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteUpload(upload.id, upload.storage_path)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
