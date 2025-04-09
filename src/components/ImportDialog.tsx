
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Table } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string[][]) => void;
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [csvData, setCsvData] = useState('');
  const [importMethod, setImportMethod] = useState<'paste' | 'upload'>('paste');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCsvImport = () => {
    try {
      setIsProcessing(true);
      
      // Process CSV data
      const rows = csvData
        .split('\n')
        .map(row => {
          // Handle CSV with quoted fields that might contain commas
          const result = [];
          let inQuote = false;
          let currentField = '';
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
              // Handle quoted field
              if (inQuote && i + 1 < row.length && row[i + 1] === '"') {
                // Double quote inside quoted field
                currentField += '"';
                i++; // Skip the next quote
              } else {
                // Toggle quote state
                inQuote = !inQuote;
              }
            } else if (char === ',' && !inQuote) {
              // End of field
              result.push(currentField);
              currentField = '';
            } else {
              // Regular character
              currentField += char;
            }
          }
          
          // Add the last field
          result.push(currentField);
          return result;
        });
      
      // Make sure all rows have the same number of columns
      const maxCols = Math.max(...rows.map(row => row.length));
      const normalizedData = rows.map(row => {
        if (row.length < maxCols) {
          return [...row, ...Array(maxCols - row.length).fill('')];
        }
        return row;
      });
      
      onImport(normalizedData);
      setCsvData('');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing CSV data:', error);
      toast({
        variant: 'destructive',
        title: 'Import Error',
        description: 'Could not process the CSV data. Please check the format and try again.',
      });
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setCsvData(content);
        setImportMethod('paste');
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast({
          title: 'File loaded',
          description: 'CSV file has been loaded and is ready to import.',
        });
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not read the file. Please try again.',
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to read the file.',
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Spreadsheet Data
          </DialogTitle>
          <DialogDescription>
            Import data from a CSV file or paste CSV data directly.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="paste" onValueChange={(value) => setImportMethod(value as 'paste' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Paste CSV
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="mt-4">
            <Textarea
              placeholder="Paste your CSV data here (comma-separated values)"
              className="h-[200px] font-mono"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
              <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Upload CSV File</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Drag and drop or click to select a CSV file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Select File
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCsvImport} 
            disabled={!csvData.trim() || isProcessing}
            className="gap-2"
          >
            <Table className="h-4 w-4" />
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
