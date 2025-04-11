import { useState } from "react";
import { geminiApi } from "../services/geminiService";
import { toast } from "sonner";
import { googleSheetsService } from "../services/googleSheetsService";

export function useGeminiApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to analyze an image using Gemini API
  const analyzeImage = async (file: File, options?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      toast.info("Processing with Gemini AI, this may take up to 2 minutes for large files...");
      
      // Set a reasonable timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000); // 30-second timeout
      });
      
      // Create the API call promise
      const apiCallPromise = geminiApi.analyzeImage(file, options);
      
      // Race the timeout against the actual API call
      const result = await Promise.race([apiCallPromise, timeoutPromise]) as any;
      setIsLoading(false);
      return result;
    } catch (err) {
      let errorMessage = "Unknown error occurred";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide more friendly message for network errors
        if (err.message.includes('Network Error') || err.message.includes('network') || err.message.includes('timeout')) {
          errorMessage = "Network connection issue detected. Please check your internet connection and try again, or continue with offline mode.";
        }
        // Provide more friendly message for timeout errors
        else if (errorMessage.includes('timeout')) {
          errorMessage = "The request took too long to process. Please try with a smaller file or try again later.";
        }
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      
      // Return a structured error object that can be handled by the caller
      throw new Error(errorMessage);
    }
  };

  // Function to extract data from an image
  const extractDataFromImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.extractDataFromImage(file);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to fetch analysis results
  const getAnalysisResults = async (analysisId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.getAnalysisResults(analysisId);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to process multiple files
  const processFiles = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.processFiles(files);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to create database
  const createDatabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.createDatabase();
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to insert data into PostgreSQL
  const insertDataIntoPostgres = async (data: any, tableName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.insertDataIntoPostgres(data, tableName);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };
  
  // Function to get CSV data by ID
  const getCsvData = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.getCsvData(id);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };
  
  // Function to update CSV data
  const updateCsvData = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.updateCsvData(id, data);
      
      // Sync with Google Sheets
      try {
        const sheetTitle = `Data_Sheet_${id}`;
        await googleSheetsService.updateRows(sheetTitle, data);
        toast.success("Data synced with Google Sheets");
      } catch (sheetErr) {
        console.error("Error syncing with Google Sheets:", sheetErr);
        toast.error("Failed to sync with Google Sheets");
      }
      
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };
  
  // Function to get all CSV data
  const getAllCsvData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.getAllCsvData();
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to sync data with Google Sheets
  const syncWithGoogleSheets = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set a timeout promise for the operation
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Google Sheets sync timed out')), 15000); // 15-second timeout
      });
      
      // Create the actual operation promise
      const operationPromise = async () => {
        const sheetTitle = `Data_Sheet_${id}`;
        await googleSheetsService.appendRows(sheetTitle, data);
        return true;
      };
      
      // Race the two promises
      const result = await Promise.race([operationPromise(), timeoutPromise]);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unknown error occurred during Google Sheets sync";
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      
      // Rethrow for the caller to handle
      throw new Error(errorMessage);
    }
  };

  return {
    isLoading,
    error,
    analyzeImage,
    extractDataFromImage,
    getAnalysisResults,
    processFiles,
    createDatabase,
    insertDataIntoPostgres,
    getCsvData,
    updateCsvData,
    getAllCsvData,
    syncWithGoogleSheets
  };
}
