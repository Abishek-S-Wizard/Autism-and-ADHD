import os
import numpy as np
import tensorflow as tf

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")

def test_preprocessing_variations():
    if not os.path.exists(AUTISM_MODEL_PATH):
        print("Model not found")
        return

    print("Loading Autism model...")
    model = tf.keras.models.load_model(AUTISM_MODEL_PATH)
    
    # Create sample inputs
    shapes = (1, 224, 224, 3)
    random_data = np.random.randint(0, 256, shapes).astype(np.float32)
    
    variations = {
        "Zeros": np.zeros(shapes),
        "Ones": np.ones(shapes),
        "Random [0, 255]": random_data,
        "All 128": np.full(shapes, 128.0),
        "Half Size": np.random.rand(1, 150, 150, 3) # Test if it auto-resizes or errors
    }

    print("\n--- Testing Autism Model Outputs ---")
    for name, data in variations.items():
        try:
            pred = model.predict(data, verbose=0)
            val = float(pred[0][0])
            print(f"{name:15}: Output Value = {val:.6f} ({val*100:.2f}%)")
        except Exception as e:
            print(f"{name:15}: Error = {e}")
            
    print("\n--- Checking for Rescaling Layers ---")
    for layer in model.layers:
        if 'rescale' in layer.name.lower():
            print(f"Found Rescaling Layer: {layer.name}, Config: {layer.get_config()}")

if __name__ == "__main__":
    test_preprocessing_variations()
