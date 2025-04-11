
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import EditableTable from '@/components/EditableTable';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft, Download, Save, Cloud, Database, FileSpreadsheet } from 'lucide-react';
import { useGeminiApi } from '@/hooks/useGeminiApi';
import * as XLSX from 'xlsx';
import { googleSheetsService } from '@/services/googleSheetsService';
import { tallyService } from '@/services/tallyService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteState {
  data: {
    extractedData: any[];
    fileId: string;
    fileName: string;
    sheetTitle: string;
  };
  sheetUrl?: string;
  spreadsheetId?: string;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  link: string | null;
  sheetTitle: string | null;
}

const ExportDialog = ({ isOpen, onClose, link, sheetTitle }: ExportDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Google Sheet Exported</DialogTitle>
          <DialogDescription>
            Your data has been successfully exported to Google Sheets
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Sheet Title:</p>
            <p className="text-sm text-muted-foreground">{sheetTitle}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Shareable Link:</p>
            <p className="text-sm break-all text-blue-500">{link}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => {
            window.open(link || '', '_blank');
          }}>
            Open in New Tab
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CSVEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, getCsvData, updateCsvData } = useGeminiApi();
  
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingTally, setIsSyncingTally] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fileName, setFileName] = useState('data.xlsx');
  const [fileId, setFileId] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportedLink, setExportedLink] = useState<string | null>(null);
  const [exportedSheetTitle, setExportedSheetTitle] = useState<string | null>(null);
  
  // Get the spreadsheetId from location state if provided
  const routeState = location.state as RouteState | null;
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(routeState?.spreadsheetId || null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(routeState?.sheetUrl || null);

  useEffect(() => {
    if (routeState?.data) {
      const { extractedData, fileId, fileName } = routeState.data;
      setData(extractedData);
      setOriginalData(extractedData);
      setFileName(fileName);
      setFileId(fileId);
      
      // If there's a spreadsheetId in the route state, set it
      if (routeState.spreadsheetId) {
        setSpreadsheetId(routeState.spreadsheetId);
      }
      
      // If there's a sheetUrl in the route state, set it
      if (routeState.sheetUrl) {
        setSheetUrl(routeState.sheetUrl);
      }
    } else if (id) {
      fetchData(id);
    }
  }, [id, location]);

  const fetchData = async (id: string) => {
    try {
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
      toast.error('Failed to load data.');
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
      toast.error('Failed to save changes.');
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

    try {
      const sheetTitle = `Data_Sheet_${fileId}`;
      await googleSheetsService.updateRows(sheetTitle, data);
      toast.success("Data synced with Google Sheets");
    } catch (sheetErr) {
      console.error("Error syncing with Google Sheets:", sheetErr);
      toast.error("Failed to sync with Google Sheets");
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

  const handleExportToGoogleSheet = async () => {
    if (data.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const title = `Exported_Results_${timestamp}`;
      
      const result = await googleSheetsService.exportToGoogleSheet(data, title);
      
      if (result.success) {
        setExportedLink(result.shareableLink);
        setExportedSheetTitle(result.sheetTitle);
        setSpreadsheetId(result.spreadsheetId);
        setSheetUrl(result.shareableLink);
        setExportDialogOpen(true);
      }
    } catch (error) {
      console.error("Error exporting to Google Sheet:", error);
      toast.error("Failed to export to Google Sheet");
    } finally {
      setIsExporting(false);
    }
  };

  // Function to get the embed URL for the Google Sheet
  const getEmbedUrl = () => {
    if (!spreadsheetId) return null;
    return googleSheetsService.getEmbedUrl(spreadsheetId);
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
            <Button
              variant="default"
              size="sm"
              onClick={handleExportToGoogleSheet}
              disabled={isExporting || isLoading}
              className="flex items-center gap-1"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Export to Google Sheet
                </>
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

        {/* Display the Google Sheet in an iframe if spreadsheetId is available */}
        {spreadsheetId && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Google Sheet Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe 
                src={getEmbedUrl() || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`}
                width="100%" 
                height="500" 
                style={{ border: 'none' }}
                title="Google Sheet Preview"
              />
              {sheetUrl && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => window.open(sheetUrl, '_blank')}>
                    Open in Google Sheets
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <ExportDialog
          isOpen={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          link={exportedLink}
          sheetTitle={exportedSheetTitle}
        />
      </div>
    </Layout>
  );
};

export default CSVEditor;
