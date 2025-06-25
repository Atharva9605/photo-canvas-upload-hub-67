
import axios, { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import config from "../config/api";

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.GEMINI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: config.API_TIMEOUT,
});

// Add response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred";
    toast.error(`API Error: ${message}`);
    return Promise.reject(error);
  }
);

// Process multiple files with your API
export const processFiles = async (files: File[]) => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    
    const response = await apiClient.post<any>(config.ENDPOINTS.PROCESS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error processing multiple files:`, error);
    throw error;
  }
};

// Process single file
export const processSingleFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<any>(config.ENDPOINTS.PROCESS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error processing single file:`, error);
    throw error;
  }
};

// Simplified API object for your backend
export const geminiApi = {
  // Process files using your API
  processFiles: (files: File[]) => processFiles(files),
  
  // Process single file
  processSingleFile: (file: File) => processSingleFile(file),
  
  // Mock methods for compatibility - since your API handles everything in /process
  getAnalysisResults: async (id: string) => {
    // Since your API processes everything in one go, we'll return a mock structure
    // In a real scenario, you might want to store results and retrieve them
    console.warn("getAnalysisResults called but new API doesn't support this. Returning mock data.");
    return { extractedData: [], message: "Analysis results not available with current API" };
  },
  
  getAllCsvData: async () => {
    // Your API doesn't have this endpoint, so we return empty array
    console.warn("getAllCsvData called but new API doesn't support this. Returning empty array.");
    return [];
  },
  
  createDatabase: async () => {
    // Your API handles database creation internally
    console.log("Database creation handled by API internally");
    return { success: true };
  },
  
  insertDataIntoPostgres: async (data: any, tableName: string) => {
    // Your API handles database insertion internally during /process
    console.log("Database insertion handled by API internally during processing");
    return { success: true, id: Date.now().toString() };
  }
};
