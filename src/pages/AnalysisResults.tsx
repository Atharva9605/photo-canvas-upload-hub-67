
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { geminiApi } from "@/services/geminiService";
import GeminiAnalysisResults from "@/components/GeminiAnalysisResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Database, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

// Define the expected data schema
interface StockEntrySchema {
  Entry_ID?: number;
  DATE: string;
  PARTICULARS: string;
  Voucher_BillNo: string;
  RECEIPTS_Quantity: number;
  RECEIPTS_Amount: number;
  ISSUED_Quantity: number;
  ISSUED_Amount: number;
  BALANCE_Quantity: number;
  BALANCE_Amount: number;
}

const AnalysisResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSavingToDatabase, setSavingToDatabase] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await geminiApi.getAnalysisResults(id);
        setResults(data);
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

  const mapDataToSchema = (data: any): StockEntrySchema[] => {
    // If data is already in the expected format, return it
    if (Array.isArray(data) && data.length > 0 && 'DATE' in data[0]) {
      return data as StockEntrySchema[];
    }
    
    // If data is in the extracted format from Gemini
    if (data && data.extractedData) {
      // Try to map the extracted data to our schema
      if (Array.isArray(data.extractedData)) {
        return data.extractedData.map((item: any, index: number) => {
          // Try to intelligently map fields or use defaults
          return {
            Entry_ID: index + 1,
            DATE: item.date || new Date().toISOString().split('T')[0],
            PARTICULARS: item.description || item.particulars || "Unknown",
            Voucher_BillNo: item.voucher || item.bill_no || "",
            RECEIPTS_Quantity: Number(item.receipts_quantity || 0),
            RECEIPTS_Amount: Number(item.receipts_amount || 0),
            ISSUED_Quantity: Number(item.issued_quantity || 0),
            ISSUED_Amount: Number(item.issued_amount || 0),
            BALANCE_Quantity: Number(item.balance_quantity || 0),
            BALANCE_Amount: Number(item.balance_amount || 0)
          };
        });
      } else if (typeof data.extractedData === 'object') {
        // Single item
        return [{
          Entry_ID: 1,
          DATE: data.extractedData.date || new Date().toISOString().split('T')[0],
          PARTICULARS: data.extractedData.description || data.extractedData.particulars || "Unknown",
          Voucher_BillNo: data.extractedData.voucher || data.extractedData.bill_no || "",
          RECEIPTS_Quantity: Number(data.extractedData.receipts_quantity || 0),
          RECEIPTS_Amount: Number(data.extractedData.receipts_amount || 0),
          ISSUED_Quantity: Number(data.extractedData.issued_quantity || 0),
          ISSUED_Amount: Number(data.extractedData.issued_amount || 0),
          BALANCE_Quantity: Number(data.extractedData.balance_quantity || 0),
          BALANCE_Amount: Number(data.extractedData.balance_amount || 0)
        }];
      }
    }
    
    // Fallback - create empty schema object
    return [{
      Entry_ID: 1,
      DATE: new Date().toISOString().split('T')[0],
      PARTICULARS: "Data from analysis",
      Voucher_BillNo: "",
      RECEIPTS_Quantity: 0,
      RECEIPTS_Amount: 0,
      ISSUED_Quantity: 0,
      ISSUED_Amount: 0,
      BALANCE_Quantity: 0,
      BALANCE_Amount: 0
    }];
  };

  const handleDownloadResults = () => {
    if (!results) return;
    
    try {
      const jsonString = JSON.stringify(results, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `gemini-analysis-${id}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading results:", err);
      toast.error("Could not download results");
    }
  };

  const handleSaveToDatabase = async () => {
    if (!results) {
      toast.error("No data available to save to database");
      return;
    }

    try {
      setSavingToDatabase(true);
      
      // Map data to the expected schema before saving
      const formattedData = mapDataToSchema(results);
      
      // First, ensure database exists
      await geminiApi.createDatabase();
      
      // Then insert the data
      const insertResponse = await geminiApi.insertDataIntoPostgres(
        formattedData, 
        "StockBook"
      );
      
      toast.success("Data successfully saved to database");
      console.log("Insert response:", insertResponse);
      
      // Navigate to CSV editor with the ID from the response
      if (insertResponse && insertResponse.id) {
        navigate(`/csv-editor/${insertResponse.id}`);
      }
    } catch (err) {
      console.error("Error saving to database:", err);
      toast.error("Failed to save data to database");
    } finally {
      setSavingToDatabase(false);
    }
  };

  const handleViewAsSpreadsheet = () => {
    if (!results) {
      toast.error("No data available to view");
      return;
    }
    
    // Format the data according to our schema
    const formattedData = mapDataToSchema(results);
    
    // Navigate to the CSV display page with the formatted data
    navigate('/csv-display', { 
      state: { 
        data: formattedData,
        fileName: `analysis-${id}.xlsx`,
        fromAnalysis: true
      } 
    });
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
            {results && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleDownloadResults}
                >
                  <Download className="h-4 w-4" />
                  Download JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleViewAsSpreadsheet}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  View as Spreadsheet
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleSaveToDatabase}
                  disabled={isSavingToDatabase || !results}
                >
                  <Database className="h-4 w-4" />
                  {isSavingToDatabase ? "Saving..." : "Save to Database"}
                </Button>
              </>
            )}
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Analysis Results</h1>
        
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">Loading analysis results...</span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <GeminiAnalysisResults 
              results={results} 
              error={error} 
            />
            
            {results && results.imageUrl && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Analyzed Image</h3>
                  <div className="rounded-md overflow-hidden border">
                    <img 
                      src={results.imageUrl} 
                      alt="Analyzed image" 
                      className="mx-auto max-h-[400px] object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {results && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Structured Data Preview</h3>
                  <div className="overflow-auto max-h-[300px] border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                    <pre className="text-xs">
                      {JSON.stringify(mapDataToSchema(results), null, 2)}
                    </pre>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={handleViewAsSpreadsheet}
                      className="flex items-center gap-1"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Open in Spreadsheet Editor
                    </Button>
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

export default AnalysisResults;
