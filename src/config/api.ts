
// API configuration values
const config = {
  // Base API URL - Updated to match your new API
  GEMINI_API_URL: "https://govigyan-api.onrender.com",
  
  // Increased timeout for API requests in milliseconds (2 minutes)
  API_TIMEOUT: 120000,
  
  // Maximum file size for uploads in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Google Spreadsheet URL
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/11363SNwRWpG67fu53VAWIJPY9iPCDhYqqiAu8pHFuGo/edit?gid=1632396235",
  
  // Endpoints - Only the process endpoint is needed
  ENDPOINTS: {
    PROCESS: "/process"
  }
};

export default config;
