
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
    // Process data from location state
    if (location.state?.data) {
      try {
        const jsonData = location.state.data;
        const dataIdentifier = location.state.dataId || uuidv4();
        setDataId(dataIdentifier);
        
        // Set filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        setFileName(`upload-results-${timestamp}.csv`);
        
        // If data is already an array, use it directly, otherwise wrap it in an array
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Auto-detect schema from data or use default schema
        const schema = location.state.schema || detectSchema(dataArray) || defaultSchema;
        
        // Convert JSON to CSV using schema
        const csv = jsonToCSV(dataArray, schema);
        setCsvData(csv);
        
        // Convert CSV back to JSON for table display
        const parsedData = csvToJSON(csv);
        setTableData(parsedData);
        
        // If there's no dataId from state, save this data for the first time
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

  // Function to detect schema from data
  const detectSchema = (data: any[]) => {
    if (!data || data.length === 0) return null;
    
    // Get all unique keys from all objects in the array
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    return Array.from(allKeys);
  };

  // Function to save initial data to database
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
      // Create blob and trigger download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download the CSV file");
    }
  };

  const handleSaveChanges = async (updatedData: Record<string, string>[]) => {
    if (!dataId) {
      toast.error("Cannot save changes: missing data identifier");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the database record
      const { error } = await supabase
        .from('csv_data')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataId);
        
      if (error) throw error;
      
      // Update local state
      setTableData(updatedData);
      
      // Update CSV data
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
            onSave={handleSaveChanges}
            onDownload={handleDownloadCSV}
            title="Edit CSV Data"
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

        {/* File information */}
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
