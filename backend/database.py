import os
from supabase import create_client

# We are skipping load_dotenv() because you aren't using a .env file
# We are putting the strings directly into the variables

SUPABASE_URL = "https://wakzkwlxeeeucrkmyxrc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3prd2x4ZWVldWNya215eHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDUwOTEsImV4cCI6MjA4ODcyMTA5MX0.VdTtthd2jw3DjRIpoMaAampJ9WtteuL1jpAkzqK3WDw"

# Create client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("✅ Supabase client initialized with direct keys!")