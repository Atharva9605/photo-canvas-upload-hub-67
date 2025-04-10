
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download } from "lucide-react";
import { toast } from "sonner";
import EditableTable from "@/components/EditableTable";
import { jsonToCSV } from "@/utils/csvUtils";
import csvDataService from "@/api/csvDataService";

const CSVEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No data ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await csvDataService.getData(id);
        
        if (!result) {
          setError("Data not found");
        } else {
          setData(result);
          // Convert the JSON data to a format suitable for the table
          const formattedData = Array.isArray(result.data) 
            ? result.data 
            : [result.data];
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
  }, [id]);

  const handleSaveChanges = async (updatedData: Record<string, string>[]) => {
    if (!id) {
      toast.error("Cannot save: missing data ID");
      return;
    }

    try {
      await csvDataService.updateData(id, updatedData);
      setTableData(updatedData);
      toast.success("Changes saved successfully");
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("Failed to save changes");
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
              onClick={handleDownloadCSV}
              disabled={!tableData || tableData.length === 0}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-bold">Edit CSV Data</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3">Loading data...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/saved-csvs')}>
              View All Saved CSVs
            </Button>
          </div>
        ) : (
          <EditableTable 
            data={tableData}
            onSave={handleSaveChanges}
            onDownload={handleDownloadCSV}
            title={data?.file_name || "CSV Data"}
            editable={true}
          />
        )}
      </div>
    </Layout>
  );
};

export default CSVEditor;
