
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// These values are safe to expose in the client-side code
const supabaseUrl = 'https://pdxkoovzweeuzfrrpcxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGtvb3Z6d2VldXpmcnJwY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDMwNTksImV4cCI6MjA1OTY3OTA1OX0.5SiSPzVd_-sHd0MkMhPwPduNO1vAYqxgzAIriRHXdNs'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const userFilesBucket = buckets?.find(bucket => bucket.name === 'user_files');
    
    if (!userFilesBucket) {
      console.log('Creating user_files bucket');
      const { error } = await supabase.storage.createBucket('user_files', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Successfully created user_files bucket');
        
        // Policy creation should be done through SQL, not client API
        // Removed the createPolicy call as it's not available in the client API
        console.log('Please note: You may need to set up bucket policies through the Supabase dashboard');
      }
    }
  } catch (err) {
    console.error('Failed to initialize storage:', err);
  }
};

// Call this function when the app initializes
initializeStorage().catch(err => console.error('Failed to initialize storage:', err));

// Custom type for user_uploads table to handle type safety
export type UserUpload = {
  id: string;
  user_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
  updated_at: string;
  url?: string; // For signed URLs
}
