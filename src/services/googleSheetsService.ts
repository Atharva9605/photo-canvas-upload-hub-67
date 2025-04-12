
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import config from '../config/api';

// This class handles all Google Sheets operations
class GoogleSheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private initialized = false;
  private serviceAccountEmail = 'govigyancloubase@gen-lang-client-0281985807.iam.gserviceaccount.com';
  private privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCOH0F6YB1v4Ba6\nBgtsNnXemliwDWIDEFSwe902Vpnu1qO7dETLz5lV7T+bwwqqJgHlgz5i6Iq+a2WM\nLHc2UPxKx2gcIqWtnTWtc0jvpz/YfE8Qg0opmdbwqi7/L17aKQpHgfPdwlO+Evya\n12PMxRtG5Lxm2zBc88w7IV8AVcR/bX3Q0zhpiumCFSz7beYgRJlPZ0yLr8RkR3Es\nD6dWl4ArI4+iPwDMRgVH5NaQtOyNSa4fl8qVvrFpNSHxVjL/BX5j/y5l1am44iWx\n7mpkQrGvXbET5qEYDFlC/61xHKarUB0v+3HLctz1SSQ5gCpSyuoJKHc7SJawxKOy\nVgVRjvhhAgMBAAECggEABQf2OW7Nm/hC1bMBFIOZCJhOK21N2u3pEZZQ7muCZ4IR\nqcEj7lMbCn+rkMgGyJ8v0gAjZTz2LGeA4MVyMuoLBFqqxNQ1KUA3djxuiI1TJUbB\nRcRgC7j2cu6TW1VB9lcdlgpzp5YJgOELMDAPyF/x50CRqtJ3k9LNmApGYqymmBwq\npluw6bYymP2hjT9MmmA3ePZemeVLD7WYwQx1NlWwQvua7vQDgIwYhQmHzx/9UBSj\nxzEjUK8+z2r+hZ6Kt6xwZBbgFqIi9P7idgmxlj4jYoldgrssMGUtrROUFrrAXf1g\nNr7rbg2QHdooMFytJb3mieqWAYy9IBCNLrVuHl6VQQKBgQDB1S6ZcaSjong95b6S\nr0esy7VRCJkKf2Px/5Sgh2yFqGJzWrU9nCndFwodoAZVW/tVurCJeUDlvUoHa433\njE0lX4Lr/D/+gmJ5IDugg2dkdPpcV0ccFtBSJgZ9PcZ4pfKfUCd7ca58Tjg5nstr\nK47e+RyJc37Pa3M0Sr0zrQTt0wKBgQC7tFKa11XoZABntHzN9cCxPVALX1lE0WU2\nDeRES1EXkVWk0yFTdQJwc7fClAO6fsX5hCPjVniOBqS10gX8+BwXopSEAvBq3gUH\n1TZcbFzjOPspB5ULrFa5Ln15Nv7i55m3rn02PkrCQxA/9DXnfkqT6RTD1ZwFaqZ7\n2E1Ac3f8ewKBgAChRb5/7Q4PGB7zYTQu16fLHbK+uWicU2HU99GxvvuMOY2wbMhf\neo9aZNEF1R9v5hg4PBymRTy56cSuZ863KQUHE3Da6AZWvCUyop757lsYOjwUmImR\n1Wl+8CR2D/AScgBsjURMcUm8I1ikmHqnsJYu7xXPR0k7SyuPVqAVXt+7AoGASRyg\nvE052g3xlnNX1YVuq9q87eESzVpeeOKKUgugJ3TljhDqvy4paBG6tuCeXyr4BAtz\nSx6oUHHIAEYxLOqbTp12CcF3Ubju7rEevns65wqP0dhxNp3HHdQ87VT9jPY3CrO9\nc75psicbEj4WLPglJl24R9tRLU7wT/bdiEgxqTcCgYAjD5k0wBA+VsSKBDHhrG+9\nx93dtyMoo/IcUIwW4NfnE20ngM5zWhPKhmtHJLbBHMNUUo2m2pUqocz/QlSJuiks\nTrkKxy5m1pOTrqwH5mspmu/3l38TGYT+m90w+0xNIVU/GkpnYEr0dcT3d1WyHFnY\naB8Fd6cImieqLTBpjTQbhA==\n-----END PRIVATE KEY-----\n';
  private spreadsheetId = 'govigyan';

  constructor() {
    // Using hardcoded credentials as per user request
  }

  async init(sheetId: string = '') {
    if (this.initialized && this.doc) return this.doc;

    try {
      // Use provided sheetId or fallback to the default one
      const spreadsheetId = sheetId || this.spreadsheetId || 'govigyan';
      
      // Create Google Spreadsheet instance with the correct type of options
      // Instead of using googleApiKey (which doesn't exist), we'll use jwt auth only
      this.doc = new GoogleSpreadsheet(spreadsheetId);
      
      // Authentication method
      try {
        // Authentication requires specific format with our credentials
        const credentials = {
          client_email: this.serviceAccountEmail,
          private_key: this.privateKey
        };
        
        // Use type assertion because of TypeScript errors with the library
        await (this.doc as any).useServiceAccountAuth(credentials);
        
        console.log('Authentication successful with Google Sheets');
      } catch (authError) {
        console.warn('Authentication error with Google Sheets:', authError);
        toast.warning('Using limited mode - some Google Sheets features may not work');
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

  getEmbedUrl(spreadsheetId: string = '') {
    const id = spreadsheetId || this.spreadsheetId || 'govigyan';
    return `https://docs.google.com/spreadsheets/d/${id}/preview`;
  }

  extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

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
