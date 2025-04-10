
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

// Add request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if required
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  
  // Create database if not exists
  createDatabase: (dbConfig?: any) =>
    postData<any>(config.ENDPOINTS.CREATE_DATABASE, dbConfig || {
      host: config.PG_HOST,
      port: config.PG_PORT,
      database: config.PG_DATABASE,
      user: config.PG_USER,
    }),
    
  // Insert data into postgres
  insertDataIntoPostgres: (data: any, tableName?: string) =>
    postData<any>(config.ENDPOINTS.INSERT_DATA, {
      data,
      tableName: tableName || 'StockBook',
      dbConfig: {
        host: config.PG_HOST,
        port: config.PG_PORT,
        database: config.PG_DATABASE,
        user: config.PG_USER,
      }
    }),
  
  // Add more endpoint methods as needed based on the Gemini API
};
