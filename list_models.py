import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    models = genai.list_models()
    for m in models:
        print(f"Name: {m.name}")
except Exception as e:
    print(f"Error: {e}")
