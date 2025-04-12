
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import EditableTable from '@/components/EditableTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Download, Save, Cloud, Database } from 'lucide-react';
import { useGeminiApi } from '@/hooks/useGeminiApi';
import * as XLSX from 'xlsx';
import { googleSheetsService } from '@/services/googleSheetsService';
import { tallyService } from '@/services/tallyService';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RouteState {
  data: {
    extractedData: any[];
    fileId: string;
    fileName: string;
    sheetTitle: string;
    sheetUrl?: string;
    spreadsheetId?: string;
  };
}

const CSVEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, getCsvData, updateCsvData } = useGeminiApi();
  
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingTally, setIsSyncingTally] = useState(false);
  const [fileName, setFileName] = useState('data.xlsx');
  const [fileId, setFileId] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isBrowser] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    const routeState = location.state as RouteState | null;
    if (routeState?.data) {
      const { extractedData, fileId, fileName, sheetUrl, spreadsheetId } = routeState.data;
      setData(extractedData);
      setOriginalData(extractedData);
      setFileName(fileName);
      setFileId(fileId);
      
      // Handle Google Sheet URL from route state
      if (sheetUrl) {
        setSheetUrl(sheetUrl);
      } else if (spreadsheetId) {
        setSheetUrl(googleSheetsService.getEmbedUrl(spreadsheetId));
      }
    } else if (id) {
      fetchData(id);
    }
  }, [id, location]);

  const fetchData = async (id: string) => {
    try {
      setIsLoadingSheet(true);
      const csvData = await getCsvData(id);
      if (csvData) {
        setData(csvData);
        setOriginalData(csvData);
        setFileName(`data_sheet_${id}.xlsx`);
        setFileId(id);
      } else {
        toast.error('Failed to load data.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleDataChange = (newData: any[]) => {
    setData(newData);
  };

  const handleSave = async () => {
    if (!fileId) {
      toast.error('No file ID available to save.');
      return;
    }

    setIsSaving(true);
    try {
      await updateCsvData(fileId, data);
      setOriginalData(data);
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Failed to save changes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, fileName);
  };

  const handleSyncWithGoogle = async () => {
    if (!fileId) {
      toast.error('No file ID available to sync.');
      return;
    }

    // Prevent Google Sheets sync in browser environments
    if (isBrowser) {
      toast.info("Google Sheets sync is simulated in browser environments");
      setSheetUrl(googleSheetsService.getEmbedUrl(fileId));
      return;
    }

    setIsSaving(true);
    try {
      const sheetTitle = `Data_Sheet_${fileId}`;
      const result = await googleSheetsService.updateRows(sheetTitle, data);
      
      if (result.success) {
        toast.success("Data synced with Google Sheets");
        if (result.sheetUrl) {
          setSheetUrl(result.sheetUrl);
        }
      } else {
        // We'll still show the sheet URL if available, even if sync had issues
        if (result.sheetUrl) {
          setSheetUrl(result.sheetUrl);
          toast.error(`Partial sync: ${result.error}. Sheet URL is still available.`);
        } else {
          toast.error(`Failed to sync with Google Sheets: ${result.error}`);
        }
      }
    } catch (sheetErr) {
      console.error("Error syncing with Google Sheets:", sheetErr);
      toast.error("Failed to sync with Google Sheets");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncWithTally = async () => {
    if (data.length === 0) {
      toast.error('No data available to sync with Tally.');
      return;
    }

    setIsSyncingTally(true);
    try {
      await tallyService.syncWithTally(data);
      toast.success("Data synced with Tally ERP");
    } catch (error) {
      console.error("Error syncing with Tally:", error);
      toast.error("Failed to sync with Tally");
    } finally {
      setIsSyncingTally(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{fileName}</h1>
            <p className="text-muted-foreground">{data.length} rows</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWithGoogle}
              disabled={isSaving || isLoading}
              className="flex items-center gap-1"
            >
              <Cloud className="h-4 w-4" />
              Sync with Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncWithTally}
              disabled={isSyncingTally || isLoading}
              className="flex items-center gap-1"
            >
              <Database className="h-4 w-4" />
              {isSyncingTally ? (
                <>
                  <LoadingSpinner />
                  Syncing...
                </>
              ) : (
                "Sync with Tally"
              )}
            </Button>
          </div>
        </div>

        <EditableTable 
          data={data} 
          onDataChange={handleDataChange} 
          onSave={handleSave} 
          title="Spreadsheet Data"
        />
        
        {isLoadingSheet && (
          <div className="mt-6 flex items-center justify-center p-8">
            <LoadingSpinner />
            <span className="ml-2">Loading sheet data...</span>
          </div>
        )}
        
        {sheetUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Google Sheet</h2>
            <div className="border rounded-md overflow-hidden" style={{ height: '500px' }}>
              <iframe 
                src={sheetUrl} 
                width="100%" 
                height="100%" 
                title="Google Sheet" 
                className="border-0"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CSVEditor;
