import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Table as TablesIcon, ExternalLink, Save, FileSpreadsheet } from "lucide-react";

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 10;

// Component to create a spreadsheet interface
const CSVEditor = () => {
  const [title, setTitle] = useState("Untitled Spreadsheet");
  const [data, setData] = useState<Array<Array<string>>>(
    Array(DEFAULT_ROWS).fill(0).map(() => Array(DEFAULT_COLS).fill(""))
  );
  const [loading, setLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sheetUrlFromParams = searchParams.get('sheetUrl');

  // Function to create a new spreadsheet
  const createNewSpreadsheet = async () => {
    setLoading(true);
    // try {
    //   const { data: spreadsheet, error } = await supabase
    //     .from('spreadsheets')
    //     .insert({
    //       title: title,
    //       // user_id: user?.id,
    //     })
    //     .select('id')
    //     .single();

    //   if (error) throw error;
      
    //   if (spreadsheet) {
    //     // setSpreadsheetId(spreadsheet.id);
    //     setData(Array(DEFAULT_ROWS).fill(0).map(() => Array(DEFAULT_COLS).fill("")));
    //     toast({
    //       title: "Spreadsheet created",
    //       description: "Your new spreadsheet has been created successfully.",
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error creating spreadsheet:", error);
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: "Failed to create a new spreadsheet.",
    //   });
    // } finally {
    //   setLoading(false);
    // }
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">CSV Editor</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => createNewSpreadsheet()} disabled={loading}>
              New Spreadsheet
            </Button>
          </div>
        </div>

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
                        <input
                          type="text"
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={addRow}>
            Add Row
          </Button>
          <Button variant="outline" onClick={addColumn}>
            Add Column
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CSVEditor;
