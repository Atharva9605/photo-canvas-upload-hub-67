
/**
 * Converts a JSON object or array of objects to CSV format
 * @param jsonData - JSON data to convert (object or array of objects)
 * @param schema - Optional schema to define column order and headers
 * @returns CSV formatted string
 */
export function jsonToCSV(jsonData: any, schema?: string[]): string {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid data format');
  }
  
  // Handle array of objects
  if (Array.isArray(jsonData)) {
    if (jsonData.length === 0) return '';
    
    // Get headers - either from schema or from the first object
    const headers = schema || Object.keys(jsonData[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of jsonData) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle complex objects and arrays by JSON stringifying them
        const processedValue = (value === null || value === undefined) 
          ? '' 
          : (typeof value === 'object')
            ? JSON.stringify(value)
            : String(value);
        
        // Escape quotes and wrap in quotes
        const escaped = processedValue.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  } 
  // Handle single object
  else {
    const headers = schema || Object.keys(jsonData);
    const values = headers.map(header => {
      const value = jsonData[header];
      // Handle complex objects and arrays by JSON stringifying them
      const processedValue = (value === null || value === undefined) 
        ? '' 
        : (typeof value === 'object')
          ? JSON.stringify(value)
          : String(value);
      
      // Escape quotes and wrap in quotes
      const escaped = processedValue.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    
    return [headers.join(','), values.join(',')].join('\n');
  }
}

/**
 * Converts CSV data to an array of objects
 * @param csvData - CSV formatted string
 * @returns Array of objects with headers as keys
 */
export function csvToJSON(csvData: string): Record<string, string>[] {
  if (!csvData) return [];
  
  const lines = csvData.split('\n');
  if (lines.length < 2) return []; // Need at least headers and one data row
  
  // Parse header row
  const headers = parseCSVRow(lines[0]);
  
  // Parse data rows
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = parseCSVRow(lines[i]);
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    result.push(obj);
  }
  
  return result;
}

/**
 * Parse a CSV row considering quotes
 * @param row - CSV row string
 * @returns Array of values from the row
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let insideQuote = false;
  let currentValue = '';
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Check for escaped quotes (double quotes)
      if (insideQuote && i + 1 < row.length && row[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      // End of field
      result.push(currentValue);
      currentValue = '';
    } else {
      // Regular character
      currentValue += char;
    }
  }
  
  // Add the last value
  result.push(currentValue);
  
  return result.map(value => value.replace(/^"|"$/g, ''));
}

/**
 * Default schema for CSV exports
 * Can be customized based on data structure
 */
export const defaultSchema = [
  'id',
  'name',
  'type',
  'size',
  'uploadDate',
  'status',
  'metadata',
  'content'
];

