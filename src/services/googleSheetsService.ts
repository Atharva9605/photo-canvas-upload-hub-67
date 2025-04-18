
import axios from 'axios';
import { config } from '@/config/api';

class GoogleSheetsService {
  private spreadsheetId: string | null = null;
  private serviceAccountEmail: string = 'service-account@example.com';
  private privateKey: string = 'private-key';
  
  /**
   * Set the spreadsheet ID
   */
  setSpreadsheetId(id: string) {
    this.spreadsheetId = id;
  }
  
  /**
   * Get the spreadsheet ID
   */
  getSpreadsheetId(): string | null {
    return this.spreadsheetId;
  }
  
  /**
   * Get data from a specific sheet
   */
  async getSheetData(sheetName: string): Promise<any[]> {
    try {
      if (!this.spreadsheetId) {
        throw new Error('Spreadsheet ID not set');
      }
      
      // Instead of using the Google Sheets API directly, we'll use a proxy endpoint
      const response = await axios.get(`${config.API_URL}/get-sheet-data`, {
        params: {
          spreadsheet_id: this.spreadsheetId,
          range: sheetName
        }
      });
      
      return response.data.values || [];
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
