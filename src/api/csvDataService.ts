
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for handling CSV data operations
 */
export const csvDataService = {
  /**
   * Save CSV data to the database
   * @param data - The data to save
   * @param fileName - Name of the file
   * @returns Promise with the operation result
   */
  saveData: async (data: any, fileName: string) => {
    try {
      // Ensure the table exists
      await ensureCsvDataTableExists();
      
      const id = crypto.randomUUID();
      
      const { data: result, error } = await supabase
        .from('csv_data')
        .insert({
          id,
          data,
          file_name: fileName,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      return { id, data: result };
    } catch (error) {
      console.error("Error saving CSV data:", error);
      throw error;
    }
  },
  
  /**
   * Update existing CSV data
   * @param id - ID of the data to update
   * @param data - Updated data
   * @returns Promise with the operation result
   */
  updateData: async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('csv_data')
        .update({
          data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Error updating CSV data:", error);
      throw error;
    }
  },
  
  /**
   * Get CSV data by ID
   * @param id - ID of the data to retrieve
   * @returns Promise with the data
   */
  getData: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('csv_data')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error retrieving CSV data:", error);
      throw error;
    }
  },
  
  /**
   * Get all CSV data entries
   * @returns Promise with array of data entries
   */
  getAllData: async () => {
    try {
      const { data, error } = await supabase
        .from('csv_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error retrieving all CSV data:", error);
      throw error;
    }
  }
};

/**
 * Ensures the csv_data table exists in the database
 */
async function ensureCsvDataTableExists() {
  try {
    // Check if the table exists
    const { error } = await supabase
      .from('csv_data')
      .select('id')
      .limit(1);
    
    // If there's an error because the table doesn't exist, create it
    if (error && error.code === '42P01') { // PostgreSQL error code for undefined_table
      console.log('Creating csv_data table');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('create_csv_data_table');
      
      if (createError) {
        console.error('Error creating table:', createError);
        toast.error('Could not create database table for CSV data');
      }
    }
  } catch (error) {
    console.error('Error checking/creating table:', error);
  }
}

export default csvDataService;
