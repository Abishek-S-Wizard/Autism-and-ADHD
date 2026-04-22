import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file.")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

def setup_storage():
    print("Checking 'detection-images' bucket...")
    try:
        # Check if bucket exists
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if "detection-images" not in bucket_names:
            print("Creating 'detection-images' bucket...")
            supabase.storage.create_bucket("detection-images", options={"public": True})
            print("Bucket created successfully (Public: True).")
        else:
            print("Bucket 'detection-images' already exists.")
            
    except Exception as e:
        print(f"Error setting up storage: {e}")

def setup_database():
    print("Ensuring 'detection_results' table exists...")
    print("Please run the following SQL in the Supabase SQL Editor if the table is missing:")
    sql = """
    CREATE TABLE IF NOT EXISTS detection_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT,
        detection_type TEXT NOT NULL, -- 'autism' or 'adhd'
        result TEXT NOT NULL,
        severity TEXT,
        confidence FLOAT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    
    -- Enable RLS (Row Level Security) or make it public for testing
    ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all for now" ON detection_results FOR ALL USING (true) WITH CHECK (true);
    """
    print(sql)

    print("\n--- SQL for 'chatbot_history' Table ---")
    chat_sql = """
    CREATE TABLE IF NOT EXISTS chatbot_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
    
    ALTER TABLE chatbot_history DISABLE ROW LEVEL SECURITY;
    """
    print(chat_sql)

if __name__ == "__main__":
    setup_storage()
    setup_database()
    print("\nSetup complete! If you haven't created the table yet, use the SQL above in your Supabase Dashboard.")
