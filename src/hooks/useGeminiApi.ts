
import { useState } from "react";
import { geminiApi } from "../services/geminiService";
import { toast } from "sonner";

export function useGeminiApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to process files using your API
  const processFiles = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      toast.info("Processing with Gemini AI, this may take up to 2 minutes for large files...");
      const result = await geminiApi.processFiles(files);
      setIsLoading(false);
      return result;
    } catch (err) {
      let errorMessage = "Unknown error occurred";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Provide more friendly message for timeout errors
        if (errorMessage.includes('timeout')) {
          errorMessage = "The request took too long to process. Please try with a smaller file or try again later.";
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to process a single file
  const processSingleFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      toast.info("Processing with Gemini AI, this may take up to 2 minutes for large files...");
      const result = await geminiApi.processSingleFile(file);
      setIsLoading(false);
      return result;
    } catch (err) {
      let errorMessage = "Unknown error occurred";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes('timeout')) {
          errorMessage = "The request took too long to process. Please try with a smaller file or try again later.";
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      throw err;
    }
  };

  // Compatibility methods for existing pages
  const getAnalysisResults = async (id: string) => {
    return await geminiApi.getAnalysisResults(id);
  };

  const getAllCsvData = async () => {
    return await geminiApi.getAllCsvData();
  };

  const createDatabase = async () => {
    return await geminiApi.createDatabase();
  };

  const insertDataIntoPostgres = async (data: any, tableName: string) => {
    return await geminiApi.insertDataIntoPostgres(data, tableName);
  };

  return {
    isLoading,
    error,
    processFiles,
    processSingleFile,
    getAnalysisResults,
    getAllCsvData,
    createDatabase,
    insertDataIntoPostgres
  };
}
