
// API configuration values
const config = {
  // Base API URL hardcoded as per user request
  GEMINI_API_URL: "https://govigyan-gemini.onrender.com",
  
  // Increased timeout for API requests in milliseconds (2 minutes)
  API_TIMEOUT: 120000,
  
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
    SYNC_SHEETS: "/sync-sheets"
  },
  
  // Google Sheets API config with hardcoded values as per user request
  GOOGLE_SHEETS: {
    API_KEY: "AIzaSyAUWoitjt-MMI2HOYyq3gVj3J6juWrbQds",
    CLIENT_ID: "113898419795211486802",
    REDIRECT_URI: window.location.origin + "/auth/google/callback"
  },
  
  // Database config with hardcoded values as per user request
  DATABASE: {
    DB_NAME: "govigyan",
    DB_USER: "govigyan_user",
    DB_PASSWORD: "1yOT2yAAQ0FO7bL7iKo7C7W26dLFOm2j",
    DB_HOST: "dpg-cvrp2fili9vc739krvd0-a.oregon-postgres.render.com",
    DB_PORT: 5432
  },
  
  // Gemini API key
  GEMINI_API_KEY: "AIzaSyAUWoitjt-MMI2HOYyq3gVj3J6juWrbQds"
};

export default config;
