
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  FileSpreadsheet, 
  Plus, 
  Save, 
  Upload, 
  FileUp 
} from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "@/components/ui/sonner";

interface SpreadsheetData {
  id?: string;
  title: string;
  data: string[][];
}

const Spreadsheets: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetData[]>([]);
  const [currentSpreadsheet, setCurrentSpreadsheet] = useState<SpreadsheetData>({
    title: 'Untitled Spreadsheet',
    data: Array.from({ length: 20 }, () => Array(10).fill(''))
  });

  const fetchSpreadsheets = async () => {
    const { data, error } = await supabase.from('spreadsheets').select('*');
    if (error) {
      toast.error("Failed to fetch spreadsheets");
    } else {
      setSpreadsheets(data || []);
    }
  };

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...currentSpreadsheet.data];
    newData[rowIndex][colIndex] = value;
    setCurrentSpreadsheet(prev => ({
      ...prev,
      data: newData
    }));
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        setCurrentSpreadsheet(prev => ({
          ...prev,
          data: importedData
        }));
        
        toast.success("File imported successfully!");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSaveSpreadsheet = async () => {
    try {
      const { data, error } = await supabase
        .from('spreadsheets')
        .insert({
          title: currentSpreadsheet.title,
          // TODO: Link to user when authentication is implemented
        })
        .select();

      if (error) throw error;

      const spreadsheetId = data?.[0]?.id;

      const cellDataToSave = currentSpreadsheet.data.flatMap((row, rowIndex) => 
        row.map((cellValue, colIndex) => ({
          spreadsheet_id: spreadsheetId,
          row_index: rowIndex,
          column_index: colIndex,
          cell_value: cellValue
        }))
      );

      const { error: cellError } = await supabase
        .from('spreadsheet_data')
        .insert(cellDataToSave);

      if (cellError) throw cellError;

      toast.success("Spreadsheet saved successfully!");
      fetchSpreadsheets();
    } catch (error) {
      toast.error("Failed to save spreadsheet");
      console.error(error);
    }
  };

  const renderSpreadsheetTable = () => (
    <Table className="border">
      <TableHeader>
        <TableRow>
          {Array.from({ length: 10 }).map((_, colIndex) => (
            <TableHead key={colIndex}>
              {String.fromCharCode(65 + colIndex)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentSpreadsheet.data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, colIndex) => (
              <TableCell key={colIndex} className="p-0">
                <Input
                  type="text"
                  value={cell}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  className="border-none focus-visible:ring-0"
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Spreadsheets</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setCurrentSpreadsheet({
                title: 'Untitled Spreadsheet',
                data: Array.from({ length: 20 }, () => Array(10).fill(''))
              })}
            >
              <Plus className="mr-2" /> New
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <FileSpreadsheet className="mr-2" /> My Spreadsheets
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>My Spreadsheets</DialogTitle>
                </DialogHeader>
                {/* TODO: Implement spreadsheet list view */}
                <p>Spreadsheet list will be displayed here</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              value={currentSpreadsheet.title}
              onChange={(e) => setCurrentSpreadsheet(prev => ({
                ...prev,
                title: e.target.value
              }))}
              placeholder="Spreadsheet Title"
              className="flex-grow"
            />
            <Button onClick={handleSaveSpreadsheet}>
              <Save className="mr-2" /> Save
            </Button>
          </div>

          <div className="flex space-x-4 mb-4">
            <label htmlFor="import-file" className="cursor-pointer">
              <Button variant="outline" asChild>
                <div>
                  <Upload className="mr-2" /> Import
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
              </Button>
            </label>
            <Button variant="outline" onClick={() => {/* TODO: Export functionality */}}>
              <FileUp className="mr-2" /> Export
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            {renderSpreadsheetTable()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Spreadsheets;
