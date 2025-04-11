
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Download, RefreshCw, Trash2, Plus } from 'lucide-react';
import { toast } from "sonner";

interface EditableTableProps {
  data: Record<string, any>[];
  onDataChange: (data: Record<string, any>[]) => void;
  onSave?: (data: Record<string, any>[]) => Promise<void>;
  onDownload?: () => void;
  title?: string;
  editable?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({
  data: initialData,
  onDataChange,
  onSave,
  onDownload,
  title = "Data Table",
  editable = true
}) => {
  const [data, setData] = useState<Record<string, any>[]>(initialData);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize headers from data
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setHeaders(Object.keys(initialData[0]));
      setData(initialData);
    }
  }, [initialData]);

  const handleCellChange = (row: number, col: string, value: any) => {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
    onDataChange(newData);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(data);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    headers.forEach(header => {
      newRow[header] = '';
    });
    const newData = [...data, newRow];
    setData(newData);
    onDataChange(newData);
    toast.info("New row added");
  };

  const handleDeleteRow = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    onDataChange(newData);
    toast.info("Row deleted");
  };

  const handleCellClick = (rowIndex: number, colName: string) => {
    if (!editable) return;
    setSelectedCell({ row: rowIndex, col: colName });
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  };

  const handleInputBlur = () => {
    setSelectedCell(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    if (e.key === 'Enter') {
      setSelectedCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Calculate next cell position
      const currentIndex = headers.indexOf(selectedCell.col);
      const nextColIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
      
      if (nextColIndex >= 0 && nextColIndex < headers.length) {
        // Move to next/previous column in same row
        setSelectedCell({
          row: selectedCell.row,
          col: headers[nextColIndex]
        });
      } else if (!e.shiftKey && nextColIndex >= headers.length) {
        // Move to first column of next row
        if (selectedCell.row + 1 < data.length) {
          setSelectedCell({
            row: selectedCell.row + 1,
            col: headers[0]
          });
        }
      } else if (e.shiftKey && nextColIndex < 0) {
        // Move to last column of previous row
        if (selectedCell.row - 1 >= 0) {
          setSelectedCell({
            row: selectedCell.row - 1,
            col: headers[headers.length - 1]
          });
        }
      }
      
      // Focus the input after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  };

  if (headers.length === 0 || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No data available</p>
            {editable && (
              <Button 
                onClick={handleAddRow} 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Row
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          {editable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddRow}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Row
            </Button>
          )}
          {editable && onSave && (
            <Button 
              onClick={handleSave} 
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
          {onDownload && (
            <Button 
              onClick={onDownload} 
              variant="outline" 
              size="sm"
            >
              <Download className="mr-1 h-4 w-4" />
              Download CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
                {editable && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((col) => (
                    <TableCell 
                      key={`${rowIndex}-${col}`} 
                      className={`${editable ? 'cursor-pointer' : ''} ${selectedCell?.row === rowIndex && selectedCell?.col === col ? 'p-0' : ''}`}
                      onClick={() => handleCellClick(rowIndex, col)}
                    >
                      {selectedCell?.row === rowIndex && selectedCell?.col === col ? (
                        <Input
                          ref={inputRef}
                          value={row[col]}
                          onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                          onBlur={handleInputBlur}
                          onKeyDown={handleInputKeyDown}
                          className="h-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      ) : (
                        row[col]
                      )}
                    </TableCell>
                  ))}
                  {editable && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="h-7 w-7 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableTable;
