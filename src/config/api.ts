
// API configuration values
const config = {
  // Base API URL - This should be set based on environment
  GEMINI_API_URL: import.meta.env.VITE_GEMINI_API_URL || "https://gemini-govigyan-api.onrender.com",
  
  // Default timeout for API requests in milliseconds (30 seconds)
  API_TIMEOUT: 30000,
  
  // Maximum file size for uploads in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Endpoints
  ENDPOINTS: {
    ANALYZE_IMAGE: "/analyze-image",
    GET_ANALYSIS: "/get-analysis",
    CREATE_DATABASE: "/create-database",
    INSERT_DATA: "/insert-data",
    EXTRACT_DATA: "/extract-data",
    // Add other endpoints as needed
  }
};

export default config;
