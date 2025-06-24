
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
    const message = error.response?.data?.error || error.response?.data?.message || "An error occurred";
    toast.error(`API Error: ${message}`);
    return Promise.reject(error);
  }
);

// General GET method for fetching data
export const fetchData = async <T>(endpoint: string, params?: any): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {};
    if (params) {
      config.params = params;
    }
    
    const response = await apiClient.get<T>(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

// General POST method for sending data
export const postData = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await apiClient.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    throw error;
  }
};

// File upload method specifically for handling file uploads
export const uploadFile = async <T>(endpoint: string, file: File, additionalData?: any): Promise<T> => {
  try {
    const formData = new FormData();
    formData.append("files", file); // Changed from "file" to "files" to match Flask API
    
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

// Process multiple files method
export const uploadMultipleFiles = async <T>(endpoint: string, files: File[]): Promise<T> => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // Match Flask API expectation
    
    const response = await apiClient.post<T>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading multiple files to ${endpoint}:`, error);
    throw error;
  }
};

// Specific API endpoints for Gemini functionality
export const geminiApi = {
  // Analyze image using regular upload endpoint
  analyzeImage: (file: File, options?: any) => 
    uploadFile<any>(config.ENDPOINTS.UPLOAD, file, options),
  
  // Analyze image using Gemini 2.0 Flash
  analyzeImageFlash: (file: File, options?: any) => 
    uploadFile<any>(config.ENDPOINTS.UPLOAD_FLASH, file, options),
  
  // Get analysis results
  getAnalysisResults: (analysisId?: string) => 
    fetchData<any>(config.ENDPOINTS.RESULTS),
  
  // Extract data from an image (use regular upload)
  extractDataFromImage: (file: File) => 
    uploadFile<any>(config.ENDPOINTS.UPLOAD, file),
  
  // Process multiple files
  processFiles: async (files: File[]) => {
    return uploadMultipleFiles<any>(config.ENDPOINTS.UPLOAD, files);
  },

  // Process multiple files with Flash
  processFilesFlash: async (files: File[]) => {
    return uploadMultipleFiles<any>(config.ENDPOINTS.UPLOAD_FLASH, files);
  },

  // Update data
  updateData: async (updates: any[]) => {
    return postData<any>(config.ENDPOINTS.UPDATE, updates);
  },

  // Export to Google Sheet
  exportToSheet: async (data: any[]) => {
    return postData<any>(config.ENDPOINTS.EXPORT_TO_SHEET, data);
  },

  // Legacy endpoints for backward compatibility
  createDatabase: async () => {
    try {
      const response = await apiClient.post<any>('/create-database', {});
      return response.data;
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    }
  },

  insertDataIntoPostgres: async (data: any, tableName: string) => {
    try {
      const response = await apiClient.post<any>('/insert-data', {
        data,
        tableName
      });
      return response.data;
    } catch (error) {
      console.error('Error inserting data into PostgreSQL:', error);
      throw error;
    }
  },
  
  getCsvData: async (id: string) => {
    try {
      const response = await apiClient.get<any>(`${config.ENDPOINTS.CSV_DATA}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      throw error;
    }
  },
  
  updateCsvData: async (id: string, data: any) => {
    try {
      const response = await apiClient.post<any>(`${config.ENDPOINTS.UPDATE_CSV_DATA}/${id}`, { data });
      return response.data;
    } catch (error) {
      console.error('Error updating CSV data:', error);
      throw error;
    }
  },
  
  getAllCsvData: async () => {
    try {
      const response = await apiClient.get<any>(config.ENDPOINTS.CSV_DATA);
      return response.data;
    } catch (error) {
      console.error('Error fetching all CSV data:', error);
      throw error;
    }
  }
};
