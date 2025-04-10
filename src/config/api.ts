
// API configuration values
const config = {
  // Base API URL from environment variable
  GEMINI_API_URL: import.meta.env.VITE_API_BASE_URL || "https://gemini-govigyan.onrender.com",
  
  // Increased timeout for API requests in milliseconds (2 minutes)
  API_TIMEOUT: 120000, // Increased from 30000 to 120000
  
  // Maximum file size for uploads in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Endpoints
  ENDPOINTS: {
    ANALYZE_IMAGE: "/process",
    GET_ANALYSIS: "/get-analysis",
    EXTRACT_DATA: "/process",
    CREATE_DATABASE: "/create-database",
    INSERT_DATA: "/insert-data",
    CSV_DATA: "/csv-data"
    // Add other endpoints as needed
  }
};

export default config;
