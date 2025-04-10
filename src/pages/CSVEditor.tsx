
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download } from "lucide-react";
import { toast } from "sonner";
import EditableTable from "@/components/EditableTable";
import { jsonToCSV } from "@/utils/csvUtils";
import { useGeminiApi } from "@/hooks/useGeminiApi";
import * as XLSX from 'xlsx';

// Define the expected data schema
interface StockEntrySchema {
  Entry_ID?: number;
  DATE: string;
  PARTICULARS: string;
  Voucher_BillNo: string;
  RECEIPTS_Quantity: number;
  RECEIPTS_Amount: number;
  ISSUED_Quantity: number;
  ISSUED_Amount: number;
  BALANCE_Quantity: number;
  BALANCE_Amount: number;
}

const CSVEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [tableData, setTableData] = useState<StockEntrySchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCsvData, updateCsvData, isLoading: apiLoading } = useGeminiApi();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No data ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getCsvData(id);
        
        if (!result) {
          setError("Data not found");
        } else {
          setData(result);
          // Format the data according to our schema
          const formattedData = formatDataToSchema(result.data);
          setTableData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        toast.error("Could not load the CSV data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, getCsvData]);

  // Format data to match our schema
  const formatDataToSchema = (rawData: any): StockEntrySchema[] => {
    if (!rawData) return [];
    
    // If data is already an array, ensure it matches our schema
    if (Array.isArray(rawData)) {
      return rawData.map((item, index) => {
        // Create a properly formatted entry
        return {
          Entry_ID: item.Entry_ID || index + 1,
          DATE: item.DATE || new Date().toISOString().split('T')[0],
          PARTICULARS: item.PARTICULARS || '',
          Voucher_BillNo: item.Voucher_BillNo || '',
          RECEIPTS_Quantity: Number(item.RECEIPTS_Quantity || 0),
          RECEIPTS_Amount: Number(item.RECEIPTS_Amount || 0),
          ISSUED_Quantity: Number(item.ISSUED_Quantity || 0),
          ISSUED_Amount: Number(item.ISSUED_Amount || 0),
          BALANCE_Quantity: Number(item.BALANCE_Quantity || 0),
          BALANCE_Amount: Number(item.BALANCE_Amount || 0)
        };
      });
    }
    
    // If it's a single object, create an array with one item
    if (typeof rawData === 'object') {
      return [{
        Entry_ID: rawData.Entry_ID || 1,
        DATE: rawData.DATE || new Date().toISOString().split('T')[0],
        PARTICULARS: rawData.PARTICULARS || '',
        Voucher_BillNo: rawData.Voucher_BillNo || '',
        RECEIPTS_Quantity: Number(rawData.RECEIPTS_Quantity || 0),
        RECEIPTS_Amount: Number(rawData.RECEIPTS_Amount || 0),
        ISSUED_Quantity: Number(rawData.ISSUED_Quantity || 0),
        ISSUED_Amount: Number(rawData.ISSUED_Amount || 0),
        BALANCE_Quantity: Number(rawData.BALANCE_Quantity || 0),
        BALANCE_Amount: Number(rawData.BALANCE_Amount || 0)
      }];
    }
    
    // Return empty array if data format is unexpected
    return [];
  };

  const handleSaveChanges = async (updatedData: StockEntrySchema[]) => {
    if (!id) {
      toast.error("Cannot save: missing data ID");
      return;
    }

    try {
      await updateCsvData(id, updatedData);
      setTableData(updatedData);
      toast.success("Changes saved successfully");
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("Failed to save changes");
    }
  };

  const handleDownloadXLSX = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(tableData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Stock Data');
      
      // Generate file name
      const fileName = data?.file_name || `stock-data-${id}.xlsx`;
      
      // Write and download
      XLSX.writeFile(wb, fileName);
      
      toast.success("XLSX file downloaded successfully");
    } catch (error) {
      console.error("Error downloading XLSX:", error);
      toast.error("Failed to download the XLSX file");
    }
  };

  const handleDownloadCSV = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data available to download");
      return;
    }

    try {
      const csvString = jsonToCSV(tableData);
      const fileName = data?.file_name || `csv-data-${id}.csv`;
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download the CSV file");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownloadXLSX}
              disabled={!tableData || tableData.length === 0}
            >
              <Download className="h-4 w-4" />
              Download XLSX
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownloadCSV}
              disabled={!tableData || tableData.length === 0}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Edit Stock Data</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading data...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/saved-csvs')}>
              View All Saved Data
            </Button>
          </div>
        ) : (
          <EditableTable 
            data={tableData as Record<string, string>[]}
            onSave={handleSaveChanges}
            onDownload={handleDownloadXLSX}
            title={data?.file_name || "Stock Book Data"}
            editable={true}
          />
        )}
      </div>
    </Layout>
  );
};

export default CSVEditor;
