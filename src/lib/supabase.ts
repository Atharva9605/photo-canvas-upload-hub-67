
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// These values are safe to expose in the client-side code
const supabaseUrl = 'https://pdxkoovzweeuzfrrpcxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGtvb3Z6d2VldXpmcnJwY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDMwNTksImV4cCI6MjA1OTY3OTA1OX0.5SiSPzVd_-sHd0MkMhPwPduNO1vAYqxgzAIriRHXdNs'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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
