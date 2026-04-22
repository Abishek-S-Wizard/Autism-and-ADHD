import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def test_api():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"Testing with key: {api_key[:10]}...")
    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash', # Try 1.5 first as a baseline
            contents="Say hello"
        )
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
