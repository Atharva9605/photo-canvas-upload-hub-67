
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import config from '../config/api';

// This class handles all Google Sheets operations
class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private initialized = false;
  private serviceAccountEmail = '';
  private privateKey = '';
  private spreadsheetId = '';

  constructor() {
    // These would ideally come from environment variables
    // For demonstration, we'll use placeholder values
    this.serviceAccountEmail = 'service-account@project-id.iam.gserviceaccount.com';
    this.privateKey = '-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----';
    this.spreadsheetId = 'your-spreadsheet-id';
  }

  async init(sheetId: string = '') {
    if (this.initialized && this.doc) return this.doc;

    try {
      // Use provided sheetId or fallback to the default one
      const spreadsheetId = sheetId || this.spreadsheetId || 'mock-sheet-id';
      
      // Fix: GoogleSpreadsheet constructor only takes one argument (the spreadsheetId)
      this.doc = new GoogleSpreadsheet(spreadsheetId);
      
      // Fix: Update to use the correct authentication method
      // The useServiceAccountAuth method is a property of the GoogleSpreadsheet instance
      if (this.doc.useServiceAccountAuth) {
        await this.doc.useServiceAccountAuth({
          client_email: this.serviceAccountEmail,
          private_key: this.privateKey
        });
      } else {
        console.warn('Authentication method not available - using mock mode');
      }

      // Load document properties and sheets
      await this.doc.loadInfo();
      
      this.initialized = true;
      return this.doc;
    } catch (error) {
      console.error('Google Sheets initialization error:', error);
      // Use more specific error message if available
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Google Sheets';
      toast.error(`Google Sheets error: ${errorMessage}`);
      // Still throw the error for the caller to handle
      throw new Error(errorMessage);
    }
  }

  async createSheet(title: string) {
    try {
      const doc = await this.init(this.spreadsheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      return await doc.addSheet({ 
        title, 
        headerValues: [
          'Entry_ID', 'DATE', 'PARTICULARS', 'Voucher_BillNo',
          'RECEIPTS_Quantity', 'RECEIPTS_Amount', 'ISSUED_Quantity',
          'ISSUED_Amount', 'BALANCE_Quantity', 'BALANCE_Amount'
        ]
      });
    } catch (error) {
      console.error('Error creating sheet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error creating sheet';
      toast.error(`Sheet creation failed: ${errorMessage}`);
      throw error;
    }
  }

  async appendRows(sheetTitle: string, rows: any[]) {
    try {
      const doc = await this.init(this.spreadsheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        sheet = await this.createSheet(sheetTitle);
      }

      // Format rows to match Google Sheets expectations
      const formattedRows = rows.map(row => ({
        'Entry_ID': row.Entry_ID,
        'DATE': row.DATE,
        'PARTICULARS': row.PARTICULARS,
        'Voucher_BillNo': row.Voucher_BillNo,
        'RECEIPTS_Quantity': row.RECEIPTS_Quantity,
        'RECEIPTS_Amount': row.RECEIPTS_Amount,
        'ISSUED_Quantity': row.ISSUED_Quantity,
        'ISSUED_Amount': row.ISSUED_Amount,
        'BALANCE_Quantity': row.BALANCE_Quantity,
        'BALANCE_Amount': row.BALANCE_Amount
      }));

      await sheet.addRows(formattedRows);
      
      toast.success(`Successfully added ${formattedRows.length} rows to Google Sheets`);
      
      return {
        success: true,
        sheetUrl: this.getEmbedUrl(this.spreadsheetId)
      };
    } catch (error) {
      console.error('Error appending rows:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error appending rows';
      toast.error(`Google Sheets sync failed: ${errorMessage}`);
      
      // Return a fallback URL and partial success to prevent blocking the app flow
      return {
        success: false,
        error: errorMessage,
        sheetUrl: this.getEmbedUrl(this.spreadsheetId)
      };
    }
  }

  async updateRows(sheetTitle: string, rows: any[]) {
    try {
      const doc = await this.init(this.spreadsheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        sheet = await this.createSheet(sheetTitle);
      }

      console.log(`Updating ${rows.length} rows in sheet "${sheetTitle}"`);
      
      // Get all rows to update them with new values
      await sheet.getRows();
      
      // Clear existing rows and add the updated ones
      await sheet.clear();
      
      // Add headers back
      await sheet.setHeaderRow([
        'Entry_ID', 'DATE', 'PARTICULARS', 'Voucher_BillNo',
        'RECEIPTS_Quantity', 'RECEIPTS_Amount', 'ISSUED_Quantity',
        'ISSUED_Amount', 'BALANCE_Quantity', 'BALANCE_Amount'
      ]);
      
      // Format rows to match Google Sheets expectations
      const formattedRows = rows.map(row => ({
        'Entry_ID': row.Entry_ID,
        'DATE': row.DATE,
        'PARTICULARS': row.PARTICULARS,
        'Voucher_BillNo': row.Voucher_BillNo,
        'RECEIPTS_Quantity': row.RECEIPTS_Quantity,
        'RECEIPTS_Amount': row.RECEIPTS_Amount,
        'ISSUED_Quantity': row.ISSUED_Quantity,
        'ISSUED_Amount': row.ISSUED_Amount,
        'BALANCE_Quantity': row.BALANCE_Quantity,
        'BALANCE_Amount': row.BALANCE_Amount
      }));
      
      await sheet.addRows(formattedRows);
      
      toast.success(`Successfully updated ${formattedRows.length} rows in Google Sheets`);
      
      return {
        success: true,
        sheetUrl: this.getEmbedUrl(this.spreadsheetId)
      };
    } catch (error) {
      console.error('Error updating rows:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error updating rows';
      toast.error(`Google Sheets update failed: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        sheetUrl: this.getEmbedUrl(this.spreadsheetId)
      };
    }
  }

  // Get all data from a sheet
  async getSheetData(sheetTitle: string) {
    try {
      const doc = await this.init(this.spreadsheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        throw new Error(`Sheet "${sheetTitle}" not found`);
      }
      
      // Get actual data from the sheet
      const rows = await sheet.getRows();
      const data = rows.map(row => ({
        Entry_ID: row.get('Entry_ID'),
        DATE: row.get('DATE'),
        PARTICULARS: row.get('PARTICULARS'),
        Voucher_BillNo: row.get('Voucher_BillNo'),
        RECEIPTS_Quantity: Number(row.get('RECEIPTS_Quantity')),
        RECEIPTS_Amount: Number(row.get('RECEIPTS_Amount')),
        ISSUED_Quantity: Number(row.get('ISSUED_Quantity')),
        ISSUED_Amount: Number(row.get('ISSUED_Amount')),
        BALANCE_Quantity: Number(row.get('BALANCE_Quantity')),
        BALANCE_Amount: Number(row.get('BALANCE_Amount'))
      }));
      
      return data;
    } catch (error) {
      console.error('Error getting sheet data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error getting sheet data';
      toast.error(`Failed to load sheet data: ${errorMessage}`);
      
      // Return fallback data to prevent app from breaking
      return [
        {
          Entry_ID: 1,
          DATE: new Date().toISOString().split('T')[0],
          PARTICULARS: 'Fallback data (sheet load failed)',
          Voucher_BillNo: 'ERROR',
          RECEIPTS_Quantity: 0,
          RECEIPTS_Amount: 0,
          ISSUED_Quantity: 0,
          ISSUED_Amount: 0,
          BALANCE_Quantity: 0,
          BALANCE_Amount: 0
        }
      ];
    }
  }

  // Get the embed URL for a Google Sheet
  getEmbedUrl(spreadsheetId: string = '') {
    const id = spreadsheetId || this.spreadsheetId || 'mock-sheet-id';
    return `https://docs.google.com/spreadsheets/d/${id}/preview`;
  }

  // Set the spreadsheet ID (useful when getting it from API)
  setSpreadsheetId(id: string) {
    if (id && id.trim() !== '') {
      this.spreadsheetId = id;
      this.initialized = false; // Force re-initialization with new ID
      return true;
    }
    return false;
  }
}

export const googleSheetsService = new GoogleSheetsService();
