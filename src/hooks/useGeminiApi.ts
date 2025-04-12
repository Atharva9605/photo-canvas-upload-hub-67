
import { useState } from "react";
import { geminiApi } from "../services/geminiService";
import { toast } from "sonner";
import { googleSheetsService } from "../services/googleSheetsService";

export function useGeminiApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  // Function to analyze an image using Gemini API
  const analyzeImage = async (file: File, options?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      toast.info("Processing with Gemini AI, this may take up to 2 minutes for large files...");
      
      // For API integration with the Flask backend
      if (options?.useFlaskApi) {
        const formData = new FormData();
        formData.append('files', file);
        
        // Use the Flask API endpoint
        const response = await fetch('https://govigyan-gemini.onrender.com/upload-flash', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const data = await response.json();
        
        // Store the sheet URL from the response
        if (data.sheet_url) {
          setSheetUrl(data.sheet_url);
          localStorage.setItem('lastSheetUrl', data.sheet_url);
        }
        
        toast.success(data.message || "Files processed successfully");
        setIsLoading(false);
        return data;
      }
      
      // Default Gemini API
      const result = await geminiApi.analyzeImage(file, options);
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
      toast.error(`Failed to process: ${errorMessage}`);
      throw err;
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
      // For Flask API integration
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        // Use the Flask API endpoint
        const response = await fetch('https://govigyan-gemini.onrender.com/upload-flash', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const data = await response.json();
        
        // Store the sheet URL from the response
        if (data.sheet_url) {
          setSheetUrl(data.sheet_url);
          localStorage.setItem('lastSheetUrl', data.sheet_url);
        }
        
        toast.success(data.message || "Files processed successfully");
        setIsLoading(false);
        return data;
      }
      
      // Default processing
      const result = await geminiApi.processFiles(files);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      toast.error(`Failed to process files: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      // For Flask API integration
      const response = await fetch('https://govigyan-gemini.onrender.com/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update data');
      }
      
      toast.success("Changes saved successfully");
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error updating data:', err);
      toast.error(`Failed to save changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      // Use Flask API endpoint to fetch results
      const response = await fetch('https://govigyan-gemini.onrender.com/results');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      toast.error(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  // Function to sync data with Google Sheets
  const syncWithGoogleSheets = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Flask API endpoint to export to sheet
      const response = await fetch('https://govigyan-gemini.onrender.com/export-to-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export to Google Sheets');
      }
      
      const result = await response.json();
      
      if (result.link) {
        setSheetUrl(result.link);
        localStorage.setItem('lastSheetUrl', result.link);
        toast.success(`Data exported to Google Sheets: ${result.link}`);
      } else {
        toast.success("Data exported to Google Sheets");
      }
      
      setIsLoading(false);
      return { success: true, sheetUrl: result.link };
    } catch (err) {
      console.error("Error syncing with Google Sheets:", err);
      toast.error("Failed to sync with Google Sheets");
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to get the current sheet URL
  const getSheetUrl = () => {
    // First check state, then localStorage as fallback
    return sheetUrl || localStorage.getItem('lastSheetUrl');
  };

  return {
    isLoading,
    error,
    sheetUrl,
    getSheetUrl,
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
