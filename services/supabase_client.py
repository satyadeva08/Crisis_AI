import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

supabase_init_error = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not found in environment variables.")
    supabase_init_error = "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment variables."
    supabase: Client = None
else:
    try:
        # Strip any accidental spaces or quotes the user might have pasted
        clean_url = SUPABASE_URL.strip().strip("'").strip('"')
        clean_key = SUPABASE_KEY.strip().strip("'").strip('"')
        
        supabase: Client = create_client(clean_url, clean_key)
        print("Supabase connected successfully")
    except Exception as e:
        print("ERROR initializing Supabase:")
        print(str(e))
        supabase_init_error = f"Failed to connect to Supabase: {str(e)}"
        supabase: Client = None
