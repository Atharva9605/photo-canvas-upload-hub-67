
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
    CSV_DATA: "/csv-data",
    UPDATE_CSV_DATA: "/update-csv-data",
    GOOGLE_SHEETS: "/google-sheets",
    SYNC_SHEETS: "/sync-sheets",
    GET_SHEET_DATA: "/get-sheet-data"
  },
  
  // Google Sheets API config
  GOOGLE_SHEETS: {
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || "", // Would be provided through environment variables
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    REDIRECT_URI: window.location.origin + "/auth/google/callback",
    SPREADSHEET_ID: import.meta.env.VITE_SPREADSHEET_ID || ""
  }
};

export default config;
