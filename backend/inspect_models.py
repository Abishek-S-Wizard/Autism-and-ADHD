import os
import tensorflow as tf

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")
ADHD_MODEL_PATH = os.path.join(MODELS_DIR, "adhd_cnn_model.h5")

def inspect_model(name, path):
    print(f"\n--- Inspecting {name} Model ---")
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return

    try:
        model = tf.keras.models.load_model(path)
        print(f"Summary for {name}:")
        model.summary()
        print(f"Input nodes: {model.input_shape}")
        print(f"Output nodes: {model.output_shape}")
        
        # Check final layer activation
        final_layer = model.layers[-1]
        print(f"Final Layer: {final_layer.name}, Activation: {getattr(final_layer, 'activation', 'N/A')}")
    except Exception as e:
        print(f"Error loading model: {e}")

if __name__ == "__main__":
    inspect_model("Autism", AUTISM_MODEL_PATH)
    inspect_model("ADHD", ADHD_MODEL_PATH)
