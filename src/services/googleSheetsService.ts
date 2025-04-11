
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { jwtDecode } from 'jwt-decode';
import config from '../config/api';

// This class handles all Google Sheets operations
class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private initialized = false;
  private serviceAccountEmail = '';
  private privateKey = '';

  constructor() {
    // These would ideally come from environment variables
    // For demonstration, we'll use placeholder values
    this.serviceAccountEmail = 'service-account@project-id.iam.gserviceaccount.com';
    this.privateKey = '-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----';
  }

  async init(sheetId: string = '') {
    if (this.initialized && this.doc) return this.doc;

    try {
      // Create a new sheet if sheetId is not provided
      if (!sheetId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const title = `Upload_Results_${timestamp}`;
        
        // Create a new document with a title
        this.doc = new GoogleSpreadsheet(sheetId || 'dummy-id');
        
        // In a real implementation, you'd use the Google Drive API to create the document
        console.log(`In a real implementation, we would create a new spreadsheet titled: ${title}`);
      } else {
        this.doc = new GoogleSpreadsheet(sheetId);
      }

      // Authenticate with the Google Sheets API
      // In version 4 of google-spreadsheet, we need to use this method differently
      if (this.doc) {
        await this.doc.useServiceAccountAuth({
          client_email: this.serviceAccountEmail,
          private_key: this.privateKey
        });

        // Load document properties and sheets
        await this.doc.loadInfo();
      }
      
      this.initialized = true;
      return this.doc;
    } catch (error) {
      console.error('Google Sheets initialization error:', error);
      throw new Error('Failed to initialize Google Sheets');
    }
  }

  async createSheet(title: string) {
    try {
      const doc = await this.init('mock-sheet-id');
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
      throw error;
    }
  }

  async appendRows(sheetTitle: string, rows: any[]) {
    try {
      const doc = await this.init('mock-sheet-id');
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
      return true;
    } catch (error) {
      console.error('Error appending rows:', error);
      throw error;
    }
  }

  async updateRows(sheetTitle: string, rows: any[]) {
    try {
      // Use a mock sheet ID for demo purposes
      const mockSheetId = '1Abc123XyZ_exampleSheetId';
      const doc = await this.init(mockSheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        // For demo purposes, we'll create a sheet with this title
        console.log(`Sheet "${sheetTitle}" would be created in a real implementation`);
        sheet = await this.createSheet(sheetTitle);
      }

      console.log(`Updating ${rows.length} rows in sheet "${sheetTitle}"`);
      
      // In a real implementation, we would update the sheet rows here
      // For demo purposes, we'll just simulate success
      
      return true;
    } catch (error) {
      console.error('Error updating rows:', error);
      throw error;
    }
  }

  // Get all data from a sheet
  async getSheetData(sheetTitle: string) {
    try {
      // Use a mock sheet ID for demo purposes
      const mockSheetId = '1Abc123XyZ_exampleSheetId';
      const doc = await this.init(mockSheetId);
      if (!doc) throw new Error('Failed to initialize document');
      
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        throw new Error(`Sheet "${sheetTitle}" not found`);
      }
      
      // For demo purposes, we'll return mock data
      console.log(`Getting data from sheet "${sheetTitle}"`);
      
      return [
        {
          Entry_ID: 1,
          DATE: '2025-04-10',
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
}

export const googleSheetsService = new GoogleSheetsService();
