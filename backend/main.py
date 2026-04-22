import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
import traceback
import time
from prediction import predict_autism, predict_adhd, predict_screening, analyze_speech_audio

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
model_name = 'gemini-flash-latest' # Changed from gemini-2.0-flash which had quota issues

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

@app.post("/predict/autism")
async def autism_detection(patient_id: str, doctor_id: str = None, file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        # 1. Run Prediction
        prediction_result = predict_autism(image_bytes)
        
        # 2. Upload to Supabase Storage
        file_ext = file.filename.split(".")[-1]
        file_path = f"autism/{uuid.uuid4()}.{file_ext}"
        
        storage_response = supabase.storage.from_("detection-images").upload(
            path=file_path,
            file=image_bytes,
            file_options={"content-type": file.content_type}
        )
        
        image_url = supabase.storage.from_("detection-images").get_public_url(file_path)

        # 3. Store in Database
        db_result = supabase.table("detection_results").insert({
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "detection_type": "autism",
            "result": prediction_result["result"],
            "severity": prediction_result["severity"],
            "confidence": prediction_result["confidence"],
            "image_url": image_url
        }).execute()

        return {
            "result": prediction_result["result"],
            "severity": prediction_result["severity"],
            "confidence": prediction_result["confidence"],
            "db_id": db_result.data[0]["id"] if db_result.data else None
        }
    except Exception as e:
        print(f"Error in Autism Prediction:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/adhd")
async def adhd_detection(patient_id: str, doctor_id: str = None, file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        # 1. Run Prediction
        prediction_result = predict_adhd(image_bytes, filename=file.filename)
        
        # 2. Upload to Supabase Storage
        file_ext = file.filename.split(".")[-1]
        file_path = f"adhd/{uuid.uuid4()}.{file_ext}"
        
        storage_response = supabase.storage.from_("detection-images").upload(
            path=file_path,
            file=image_bytes,
            file_options={"content-type": file.content_type}
        )
        
        image_url = supabase.storage.from_("detection-images").get_public_url(file_path)

        # 3. Store in Database
        db_result = supabase.table("detection_results").insert({
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "detection_type": "adhd",
            "result": prediction_result["result"],
            "severity": prediction_result["severity"],
            "confidence": prediction_result["confidence"],
            "image_url": image_url
        }).execute()

        return {
            "result": prediction_result["result"],
            "severity": prediction_result["severity"],
            "confidence": prediction_result["confidence"],
            "db_id": db_result.data[0]["id"] if db_result.data else None
        }
    except Exception as e:
        print(f"Error in ADHD Prediction:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# 🔥 SCREENING API (NEW)
# ==========================
@app.post("/screening")
async def screening(data: dict):
    try:
        
        result = predict_screening(data)

        # Save to Supabase
        supabase.table("screening_results").insert({
            "patient_id": data.get("patient_id"),
            "answers": data.get("answers"),
            "speech_data": data.get("speechData"),
            "camera_data": data.get("cameraData"),
            "detection_type": result["detection_type"],
            "result": result["result"],
            "severity": result["severity"],
            "confidence": result["confidence"],
            "asd_score": result["asd_score"],
            "adhd_score": result["adhd_score"],
            "secondary": result["secondary"],
            "video_url": data.get("video_url"),
            "audio_url": data.get("audio_url")
        }).execute()

        return result

    except Exception as e:
        print("Screening Error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))        

@app.get("/patients")
async def get_patients(doctor_id: str = None):
    try:
        if doctor_id:
            # 1. Get patient IDs linked to this doctor
            mapping_res = supabase.table("doctor_patient_mappings") \
                .select("patient_id") \
                .eq("doctor_id", doctor_id) \
                .execute()
            
            patient_ids = [m["patient_id"] for m in mapping_res.data]
            
            if not patient_ids:
                return []

            # 2. Fetch those patients
            response = supabase.table("patients") \
                .select("id, patient_name, full_name, email") \
                .in_("id", patient_ids) \
                .execute()
        else:
            response = supabase.table("patients") \
                .select("id, patient_name, full_name, email") \
                .eq("is_approved", True) \
                .execute()
                
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{patient_id}")
async def get_results(patient_id: str):
    try:
        response = supabase.table("detection_results") \
            .select("*") \
            .eq("patient_id", patient_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/screening-results/{patient_id}")
async def get_screening_results(patient_id: str):
    try:
        response = supabase.table("screening_results") \
            .select("*") \
            .eq("patient_id", patient_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# 🔥 AGGREGATED PATIENT SUMMARY
# ==========================
@app.get("/patient-summary/{patient_id}")
async def get_patient_summary(patient_id: str):
    try:
        # 1. Latest Autism Result
        autism_res = supabase.table("detection_results") \
            .select("*") \
            .eq("patient_id", patient_id) \
            .eq("detection_type", "autism") \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        # 2. Latest ADHD Result
        adhd_res = supabase.table("detection_results") \
            .select("*") \
            .eq("patient_id", patient_id) \
            .eq("detection_type", "adhd") \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        # 3. Latest Screening Result
        screening_res = supabase.table("screening_results") \
            .select("*") \
            .eq("patient_id", patient_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        return {
            "autism": autism_res.data[0] if autism_res.data else None,
            "adhd": adhd_res.data[0] if adhd_res.data else None,
            "screening": screening_res.data[0] if screening_res.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# 🔥 DOCTOR REPORTS API
# ==========================
@app.post("/reports")
async def create_report(data: dict):
    try:
        response = supabase.table("doctor_reports").insert({
            "patient_id": data.get("patient_id"),
            "doctor_id": data.get("doctor_id"),
            "diagnosis": data.get("diagnosis"),
            "summary": data.get("summary"),
            "doctor_notes": data.get("doctor_notes"),
            "autism_data": data.get("autism_data"),
            "adhd_data": data.get("adhd_data"),
            "screening_data": data.get("screening_data")
        }).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/patient/{patient_id}")
async def get_patient_reports(patient_id: str):
    try:
        # Optimized with joined select - requires relationship in Supabase
        # Fallback to simple select if join fails
        try:
            response = supabase.table("doctor_reports") \
                .select("*, doctor:doctors(full_name)") \
                .eq("patient_id", patient_id) \
                .order("created_at", desc=True) \
                .execute()
            return response.data
        except:
            # Fallback for systems where relationships aren't manually set
            response = supabase.table("doctor_reports") \
                .select("*") \
                .eq("patient_id", patient_id) \
                .order("created_at", desc=True) \
                .execute()
            return response.data
            
    except Exception as e:
        print(f"Report Fetch API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/doctor/{doctor_id}")
async def get_doctor_reports(doctor_id: str):
    try:
        response = supabase.table("doctor_reports") \
            .select("*, patient:patients(full_name)") \
            .eq("doctor_id", doctor_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/analyze-speech")
async def analyze_speech(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()

        result = analyze_speech_audio(audio_bytes)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))               

# Role Prompts
PATIENT_PROMPT = """
You are an AI assistant inside a medical platform that helps with Autism and ADHD awareness.
Your audience is patients and caregivers.
Your goals:
• Explain Autism and ADHD in simple language
• Provide awareness and educational information
• Explain screening results in easy terms
• Suggest when to consult a doctor
• Provide supportive and non-diagnostic guidance

Rules:
1. Use simple language suitable for non-medical users.
2. Keep answers concise but informative (3-6 sentences).
3. Never give a final medical diagnosis.
4. Encourage consulting a clinician when needed.
5. If asked about treatment, provide general guidance only.
"""

DOCTOR_PROMPT = """
You are an AI assistant for clinicians in an Autism and ADHD detection system.
Your audience is doctors and clinicians.
Responsibilities:
• Explain screening results
• Provide clinical explanations of Autism and ADHD
• Summarize patient data if provided
• Provide educational resources

Response format rules:
If the doctor asks for:
TEXT -> Provide a clear textual explanation.
VIDEO -> Provide 2–3 educational video links from trusted sources.
ARTICLES -> Provide article links from trusted medical websites.

Trusted sources include: WHO, CDC, NIH, PubMed, NHS, reputable medical education channels.
Keep answers professional and medically accurate. Do not provide unsafe treatment advice.
Provide detailed clinical information when requested.
"""

RESEARCHER_PROMPT = """
You are an AI assistant for researchers studying Autism and ADHD.
Your audience is academic researchers and data scientists.
Responsibilities:
• Provide research explanations
• Share datasets
• Provide links to research papers
• Provide information about machine learning models used in diagnosis

If the user asks about:
DATASETS -> Provide links to publicly available datasets (e.g., ABIDE, ADHD-200, OpenNeuro).
RESEARCH PAPERS -> Provide links from Google Scholar, PubMed, or arXiv.
AI MODELS -> Explain model architectures such as CNN, MRI analysis models, or classification techniques.

Always include links to trusted academic sources. Keep responses technical and highly detailed.
Provide full summaries of research papers or clinical details when asked.
"""

class ChatRequest(BaseModel):
    user_id: str
    role: str
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Detect Role-based prompt
        if request.role == "patient":
            system_prompt = PATIENT_PROMPT
        elif request.role == "doctor":
            system_prompt = DOCTOR_PROMPT
        elif request.role == "researcher":
            system_prompt = RESEARCHER_PROMPT
        else:
            system_prompt = "You are a helpful assistant."

        # 2. Fetch History from Supabase (last 5 messages for context)
        history_response = supabase.table("chatbot_history") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(3) \
            .execute()
        
        history_text = ""
        if history_response.data:
            # Reverse to get chronological order
            history_data = list(reversed(history_response.data))
            for h in history_data:
                history_text += f"User: {h['message']}\nAI: {h['response']}\n"

        # 3. Construct Final Prompt
        full_prompt = f"""
{system_prompt}

Previous conversation:
{history_text}

Current question:
User: {request.message}
"""

        # 4. Call Gemini with Retries
        bot_response = "I'm sorry, I'm a bit overwhelmed right now. Please try again in a moment."
        
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                    config={
                        'temperature': 0.4,
                        'max_output_tokens': 4096,
                    }
                )
                bot_response = response.text
                break
            except Exception as e:
                error_msg = str(e)
                if ("429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg) and attempt < 2:
                    wait_time = (attempt + 1) * 2 # 2s, 4s wait
                    print(f"Rate limited. Retrying in {wait_time}s... (Attempt {attempt + 1}/3)")
                    time.sleep(wait_time)
                    continue
                else:
                    raise e

        # 5. Store in Supabase
        supabase.table("chatbot_history").insert({
            "user_id": request.user_id,
            "role": request.role,
            "message": request.message,
            "response": bot_response
        }).execute()

        return {"response": bot_response}

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {"response": "I'm a bit overwhelmed right now! I've reached my free tier limit. Please wait about a minute before asking me another question. 🧠☕"}
        
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
async def get_history(user_id: str):
    try:
        response = supabase.table("chatbot_history") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=False) \
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
