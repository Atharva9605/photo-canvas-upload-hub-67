
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { geminiApi } from "@/services/geminiService";
import GeminiAnalysisResults from "@/components/GeminiAnalysisResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

const AnalysisResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
                  Download Results
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => toast.info("Sharing functionality not implemented yet")}
                >
                  <Share2 className="h-4 w-4" />
                  Share Results
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalysisResults;
