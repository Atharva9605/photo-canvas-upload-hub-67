
/**
 * Extracts the spreadsheet ID from a Google Sheets URL
 * @param url Google Sheets URL
 * @returns The spreadsheet ID or null if invalid URL
 */
export function getSheetIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Match Google Sheets URL formats
  // Format 1: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
  // Format 2: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
  const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/|$|\?|#)/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Generates a Google Sheets embed URL from a spreadsheet ID
 * @param spreadsheetId The Google Sheets spreadsheet ID
 * @returns The embed URL for the spreadsheet
 */
export function getSheetEmbedUrl(spreadsheetId: string): string {
  if (!spreadsheetId) return '';
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`;
}

/**
 * Generates a Google Sheets edit URL from a spreadsheet ID
 * @param spreadsheetId The Google Sheets spreadsheet ID
 * @returns The edit URL for the spreadsheet
 */
export function getSheetEditUrl(spreadsheetId: string): string {
  if (!spreadsheetId) return '';
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
