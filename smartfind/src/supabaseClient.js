import { createClient } from '@supabase/supabase-js'

// Use the same keys we used for the Python backend
const supabaseUrl = "https://wakzkwlxeeeucrkmyxrc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3prd2x4ZWVldWNya215eHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDUwOTEsImV4cCI6MjA4ODcyMTA5MX0.VdTtthd2jw3DjRIpoMaAampJ9WtteuL1jpAkzqK3WDw"

export const supabase = createClient(supabaseUrl, supabaseKey)