
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// These values are safe to expose in the client-side code
const supabaseUrl = 'https://pdxkoovzweeuzfrrpcxp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGtvb3Z6d2VldXpmcnJwY3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NDM5NTIsImV4cCI6MjAyODIxOTk1Mn0.HS0r-fMm-mw47D-sQ2QNPNztb7MFxovKJ_kYDtcpE24'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
