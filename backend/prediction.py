import os
import numpy as np
from PIL import Image
import io
import tempfile
import nibabel as nib
from model_loader import model_loader
import whisper
import tempfile

whisper_model = whisper.load_model("base")  # small & fast


def analyze_speech_audio(audio_bytes):
    try:
        # Save temp audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
            f.write(audio_bytes)
            temp_path = f.name

        result = whisper_model.transcribe(temp_path)

        text = result["text"]

        words = len(text.split())
        duration = result.get("segments", [{}])[-1].get("end", 1)

        speech_rate = words / duration if duration > 0 else 0

        return {
            "text": text,
            "word_count": words,
            "speech_rate": speech_rate,
            "confidence": 0.9  # approximate
        }

    except Exception as e:
        return {"error": str(e)}

def preprocess_image(image_bytes, target_size=(224, 224), filename=None, channels=3):
    """Preprocess image for the model, supporting standard images and NIfTI volumes."""
    try:
        # Check if it's likely a NIfTI file (magic numbers or extension)
        # NIfTI-1 files usually start with the size of the header (348 bytes)
        is_nifti = (filename and filename.lower().endswith(('.nii', '.nii.gz'))) or \
                   (len(image_bytes) > 4 and image_bytes[0:4] == b'\x5c\x01\x00\x00')

        if is_nifti:
            # Handle NIfTI via temp file since nibabel needs a path or file object
            with tempfile.NamedTemporaryFile(suffix='.nii', delete=False) as tf:
                tf.write(image_bytes)
                temp_path = tf.name
            
            try:
                img_nifti = nib.load(temp_path)
                data = img_nifti.get_fdata()
                
                # Extract middle slice (axial)
                slice_idx = data.shape[2] // 2
                slice_data = data[:, :, slice_idx]
                
                # Normalize slice to 0-255
                slice_data = ((slice_data - np.min(slice_data)) / (np.max(slice_data) - np.min(slice_data) + 1e-8) * 255).astype(np.uint8)
                img = Image.fromarray(slice_data)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        else:
            img = Image.open(io.BytesIO(image_bytes))

        if channels == 1:
            img = img.convert("L")
        elif img.mode != "RGB":
            img = img.convert("RGB")
            
        img = img.resize(target_size)
        img_array = np.array(img).astype(np.float32)
        
        if channels == 1:
            img_array = img_array / 255.0 # Simple normalization for ADHD
            img_array = np.expand_dims(img_array, axis=-1)
        else:
            # Autism model (EfficientNetB0) owns its preprocessing layers:
            # - Rescaling (1/255)
            # - Normalization (ImageNet means)
            # - Rescaling (Variance adjustment)
            # We simply provide raw RGB [0, 255] pixels.
            pass
            
        print(f"DEBUG: Input shape: {img_array.shape}, Mean: {np.mean(img_array):.2f}, Max: {np.max(img_array):.2f}")
        
        img_array = np.expand_dims(img_array, axis=0) # Add batch dim (1, H, W, C)
        return img_array
    except Exception as e:
        # Check if it might be a DICOM file
        if image_bytes.startswith(b'\x00' * 128 + b'DICM'):
             raise ValueError("DICOM file detected. Please convert MRI scan to JPG/PNG or install pydicom for direct support.")
        raise ValueError(f"Unsupported or corrupted image format: {str(e)}")

def calculate_severity(confidence, model_type):
    """Simple severity calculation logic."""
    if confidence < 0.6:
        return "Mild"
    elif confidence < 0.8:
        return "Moderate"
    else:
        return "Severe"

def predict_autism(image_bytes):
    if model_loader.autism_model is None:
        return {"error": "Autism model not loaded"}
    
    # Preprocess
    img_array = preprocess_image(image_bytes, target_size=(224, 224))
    
    # Predict
    prediction = model_loader.autism_model.predict(img_array)
    raw_val = float(prediction[0][0])
    
    # Based on calibration of the NEW facemodel: 
    # Logic is standard: Output near 1 = Autism, Output near 0 = Normal
    confidence_autism = raw_val
    
    result = "Autism" if confidence_autism > 0.5 else "Normal"
    severity = calculate_severity(confidence_autism, "autism") if result == "Autism" else "N/A"
    
    return {
        "result": result,
        "severity": severity,
        "confidence": confidence_autism,
        "raw_model_output": raw_val
    }

def predict_adhd(image_bytes, filename=None):
    if model_loader.adhd_model is None:
        return {"error": "ADHD model not loaded"}
    
    # ADHD model expects grayscale (1 channel) and 128x128 resolution
    # Calculation: 128x128 -> (conv/pool) -> 30x30x64 = 57600 features (Matches error)
    img_array = preprocess_image(image_bytes, target_size=(128, 128), filename=filename, channels=1)
    
    # Predict
    prediction = model_loader.adhd_model.predict(img_array)
    confidence = float(prediction[0][0])
    
    result = "ADHD" if confidence > 0.5 else "Normal"
    severity = calculate_severity(confidence, "adhd") if result == "ADHD" else "N/A"
    
    return {
        "result": result,
        "severity": severity,
        "confidence": confidence
    }

# ===========================
# 🔥 SCREENING MODULE (NEW)
# ===========================

def predict_screening(data):
    """
    Improved Multimodal screening (Camera + Speech + Questionnaire)
    Normalized + Stable logic (NO API change)
    """

    answers = data.get("answers", [])
    speech = data.get("speechData", {})
    camera = data.get("cameraData", {})

    # 🧾 Answer scoring map
    score_map = {
        "Never": 0,
        "Rarely": 1,
        "Sometimes": 2,
        "Frequently": 3,
        "Very easily": 3,
        "Somewhat easily": 2,
        "Almost never": 0
    }

    asd = 0
    adhd = 0
    max_asd = 0
    max_adhd = 0

    # ======================
    # 🧾 QUESTIONNAIRE
    # ======================
    for q in answers:
        score = score_map.get(q.get("answer"), 0)

        if q.get("type") == "asd":
            asd += score
            max_asd += 3
        elif q.get("type") == "adhd":
            adhd += score
            max_adhd += 3

    # ======================
    # 🎤 SPEECH ANALYSIS
    # ======================
    text = speech.get("text", "")
    words = len(text.split())

    delay = speech.get("delay", 0)
    rate = speech.get("rate", 0)
    pauses = speech.get("pause_count", 0)

    speech_available = bool(text.strip())

    if speech_available:
        # ASD indicators
        if words < 5:
            asd += 2
        elif words < 10:
            asd += 1

        if delay > 5:
            asd += 1

        if pauses > 4:
            asd += 1

        # ADHD indicators
        if rate > 160:
            adhd += 2
        elif rate > 120:
            adhd += 1

        if pauses > 6:
            adhd += 1

    # ======================
    # 🎥 CAMERA ANALYSIS
    # ======================
    eye_contact = camera.get("eye_contact_ratio", 1)
    blink_rate = camera.get("blink_rate", 10)
    head_movement = camera.get("head_movement", 0)
    face_stability = camera.get("face_stability", 1)
    face_detected = camera.get("face_detected", True)

    # ASD indicators
    if not face_detected:
        asd += 2

    if eye_contact < 0.4:
        asd += 2
    elif eye_contact < 0.6:
        asd += 1

    if blink_rate < 5:
        asd += 1

    # ADHD indicators
    if head_movement > 4:
        adhd += 2
    elif head_movement > 2:
        adhd += 1

    if face_stability < 0.5:
        adhd += 1

    # ======================
    # 📊 NORMALIZATION
    # ======================
    asd_norm = asd / max(max_asd, 1)
    adhd_norm = adhd / max(max_adhd, 1)

    # ======================
    # 🎯 FINAL DECISION
    # ======================
    result = "Normal"
    severity = "Low"
    secondary = None

    if asd_norm > 0.65:
        result = "Autism"
        severity = "High"
        if adhd_norm > 0.4:
            secondary = "ADHD traits"

    elif adhd_norm > 0.65:
        result = "ADHD"
        severity = "High"
        if asd_norm > 0.4:
            secondary = "Autism traits"

    elif asd_norm > 0.4:
        result = "Mild Autism Traits"
        severity = "Moderate"

    elif adhd_norm > 0.4:
        result = "Mild ADHD Traits"
        severity = "Moderate"

    # ======================
    # 🤖 CONFIDENCE
    # ======================
    score_sum = 0
    modalities = 0

    # Questionnaire
    score_sum += (asd_norm + adhd_norm) / 2
    modalities += 1

    # Camera
    if camera:
        score_sum += eye_contact
        modalities += 1

    # Speech
    if speech_available:
        score_sum += min(rate / 200, 1)
        modalities += 1

    confidence = score_sum / modalities if modalities > 0 else 0

    return {
        "detection_type": result.lower(),
        "asd_score": round(asd, 2),  
        "adhd_score": round(adhd, 2), 
        "result": result,
        "severity": severity,
        "secondary": secondary,
        "confidence": round(confidence, 2)
    }