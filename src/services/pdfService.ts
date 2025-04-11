
import { jsPDF } from 'jspdf';

export const createPdfFromImages = async (images: File[]): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Counter to track processed images
      let processedImages = 0;
      
      // Process each image
      images.forEach((image, index) => {
        // Create a FileReader to read the image
        const reader = new FileReader();
        
        reader.onload = function(event) {
          // Get the image data
          const imgData = event.target?.result as string;
          
          // Add a new page for each image after the first one
          if (index > 0) {
            pdf.addPage();
          }
          
          // Create an image element to get dimensions
          const img = new Image();
          img.src = imgData;
          
          img.onload = function() {
            // Calculate image dimensions to fit the page
            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.9;
            const newWidth = imgWidth * ratio;
            const newHeight = imgHeight * ratio;
            
            // Position the image in the center of the page
            const xPos = (pageWidth - newWidth) / 2;
            const yPos = (pageHeight - newHeight) / 2;
            
            // Add the image to the PDF
            pdf.addImage(imgData, 'JPEG', xPos, yPos, newWidth, newHeight);
            
            // Increment the counter
            processedImages++;
            
            // If all images have been processed, resolve the promise
            if (processedImages === images.length) {
              // Generate the PDF blob
              const pdfBlob = pdf.output('blob');
              resolve(pdfBlob);
            }
          };
          
          img.onerror = function() {
            reject(new Error(`Failed to load image at index ${index}`));
          };
        };
        
        reader.onerror = function() {
          reject(new Error(`Failed to read image at index ${index}`));
        };
        
        // Read the image as a data URL
        reader.readAsDataURL(image);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const downloadPdf = (pdfBlob: Blob, filename: string = 'download.pdf') => {
  // Create a URL for the blob
  const url = URL.createObjectURL(pdfBlob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Click the link to trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
