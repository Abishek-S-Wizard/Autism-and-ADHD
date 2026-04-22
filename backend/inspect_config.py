import os
import tensorflow as tf

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")

def inspect_layer_configs():
    if not os.path.exists(AUTISM_MODEL_PATH):
        return
    
    model = tf.keras.models.load_model(AUTISM_MODEL_PATH)
    print("--- Layer Configuration ---")
    for i in [1, 2, 3]:
        layer = model.layers[i]
        print(f"Layer {i}: {layer.name}")
        config = layer.get_config()
        for k, v in config.items():
            print(f"   {k}: {v}")
            
        if hasattr(layer, 'mean'):
            print(f"   mean: {layer.mean.numpy().mean()} (avg)")
        if hasattr(layer, 'variance'):
            print(f"   variance: {layer.variance.numpy().mean()} (avg)")

if __name__ == "__main__":
    inspect_layer_configs()
