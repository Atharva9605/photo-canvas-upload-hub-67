
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import config from "@/config/api";

const SpreadsheetView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { fileName: stateFileName } = location.state || {};
  const { fileName: paramFileName } = params;
  
  // Use filename from URL params, state, or null
  const fileName = stateFileName || paramFileName;

  // Ensure we always have state data - if missing, we can still display the component
  useEffect(() => {
    // Store the file name in session storage when it exists
    if (fileName) {
      sessionStorage.setItem('lastProcessedFile', fileName);
    }
    
    // If we don't have any filename at all (not in state, URL param, or session storage),
    // check if we need to redirect to home
    if (!fileName && !sessionStorage.getItem('lastProcessedFile')) {
      console.log('No file name found, but continuing to display spreadsheet view');
    }
  }, [fileName, navigate]);

  // Get the file name using multiple fallback options
  const displayFileName = fileName || sessionStorage.getItem('lastProcessedFile') || 'Spreadsheet';

  const openSpreadsheet = () => {
    window.open(config.SPREADSHEET_URL, '_blank');
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {displayFileName !== 'Spreadsheet' ? `Processed: ${displayFileName}` : 'Spreadsheet View'}
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
            onError={(e) => {
              console.error("Error loading spreadsheet iframe:", e);
              // Provide fallback content if iframe fails to load
              const iframe = e.target as HTMLIFrameElement;
              if (iframe && iframe.contentDocument) {
                iframe.contentDocument.body.innerHTML = `
                  <div style="display: flex; height: 100%; align-items: center; justify-content: center; flex-direction: column; padding: 2rem;">
                    <h2 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">Unable to load spreadsheet</h2>
                    <p style="margin-bottom: 1rem;">Please try refreshing the page or clicking the "Open in Google Sheets" button above.</p>
                  </div>
                `;
              }
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SpreadsheetView;
