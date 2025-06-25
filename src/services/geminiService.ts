
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

// File upload method for processing files with your API
export const uploadFile = async <T>(endpoint: string, file: File, additionalData?: any): Promise<T> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    // Add any additional data if provided
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    const response = await apiClient.post<T>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading file to ${endpoint}:`, error);
    throw error;
  }
};

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

// Simplified API object for your backend
export const geminiApi = {
  // Process files using your API
  processFiles: (files: File[]) => processFiles(files),
  
  // Process single file
  processSingleFile: (file: File) => 
    uploadFile<any>(config.ENDPOINTS.PROCESS, file)
};
