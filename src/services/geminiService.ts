
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

// Specific API endpoints for Gemini functionality
export const geminiApi = {
  // Analyze image using Gemini API
  analyzeImage: (file: File, options?: any) => 
    uploadFile<any>(config.ENDPOINTS.ANALYZE_IMAGE, file, options),
  
  // Get analysis results by ID
  getAnalysisResults: (analysisId: string) => 
    fetchData<any>(`${config.ENDPOINTS.GET_ANALYSIS}/${analysisId}`),
  
  // Extract data from an image
  extractDataFromImage: (file: File) => 
    uploadFile<any>(config.ENDPOINTS.EXTRACT_DATA, file),
  
  // Process multiple files
  processFiles: async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      
      const response = await apiClient.post<any>(config.ENDPOINTS.EXTRACT_DATA, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error processing multiple files:`, error);
      throw error;
    }
  },

  // Create database for PostgreSQL
  createDatabase: async () => {
    try {
      const response = await apiClient.post<any>('/create-database', {});
      return response.data;
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    }
  },

  // Insert data into PostgreSQL
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
  
  // Get CSV data by ID
  getCsvData: async (id: string) => {
    try {
      const response = await apiClient.get<any>(`${config.ENDPOINTS.CSV_DATA}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      throw error;
    }
  },
  
  // Update CSV data
  updateCsvData: async (id: string, data: any) => {
    try {
      const response = await apiClient.post<any>(`${config.ENDPOINTS.UPDATE_CSV_DATA}/${id}`, { data });
      return response.data;
    } catch (error) {
      console.error('Error updating CSV data:', error);
      throw error;
    }
  },
  
  // Get all CSV data
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
