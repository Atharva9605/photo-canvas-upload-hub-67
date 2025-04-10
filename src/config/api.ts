
// API configuration values
const config = {
  // Base API URL - This should be set based on environment
  GEMINI_API_URL: import.meta.env.VITE_GEMINI_API_URL || "https://gemini-govigyan-api.example.com",
  
  // Default timeout for API requests in milliseconds (30 seconds)
  API_TIMEOUT: 30000,
  
  // Maximum file size for uploads in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // PostgreSQL connection details - these should be set based on environment variables
  PG_HOST: import.meta.env.VITE_PG_HOST || "db.supabase.co",
  PG_PORT: import.meta.env.VITE_PG_PORT || "5432",
  PG_DATABASE: import.meta.env.VITE_PG_DATABASE || "postgres",
  PG_USER: import.meta.env.VITE_PG_USER || "postgres",
  
  // Endpoints
  ENDPOINTS: {
    ANALYZE_IMAGE: "/analyze",
    GET_ANALYSIS: "/results",
    CREATE_DATABASE: "/create-database",
    INSERT_DATA: "/insert-data",
    // Add other endpoints as needed
  }
};

export default config;
