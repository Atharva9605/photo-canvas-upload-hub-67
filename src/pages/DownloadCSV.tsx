
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { geminiApi } from "@/services/geminiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Table, FileSpreadsheet } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

const DownloadCSV = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("data-export.csv");

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await geminiApi.getAnalysisResults(id);
        setResults(data);
        
        // Generate CSV data from the extracted data
        if (data && data.extractedData) {
          const csvString = convertToCSV(data.extractedData);
          setCsvData(csvString);
          
          // Set a more descriptive filename
          setFileName(`data-export-${id}-${new Date().toISOString().split('T')[0]}.csv`);
          
          // Add to upload history
          await addToUploadHistory(id, data);
        }
      } catch (err) {
        console.error("Error fetching analysis results:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch analysis results"));
        toast.error("Could not load analysis results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  // Function to convert the JSON data to CSV
  const convertToCSV = (data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return "No data available";
    }
    
    // Handle both array and object data structures
    const jsonData = Array.isArray(data) ? data : [data];
    
    // Get all possible headers from all objects
    const headers = new Set<string>();
    jsonData.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key));
    });
    
    const headerRow = Array.from(headers).join(',');
    
    // Create rows for each data item
    const rows = jsonData.map(item => {
      return Array.from(headers)
        .map(header => {
          let cell = item[header] === undefined ? '' : item[header];
          
          // Handle nested objects and arrays
          if (typeof cell === 'object' && cell !== null) {
            cell = JSON.stringify(cell).replace(/"/g, '""');
          }
          
          // Escape quotes and wrap in quotes if the cell contains commas, quotes, or newlines
          cell = String(cell).replace(/"/g, '""');
          if (/[",\n\r]/.test(cell)) {
            cell = `"${cell}"`;
          }
          
          return cell;
        })
        .join(',');
    });
    
    return [headerRow, ...rows].join('\n');
  };

  // Function to add the download to upload history
  const addToUploadHistory = async (analysisId: string, data: any) => {
    try {
      // If using Supabase, add an entry to user_uploads table
      const { data: uploadData, error: uploadError } = await supabase
        .from('user_uploads')
        .insert({
          file_name: fileName,
          file_type: 'text/csv',
          file_size: csvData ? csvData.length : 0,
          analysis_id: analysisId,
          storage_path: `csv-exports/${fileName}`,
          metadata: { source: 'analysis-export', original_analysis_id: analysisId }
        });
      
      if (uploadError) {
        console.error("Error adding to upload history:", uploadError);
      }
      
      // Optionally store the CSV in Supabase storage
      if (csvData) {
        const { error: storageError } = await supabase.storage
          .from('user_files')
          .upload(`csv-exports/${fileName}`, new Blob([csvData], { type: 'text/csv' }));
          
        if (storageError) {
          console.error("Error storing CSV file:", storageError);
        }
      }
    } catch (err) {
      console.error("Error adding to history:", err);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvData) {
      toast.error("No data available to download");
      return;
    }
    
    // Create a blob and download link
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV file downloaded successfully");
  };

  // Function to preview CSV data in a table
  const renderCsvPreview = () => {
    if (!csvData) return null;
    
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    const dataRows = rows.slice(1, Math.min(rows.length, 11)); // Show max 10 data rows in preview
    
    return (
      <div className="overflow-x-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header.replace(/"/g, '')}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataRows.map((row, rowIndex) => {
              const cells = row.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1'));
              return (
                <TableRow key={rowIndex}>
                  {cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </UITable>
        
        {rows.length > 11 && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Showing {Math.min(rows.length - 1, 10)} of {rows.length - 1} rows
          </p>
        )}
      </div>
    );
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
          
          <div className="flex items-center gap-2">
            {!isLoading && csvData && (
              <Button 
                variant="default" 
                className="flex items-center gap-1"
                onClick={handleDownloadCSV}
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            )}
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Download CSV Data</h1>
        
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error.message}</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => navigate('/upload')}
              >
                Return to Upload
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  CSV Export Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {csvData ? renderCsvPreview() : (
                  <p className="text-center text-muted-foreground py-4">
                    No data available to export
                  </p>
                )}
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleDownloadCSV} 
                    disabled={!csvData}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download {fileName}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {results && results.extractedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Source Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-[300px] border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                    <pre className="text-xs">
                      {JSON.stringify(results.extractedData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DownloadCSV;
