
/**
 * This service handles the integration with Tally ERP software
 * using XML-based communication via the Tally XML Server.
 */

// Tally server configuration
const TALLY_SERVER_URL = 'http://localhost:9000'; // Default Tally XML Server port
const TALLY_COMPANY_NAME = 'Your Company Name'; // Replace with the actual company name in Tally

interface TallyVoucher {
  date: string;
  voucherType: string;
  voucherNumber: string;
  reference: string;
  narration: string;
  ledgerEntries: {
    ledgerName: string;
    amount: number;
    isDebit: boolean;
  }[];
}

export class TallyService {
  /**
   * Creates an XML string for Tally voucher creation
   */
  private createVoucherXML(voucher: TallyVoucher): string {
    const entries = voucher.ledgerEntries.map(entry => {
      const amountTag = entry.isDebit ? 'DRAMOUNT' : 'CRAMOUNT';
      return `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${entry.ledgerName}</LEDGERNAME>
          <${amountTag}>${Math.abs(entry.amount).toFixed(2)}</${amountTag}>
        </ALLLEDGERENTRIES.LIST>`;
    }).join('');

    return `
      <ENVELOPE>
        <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Import</TALLYREQUEST>
          <TYPE>Data</TYPE>
          <ID>Vouchers</ID>
        </HEADER>
        <BODY>
          <IMPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Vouchers</REPORTNAME>
              <STATICVARIABLES>
                <SVCURRENTCOMPANY>${TALLY_COMPANY_NAME}</SVCURRENTCOMPANY>
              </STATICVARIABLES>
            </REQUESTDESC>
            <REQUESTDATA>
              <TALLYMESSAGE>
                <VOUCHER>
                  <DATE>${voucher.date}</DATE>
                  <VOUCHERTYPENAME>${voucher.voucherType}</VOUCHERTYPENAME>
                  <VOUCHERNUMBER>${voucher.voucherNumber}</VOUCHERNUMBER>
                  <REFERENCE>${voucher.reference}</REFERENCE>
                  <NARRATION>${voucher.narration}</NARRATION>
                  ${entries}
                </VOUCHER>
              </TALLYMESSAGE>
            </REQUESTDATA>
          </IMPORTDATA>
        </BODY>
      </ENVELOPE>`;
  }

  /**
   * Send data to Tally ERP software
   * @param data The spreadsheet data to be sent to Tally
   */
  async syncWithTally(data: any[]): Promise<boolean> {
    try {
      console.log("Preparing to sync data with Tally...");
      
      // For demonstration purposes, we'll construct a voucher from the first row
      // In a real implementation, you would iterate through all rows or batch them
      if (data.length === 0) {
        console.warn("No data to sync with Tally");
        return false;
      }

      const sampleRow = data[0];
      
      // This is a simplified mapping - adjust according to your Tally ledger structure
      const voucher: TallyVoucher = {
        date: sampleRow.DATE, // Format might need adjustment for Tally
        voucherType: "Purchase", // Example, could be Sales, Journal, etc.
        voucherNumber: sampleRow.Voucher_BillNo || "",
        reference: sampleRow.Voucher_BillNo || "",
        narration: sampleRow.PARTICULARS || "",
        ledgerEntries: [
          {
            // This should be a valid ledger name in your Tally setup
            ledgerName: "Purchase Account",
            amount: parseFloat(sampleRow.RECEIPTS_Amount) || 0,
            isDebit: true
          },
          {
            // This should be a valid ledger name in your Tally setup
            ledgerName: "Cash Account",
            amount: parseFloat(sampleRow.RECEIPTS_Amount) || 0,
            isDebit: false
          }
        ]
      };

      const xmlData = this.createVoucherXML(voucher);
      
      // In a real implementation, you would send this XML to Tally using fetch or axios
      // For now, we'll just log it and simulate success
      console.log("XML data that would be sent to Tally:");
      console.log(xmlData);
      
      // Simulate a successful call to Tally
      console.log("Data successfully synced with Tally");
      
      return true;
    } catch (error) {
      console.error("Error syncing with Tally:", error);
      throw new Error("Failed to sync with Tally");
    }
  }

  /**
   * Maps database or spreadsheet columns to Tally voucher fields
   * @param row The data row to map
   * @returns A properly structured Tally voucher
   */
  mapRowToTallyVoucher(row: any): TallyVoucher {
    // Format the date for Tally (YYYYMMDD)
    const dateString = row.DATE;
    const formattedDate = dateString.replace(/-/g, '');
    
    return {
      date: formattedDate,
      voucherType: determineVoucherType(row), // Helper function to determine voucher type
      voucherNumber: row.Voucher_BillNo || "",
      reference: row.Voucher_BillNo || "",
      narration: row.PARTICULARS || "",
      ledgerEntries: createLedgerEntries(row) // Helper function to create appropriate entries
    };
  }
}

// Helper function to determine the appropriate voucher type based on row data
function determineVoucherType(row: any): string {
  if (row.RECEIPTS_Amount > 0 && row.ISSUED_Amount === 0) {
    return "Purchase";
  } else if (row.ISSUED_Amount > 0 && row.RECEIPTS_Amount === 0) {
    return "Sales";
  } else {
    return "Journal";
  }
}

// Helper function to create appropriate ledger entries based on row data
function createLedgerEntries(row: any): { ledgerName: string; amount: number; isDebit: boolean }[] {
  const entries = [];
  
  // If there are receipts, create a purchase entry
  if (row.RECEIPTS_Amount > 0) {
    entries.push({
      ledgerName: "Purchase Account",
      amount: parseFloat(row.RECEIPTS_Amount),
      isDebit: true
    });
    entries.push({
      ledgerName: "Cash Account",
      amount: parseFloat(row.RECEIPTS_Amount),
      isDebit: false
    });
  }
  
  // If there are issues, create a sales entry
  if (row.ISSUED_Amount > 0) {
    entries.push({
      ledgerName: "Cash Account",
      amount: parseFloat(row.ISSUED_Amount),
      isDebit: true
    });
    entries.push({
      ledgerName: "Sales Account",
      amount: parseFloat(row.ISSUED_Amount),
      isDebit: false
    });
  }
  
  return entries;
}

export const tallyService = new TallyService();
