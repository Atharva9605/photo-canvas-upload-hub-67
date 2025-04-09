
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FileSpreadsheet, Plus, Save, Upload } from "lucide-react";

// Component to create a basic spreadsheet interface
const Spreadsheets = () => {
  const [title, setTitle] = useState("Untitled Spreadsheet");
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [data, setData] = useState<Array<Array<string>>>(Array(10).fill(0).map(() => Array(10).fill("")));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Function to create a new spreadsheet
  const createNewSpreadsheet = async () => {
    setLoading(true);
    try {
      const { data: spreadsheet, error } = await supabase
        .from('spreadsheets')
        .insert({
          title: title
        })
        .select('id')
        .single();

      if (error) throw error;
      
      if (spreadsheet) {
        setSpreadsheetId(spreadsheet.id);
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
  const saveSpreadsheetData = async () => {
    if (!spreadsheetId) {
      await createNewSpreadsheet();
      return;
    }

    setLoading(true);
    try {
      // Convert 2D array to cell records
      const cellData = [];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j] !== "") {
            cellData.push({
              spreadsheet_id: spreadsheetId,
              row_index: i,
              column_index: j,
              cell_value: data[i][j]
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

      toast({
        title: "Spreadsheet saved",
        description: "Your spreadsheet has been saved successfully.",
      });
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              placeholder="Spreadsheet Title"
            />
            <Button 
              onClick={saveSpreadsheetData} 
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
          </div>
        </div>

        <Card className="overflow-x-auto p-4">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="w-10 border bg-muted p-2"></th>
                {Array(10).fill(0).map((_, i) => (
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
        </Card>
      </div>
    </Layout>
  );
};

export default Spreadsheets;
