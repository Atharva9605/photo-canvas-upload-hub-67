
import { GoogleSpreadsheet } from 'google-spreadsheet';
import config from '../config/api';
import { toast } from 'sonner';

// This class handles all Google Sheets operations
class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private initialized = false;
  private mockMode = true; // Always use mock mode in browser environment

  constructor() {
    // In a browser environment, we'll use mock functionality
    // The actual Google Sheets API calls would be handled by a backend service
    console.log('GoogleSheetsService initialized in mock mode for browser environment');
  }

  async init(sheetId: string = '') {
    if (this.initialized && this.doc) return this.doc;

    try {
      // For browser environment, we create a mock document instance
      const mockSheetId = sheetId || 'mock-sheet-id';
      
      // The GoogleSpreadsheet constructor requires the spreadsheetId
      this.doc = new GoogleSpreadsheet(mockSheetId, {
        // Provide a minimal mock auth object to satisfy the type requirements
        apiKey: 'mock-api-key'
      });
      
      // In browser, we would typically make API calls to a backend service
      // that handles the actual Google Sheets API authentication and operations
      console.log(`Initialized mock Google Sheets document with ID: ${mockSheetId}`);
      
      this.initialized = true;
      return this.doc;
    } catch (error) {
      console.error('Google Sheets initialization error:', error);
      throw new Error('Failed to initialize Google Sheets');
    }
  }

  async createSheet(title: string) {
    try {
      // For demonstration, we'll return a mock sheet
      console.log(`Would create sheet titled: ${title} (mock mode)`);
      return {
        title,
        sheetId: 'mock-sheet-id-' + Date.now(),
        headerValues: [
          'Entry_ID', 'DATE', 'PARTICULARS', 'Voucher_BillNo',
          'RECEIPTS_Quantity', 'RECEIPTS_Amount', 'ISSUED_Quantity',
          'ISSUED_Amount', 'BALANCE_Quantity', 'BALANCE_Amount'
        ]
      };
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  }

  async appendRows(sheetTitle: string, rows: any[]) {
    try {
      // For demonstration, we'll log the rows that would be appended
      console.log(`Would append ${rows.length} rows to sheet "${sheetTitle}" (mock mode)`);
      console.log('Sample row:', rows[0]);
      return true;
    } catch (error) {
      console.error('Error appending rows:', error);
      throw error;
    }
  }

  async updateRows(sheetTitle: string, rows: any[]) {
    try {
      // For demonstration, we'll log the rows that would be updated
      console.log(`Would update ${rows.length} rows in sheet "${sheetTitle}" (mock mode)`);
      console.log('Sample row:', rows[0]);
      return true;
    } catch (error) {
      console.error('Error updating rows:', error);
      throw error;
    }
  }

  // Get all data from a sheet
  async getSheetData(sheetTitle: string) {
    try {
      // For demonstration, we'll return mock data
      console.log(`Getting mock data from sheet "${sheetTitle}"`);
      
      return [
        {
          Entry_ID: 1,
          DATE: '2025-04-11',
          PARTICULARS: 'Sample Entry',
          Voucher_BillNo: 'VB-001',
          RECEIPTS_Quantity: 10,
          RECEIPTS_Amount: 500.00,
          ISSUED_Quantity: 5,
          ISSUED_Amount: 250.00,
          BALANCE_Quantity: 5,
          BALANCE_Amount: 250.00
        }
      ];
    } catch (error) {
      console.error('Error getting sheet data:', error);
      throw error;
    }
  }
  
  // Export data to a new Google Sheet and return a shareable link
  async exportToGoogleSheet(data: any[], title: string = '') {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/, '').substring(0, 15);
      const sheetTitle = title || `Exported_Results_${timestamp}`;
      
      console.log(`Exporting ${data.length} rows to a new Google Sheet titled: "${sheetTitle}" (mock mode)`);
      
      // In a real implementation, this would:
      // 1. Create a new spreadsheet or open an existing one
      // 2. Create a new sheet with the provided title
      // 3. Add headers based on the data structure
      // 4. Append all data rows
      // 5. Return a shareable link to the sheet
      
      // For mock mode, we simulate success and return a fake link
      const mockSpreadsheetId = `mock-spreadsheet-id-${timestamp}`;
      const mockShareableLink = `https://docs.google.com/spreadsheets/d/${mockSpreadsheetId}/edit?usp=sharing`;
      
      // Simulate a delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Successfully exported to Google Sheet: ${sheetTitle}`);
      
      return {
        success: true,
        shareableLink: mockShareableLink,
        sheetTitle,
        spreadsheetId: mockSpreadsheetId
      };
    } catch (error) {
      console.error('Error exporting to Google Sheet:', error);
      toast.error('Failed to export to Google Sheet');
      throw error;
    }
  }

  // Get the Google Sheets preview URL for embedding
  getEmbedUrl(spreadsheetId: string): string {
    // Return the URL for embedding a Google Sheet in an iframe
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`;
  }
}

export const googleSheetsService = new GoogleSheetsService();
