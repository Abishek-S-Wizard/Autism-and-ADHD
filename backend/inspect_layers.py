import os
import tensorflow as tf

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")

def inspect_first_layers():
    if not os.path.exists(AUTISM_MODEL_PATH):
        return
    
    model = tf.keras.models.load_model(AUTISM_MODEL_PATH)
    print("--- First 15 Layers ---")
    for i, layer in enumerate(model.layers[:15]):
        print(f"{i}: {layer.name} ({layer.__class__.__name__})")
        if hasattr(layer, 'input_shape'):
            print(f"   Input shape: {layer.input_shape}")

if __name__ == "__main__":
    inspect_first_layers()
