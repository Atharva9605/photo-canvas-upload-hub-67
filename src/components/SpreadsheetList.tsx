
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  Trash2, 
  Edit, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  SortAscending,
  SortDescending,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface SpreadsheetListProps {
  setSpreadsheetId: (id: string) => void;
}

type SortField = 'title' | 'last_edited_at';
type SortOrder = 'asc' | 'desc';

export function SpreadsheetList({ setSpreadsheetId }: SpreadsheetListProps) {
  const [spreadsheets, setSpreadsheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('last_edited_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all spreadsheets
  const fetchSpreadsheets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spreadsheets')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      
      setSpreadsheets(data || []);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your spreadsheets.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a spreadsheet
  const deleteSpreadsheet = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Delete spreadsheet data first (foreign key constraint)
      const { error: dataError } = await supabase
        .from('spreadsheet_data')
        .delete()
        .eq('spreadsheet_id', id);

      if (dataError) throw dataError;

      // Then delete the spreadsheet
      const { error } = await supabase
        .from('spreadsheets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the list
      setSpreadsheets(spreadsheets.filter(sheet => sheet.id !== id));
      
      toast({
        title: 'Spreadsheet deleted',
        description: 'The spreadsheet has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting spreadsheet:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the spreadsheet.',
      });
    }
  };

  // Open a spreadsheet
  const openSpreadsheet = (id: string) => {
    setSpreadsheetId(id);
    navigate('/spreadsheets');
  };

  // Handle sort change
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Load spreadsheets on component mount or when sort params change
  useEffect(() => {
    fetchSpreadsheets();
  }, [sortField, sortOrder]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="opacity-60 animate-pulse">
            <CardHeader>
              <CardTitle className="h-6 w-2/3 bg-muted rounded"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <div className="h-8 w-20 bg-muted rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Spreadsheets</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                {sortField === 'title' ? (
                  <>
                    <SortAscending className="h-4 w-4" />
                    Sort by Name
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    Sort by Date
                  </>
                )}
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange('title', 'asc')}>
                <SortAscending className="h-4 w-4 mr-2" />
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('title', 'desc')}>
                <SortDescending className="h-4 w-4 mr-2" />
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('last_edited_at', 'desc')}>
                <ArrowDown className="h-4 w-4 mr-2" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('last_edited_at', 'asc')}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate('/spreadsheets')} size="sm" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            New Spreadsheet
          </Button>
        </div>
      </div>

      {spreadsheets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No spreadsheets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first spreadsheet to get started.
          </p>
          <Button onClick={() => navigate('/spreadsheets')}>
            Create Spreadsheet
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spreadsheets.map(sheet => (
            <Card 
              key={sheet.id} 
              className="cursor-pointer transition-all hover:shadow-md" 
              onClick={() => openSpreadsheet(sheet.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="truncate">{sheet.title || 'Untitled Spreadsheet'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Last edited: {sheet.last_edited_at ? format(new Date(sheet.last_edited_at), 'MMM d, yyyy h:mm a') : 'Never'}
                  </span>
                </div>
                {sheet.auto_save && (
                  <div className="mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Auto-save enabled
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={(e) => deleteSpreadsheet(sheet.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm"
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
