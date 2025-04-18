
import { useLocation } from 'react-router-dom';
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import config from "@/config/api";

const SpreadsheetView = () => {
  const location = useLocation();
  const { fileName } = location.state || {};

  const openSpreadsheet = () => {
    window.open(config.SPREADSHEET_URL, '_blank');
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {fileName ? `Processed: ${fileName}` : 'Spreadsheet View'}
          </h1>
          <Button
            onClick={openSpreadsheet}
            className="flex items-center gap-2"
          >
            Open in Google Sheets
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-[800px] w-full rounded-lg border bg-background shadow-sm">
          <iframe
            src={`${config.SPREADSHEET_URL}?embedded=true`}
            className="h-full w-full rounded-lg"
            title="Google Spreadsheet"
          />
        </div>
      </div>
    </Layout>
  );
};

export default SpreadsheetView;
