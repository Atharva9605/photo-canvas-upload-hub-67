
import { useState } from "react";
import { geminiApi } from "../services/geminiService";

export function useGeminiApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to analyze an image using Gemini API
  const analyzeImage = async (file: File, options?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.analyzeImage(file, options);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
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

  // Function to create database if not exists
  const createDatabase = async (dbConfig?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await geminiApi.createDatabase(dbConfig);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      setIsLoading(false);
      throw err;
    }
  };

  // Function to insert data into PostgreSQL
  const insertDataIntoPostgres = async (data: any, tableName?: string) => {
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

  return {
    isLoading,
    error,
    analyzeImage,
    extractDataFromImage,
    getAnalysisResults,
    createDatabase,
    insertDataIntoPostgres,
  };
}
