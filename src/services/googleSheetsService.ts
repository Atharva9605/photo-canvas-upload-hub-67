
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

  async init(sheetId?: string) {
    if (this.initialized && this.doc) return this.doc;

    try {
      // Create a new sheet if sheetId is not provided
      if (!sheetId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const title = `Upload_Results_${timestamp}`;
        this.doc = new GoogleSpreadsheet();
        await this.doc.createNewSpreadsheetDocument({ title });
      } else {
        this.doc = new GoogleSpreadsheet(sheetId);
      }

      // Authenticate with the Google Sheets API
      await this.doc.useServiceAccountAuth({
        client_email: this.serviceAccountEmail,
        private_key: this.privateKey,
      });

      // Load document properties and sheets
      await this.doc.loadInfo();
      this.initialized = true;
      return this.doc;
    } catch (error) {
      console.error('Google Sheets initialization error:', error);
      throw new Error('Failed to initialize Google Sheets');
    }
  }

  async createSheet(title: string) {
    try {
      const doc = await this.init();
      return await doc.addSheet({ title, headerValues: [
        'Entry_ID', 'DATE', 'PARTICULARS', 'Voucher_BillNo',
        'RECEIPTS_Quantity', 'RECEIPTS_Amount', 'ISSUED_Quantity',
        'ISSUED_Amount', 'BALANCE_Quantity', 'BALANCE_Amount'
      ]});
    } catch (error) {
      console.error('Error creating sheet:', error);
      throw error;
    }
  }

  async appendRows(sheetTitle: string, rows: any[]) {
    try {
      const doc = await this.init();
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
      const doc = await this.init();
      let sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        throw new Error(`Sheet "${sheetTitle}" not found`);
      }

      // Load all rows
      await sheet.loadCells();
      const existingRows = await sheet.getRows();
      
      // Update each row by Entry_ID
      for (const newRow of rows) {
        const existingRow = existingRows.find(row => 
          parseInt(row.get('Entry_ID')) === newRow.Entry_ID
        );
        
        if (existingRow) {
          // Update all fields
          existingRow.set('DATE', newRow.DATE);
          existingRow.set('PARTICULARS', newRow.PARTICULARS);
          existingRow.set('Voucher_BillNo', newRow.Voucher_BillNo);
          existingRow.set('RECEIPTS_Quantity', newRow.RECEIPTS_Quantity);
          existingRow.set('RECEIPTS_Amount', newRow.RECEIPTS_Amount);
          existingRow.set('ISSUED_Quantity', newRow.ISSUED_Quantity);
          existingRow.set('ISSUED_Amount', newRow.ISSUED_Amount);
          existingRow.set('BALANCE_Quantity', newRow.BALANCE_Quantity);
          existingRow.set('BALANCE_Amount', newRow.BALANCE_Amount);
          
          await existingRow.save();
        } else {
          // If row doesn't exist, add it
          await sheet.addRow({
            'Entry_ID': newRow.Entry_ID,
            'DATE': newRow.DATE,
            'PARTICULARS': newRow.PARTICULARS,
            'Voucher_BillNo': newRow.Voucher_BillNo,
            'RECEIPTS_Quantity': newRow.RECEIPTS_Quantity,
            'RECEIPTS_Amount': newRow.RECEIPTS_Amount,
            'ISSUED_Quantity': newRow.ISSUED_Quantity,
            'ISSUED_Amount': newRow.ISSUED_Amount,
            'BALANCE_Quantity': newRow.BALANCE_Quantity,
            'BALANCE_Amount': newRow.BALANCE_Amount
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating rows:', error);
      throw error;
    }
  }

  // Get all data from a sheet
  async getSheetData(sheetTitle: string) {
    try {
      const doc = await this.init();
      const sheet = doc.sheetsByTitle[sheetTitle];
      
      if (!sheet) {
        throw new Error(`Sheet "${sheetTitle}" not found`);
      }
      
      const rows = await sheet.getRows();
      return rows.map(row => ({
        Entry_ID: parseInt(row.get('Entry_ID')),
        DATE: row.get('DATE'),
        PARTICULARS: row.get('PARTICULARS'),
        Voucher_BillNo: row.get('Voucher_BillNo'),
        RECEIPTS_Quantity: parseInt(row.get('RECEIPTS_Quantity')),
        RECEIPTS_Amount: parseFloat(row.get('RECEIPTS_Amount')),
        ISSUED_Quantity: parseInt(row.get('ISSUED_Quantity')),
        ISSUED_Amount: parseFloat(row.get('ISSUED_Amount')),
        BALANCE_Quantity: parseInt(row.get('BALANCE_Quantity')),
        BALANCE_Amount: parseFloat(row.get('BALANCE_Amount'))
      }));
    } catch (error) {
      console.error('Error getting sheet data:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
