import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not found in .env")
        return

    print(f"Testing with API Key: {api_key[:5]}...{api_key[-5:]}")
    client = genai.Client(api_key=api_key)
    model_name = 'gemini-1.5-flash-latest' # Try a known good model name
    
    try:
        print(f"Calling Gemini ({model_name})...")
        response = client.models.generate_content(
            model=model_name,
            contents="Hello, this is a test from the ASD & ADHD app. Are you there?",
        )
        print("Response received:")
        print(response.text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")

if __name__ == "__main__":
    test_gemini()
