
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  FileSpreadsheet, 
  Plus, 
  Save, 
  Upload,
  Download,
  Table,
  Trash2,
  FileText,
  PanelRight,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SpreadsheetList } from "@/components/SpreadsheetList";
import { ImportDialog } from "@/components/ImportDialog";

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;
const AUTOSAVE_INTERVAL = 10000; // 10 seconds

// Component to create a spreadsheet interface
const Spreadsheets = () => {
  const [title, setTitle] = useState("Untitled Spreadsheet");
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [data, setData] = useState<Array<Array<string>>>(
    Array(DEFAULT_ROWS).fill(0).map(() => Array(DEFAULT_COLS).fill(""))
  );
  const [loading, setLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Set up autosave
  useEffect(() => {
    if (autoSave && spreadsheetId) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setInterval(() => {
        saveSpreadsheetData(true);
      }, AUTOSAVE_INTERVAL);
    } else if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, spreadsheetId, data]);

  // Function to create a new spreadsheet
  const createNewSpreadsheet = async () => {
    setLoading(true);
    try {
      const { data: spreadsheet, error } = await supabase
        .from('spreadsheets')
        .insert({
          title: title,
          auto_save: autoSave,
          last_edited_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (spreadsheet) {
        setSpreadsheetId(spreadsheet.id);
        setData(Array(DEFAULT_ROWS).fill(0).map(() => Array(DEFAULT_COLS).fill("")));
        toast({
          title: "Spreadsheet created",
          description: "Your new spreadsheet has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create a new spreadsheet.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to save spreadsheet data
  const saveSpreadsheetData = async (isAutoSave = false) => {
    if (!spreadsheetId) {
      await createNewSpreadsheet();
      return;
    }

    setLoading(true);
    try {
      // Update the spreadsheet title and autosave setting
      const { error: updateError } = await supabase
        .from('spreadsheets')
        .update({ 
          title: title,
          auto_save: autoSave,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', spreadsheetId);

      if (updateError) throw updateError;

      // Convert 2D array to cell records
      const cellData = [];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j] !== "") {
            cellData.push({
              spreadsheet_id: spreadsheetId,
              row_index: i,
              column_index: j,
              cell_value: data[i][j],
              cell_type: "text",
              cell_style: {}
            });
          }
        }
      }

      // Clear existing data first
      const { error: deleteError } = await supabase
        .from('spreadsheet_data')
        .delete()
        .eq('spreadsheet_id', spreadsheetId);

      if (deleteError) throw deleteError;

      // Insert new data
      if (cellData.length > 0) {
        const { error: insertError } = await supabase
          .from('spreadsheet_data')
          .insert(cellData);

        if (insertError) throw insertError;
      }

      const now = new Date();
      setLastSaved(now.toLocaleTimeString());

      if (!isAutoSave) {
        toast({
          title: "Spreadsheet saved",
          description: "Your spreadsheet has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving spreadsheet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save spreadsheet data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cell value change
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  // Add a row to the spreadsheet
  const addRow = () => {
    const newData = [...data];
    const newRow = Array(data[0].length).fill("");
    newData.push(newRow);
    setData(newData);
  };

  // Add a column to the spreadsheet
  const addColumn = () => {
    const newData = data.map(row => [...row, ""]);
    setData(newData);
  };

  // Export the spreadsheet as CSV
  const exportAsCSV = () => {
    // Generate CSV content
    const csvContent = data.map(row => 
      row.map(cell => 
        // Escape quotes and wrap in quotes if needed
        cell.includes(",") || cell.includes("\"") || cell.includes("\n") 
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(",")
    ).join("\n");

    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to download the CSV
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle imported data
  const handleImportedData = (importedData: string[][]) => {
    setData(importedData);
    setIsImportDialogOpen(false);
    toast({
      title: "Data imported",
      description: "Your data has been imported successfully.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Spreadsheet Editor
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Spreadsheets
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-64"
                  placeholder="Spreadsheet Title"
                />
                <Button 
                  onClick={() => saveSpreadsheetData()} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={createNewSpreadsheet} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  onClick={exportAsCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autosave"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <Label htmlFor="autosave">Auto-save</Label>
              </div>
              {lastSaved && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Last saved at {lastSaved}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
              <Card className="overflow-x-auto p-4">
                <div className="min-w-max">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-10 border bg-muted p-2"></th>
                        {data[0].map((_, i) => (
                          <th key={i} className="border bg-muted p-2 text-center">
                            {String.fromCharCode(65 + i)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="border bg-muted p-2 text-center">{rowIndex + 1}</td>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="border p-0">
                              <Input
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="h-full w-full border-0 p-2 focus:ring-0"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={addRow}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Row
                </Button>
                <Button 
                  variant="outline" 
                  onClick={addColumn}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Add Column
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="mb-6 flex items-center gap-2">
              <PanelRight className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">My Spreadsheets</h1>
            </div>
            <SpreadsheetList setSpreadsheetId={setSpreadsheetId} />
          </TabsContent>
        </Tabs>
      </div>
      
      <ImportDialog 
        isOpen={isImportDialogOpen} 
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportedData}
      />
    </Layout>
  );
};

export default Spreadsheets;
