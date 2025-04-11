import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Table, FileText } from "lucide-react";
import { toast } from "sonner";
import EditableTable from "@/components/EditableTable";
import { jsonToCSV, csvToJSON, defaultSchema } from "@/utils/csvUtils";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const CSVDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState<string>('');
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState<string>("upload-results.csv");
  const [dataId, setDataId] = useState<string>('');

  useEffect(() => {
    if (location.state?.data) {
      try {
        const jsonData = location.state.data;
        const dataIdentifier = location.state.dataId || uuidv4();
        setDataId(dataIdentifier);
        
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        setFileName(`upload-results-${timestamp}.csv`);
        
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        const schema = location.state.schema || detectSchema(dataArray) || defaultSchema;
        
        const csv = jsonToCSV(dataArray, schema);
        setCsvData(csv);
        
        const parsedData = csvToJSON(csv);
        setTableData(parsedData);
        
        if (!location.state.dataId) {
          saveInitialData(dataArray, dataIdentifier);
        }
      } catch (error) {
        console.error("Error processing data:", error);
        toast.error("Failed to process the data");
      }
    } else {
      toast.error("No data available to display");
      navigate('/upload');
    }
    
    setIsLoading(false);
  }, [location.state, navigate]);

  const detectSchema = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    return Array.from(allKeys);
  };

  const saveInitialData = async (data: any[], id: string) => {
    try {
      const { error } = await supabase
        .from('csv_data')
        .insert({
          id: id,
          data: data,
          file_name: fileName,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error saving initial data:", error);
      }
    } catch (err) {
      console.error("Failed to save initial data:", err);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvData) {
      toast.error("No data available to download");
      return;
    }
    
    try {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
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

  const handleSaveData = async (updatedData: Record<string, string>[]) => {
    if (!dataId) {
      toast.error("Cannot save changes: missing data identifier");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('csv_data')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataId);
        
      if (error) throw error;
      
      setTableData(updatedData);
      
      const updatedCsv = jsonToCSV(updatedData);
      setCsvData(updatedCsv);
      
      toast.success("Changes saved to database successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes to database");
    } finally {
      setIsSaving(false);
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
          
          <Button 
            variant="default" 
            className="flex items-center gap-1"
            onClick={handleDownloadCSV}
            disabled={!csvData}
          >
            <Download className="h-4 w-4 mr-1" />
            Download CSV
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Data Editor</h1>
          <p className="text-muted-foreground">
            Edit your data in the table below. Changes will be saved to the database.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-3">Loading data...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : tableData.length > 0 ? (
          <EditableTable 
            data={tableData} 
            onDataChange={(newData) => setTableData(newData)} 
            onSave={handleSaveData}
            onDownload={handleDownloadCSV}
            title="Data Preview"
            editable={true}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No data available to display. Please upload a file to process.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => navigate('/upload')}>
                  Go to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {csvData && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Information
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleDownloadCSV}
                disabled={!csvData}
              >
                <Download className="h-4 w-4" />
                {fileName}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Filename:</div>
                  <div>{fileName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Rows:</div>
                  <div>{tableData.length}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Columns:</div>
                  <div>{tableData.length > 0 ? Object.keys(tableData[0]).length : 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CSVDisplay;
