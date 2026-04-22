import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key exists: {bool(api_key)}")
if api_key:
    # Print first and last characters for verification
    print(f"Key preview: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

model_name = 'gemini-1.5-flash' # Testing default first
print(f"Testing model: {model_name}")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello")
    print("Success with gemini-1.5-flash!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Failed with gemini-1.5-flash: {e}")
    
    print("\nTrying gemini-1.5-flash-latest...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content("Hello")
        print("Success with gemini-1.5-flash-latest!")
    except Exception as e2:
        print(f"Failed with gemini-1.5-flash-latest: {e2}")

print("\nFinal list of available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e3:
    print(f"Failed to list models: {e3}")
