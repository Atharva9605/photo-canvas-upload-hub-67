
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, AlertCircle } from "lucide-react";

interface GeminiAnalysisResultsProps {
  results: any; // This should be typed according to the actual API response
  isLoading?: boolean;
  error?: Error | null;
}

const GeminiAnalysisResults = ({ 
  results, 
  isLoading = false, 
  error = null 
}: GeminiAnalysisResultsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>Gemini Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Analyzing with Gemini AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Analysis Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  // This component should be adapted based on the actual structure of your Gemini API response
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>Gemini Analysis Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* This is a placeholder implementation - modify according to actual API response structure */}
        {results.predictions && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Predictions</h3>
              <div className="flex flex-wrap gap-2">
                {results.predictions.map((prediction: any, index: number) => (
                  <Badge key={index} variant="outline">
                    {prediction.class} {prediction.confidence && `(${Math.round(prediction.confidence * 100)}%)`}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {results.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{results.description}</p>
              </div>
            )}
            
            {results.recommendations && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {results.recommendations.map((recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* If the structure is unknown, just display as JSON */}
        {!results.predictions && (
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiAnalysisResults;
