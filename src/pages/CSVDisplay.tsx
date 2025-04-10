
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Table, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { jsonToCSV, csvToJSON } from "@/utils/csvUtils";

const CSVDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<string>('');
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState<string>("upload-results.csv");

  useEffect(() => {
    // Process data from location state
    if (location.state?.data) {
      try {
        const jsonData = location.state.data;
        
        // Set filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        setFileName(`upload-results-${timestamp}.csv`);
        
        // Convert JSON to CSV
        const csv = jsonToCSV(jsonData);
        setCsvData(csv);
        
        // Convert CSV back to JSON for table display
        const parsedData = csvToJSON(csv);
        setTableData(parsedData);
        
        // Extract headers
        if (parsedData.length > 0) {
          setHeaders(Object.keys(parsedData[0]));
        }
      } catch (error) {
        console.error("Error processing data:", error);
        toast.error("Failed to process the data");
      }
    } else {
      toast.error("No data available to display");
      navigate('/upload');
    }
    
    setIsLoading(false);
  }, [location.state, navigate]);

  const handleDownloadCSV = () => {
    if (!csvData) {
      toast.error("No data available to download");
      return;
    }
    
    try {
      // Create blob and trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download the CSV file");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button 
            variant="default" 
            className="flex items-center gap-1"
            onClick={handleDownloadCSV}
            disabled={!csvData}
          >
            <Download className="h-4 w-4 mr-1" />
            Download CSV
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              CSV Data Preview
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleDownloadCSV}
              disabled={!csvData}
            >
              <FileText className="h-4 w-4 mr-1" />
              {fileName}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : tableData.length > 0 ? (
              <div className="overflow-x-auto">
                <UITable>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableHead key={index} className="font-medium">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map((header, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </UITable>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CSVDisplay;
