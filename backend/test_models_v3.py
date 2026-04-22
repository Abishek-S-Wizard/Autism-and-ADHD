import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def test_model(model_name):
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    try:
        print(f"Testing {model_name}...")
        response = client.models.generate_content(
            model=model_name,
            contents="Say hello"
        )
        print(f"Success! Response: {response.text}")
        return True
    except Exception as e:
        print(f"Error with {model_name}: {e}")
        return False

if __name__ == "__main__":
    for m in ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-1.5-pro', 'gemini-pro-latest']:
        if test_model(m):
            print(f"\nFound working model: {m}")
            break
