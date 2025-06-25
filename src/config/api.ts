

// API configuration values
const config = {
  // Base API URL - Updated to correct API
  GEMINI_API_URL: "https://gemini-govigyan.onrender.com",
  
  // No timeout for API requests (unlimited)
  API_TIMEOUT: 0,
  
  // No file size limit (unlimited)
  MAX_FILE_SIZE: Infinity,
  
  // Google Spreadsheet URL
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/11363SNwRWpG67fu53VAWIJPY9iPCDhYqqiAu8pHFuGo/edit?gid=1632396235",
  
  // Endpoints - Only the process endpoint is needed
  ENDPOINTS: {
    PROCESS: "/process"
  }
};

export default config;

