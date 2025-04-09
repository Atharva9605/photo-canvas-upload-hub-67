
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// These values are safe to expose in the client-side code
const supabaseUrl = 'https://pdxkoovzweeuzfrrpcxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGtvb3Z6d2VldXpmcnJwY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDMwNTksImV4cCI6MjA1OTY3OTA1OX0.5SiSPzVd_-sHd0MkMhPwPduNO1vAYqxgzAIriRHXdNs'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
