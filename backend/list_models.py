import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def list_models():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    try:
        print("Available models:")
        for m in client.models.list():
            print(f" - {m.name} ({m.supported_actions})")
        
        # Test a simple prompt with gemini-2.0-flash
        print("\nTesting gemini-2.0-flash...")
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents="Say hello"
        )
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error during listing/testing: {e}")

if __name__ == "__main__":
    list_models()
