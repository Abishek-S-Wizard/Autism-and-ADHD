import os
import numpy as np
import tensorflow as tf
from PIL import Image
import io

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")

def test_scaling_methods():
    if not os.path.exists(AUTISM_MODEL_PATH):
        print(f"Error: Model not found at {AUTISM_MODEL_PATH}")
        return

    print(f"Loading Model: {AUTISM_MODEL_PATH}")
    model = tf.keras.models.load_model(AUTISM_MODEL_PATH)
    
    # Create a synthetic "neutral" image (gray)
    neutral_img = np.ones((224, 224, 3), dtype=np.uint8) * 128
    
    methods = [
        ("0-255 (Raw)", lambda x: x.astype('float32')),
        ("0-1 Scaling", lambda x: x.astype('float32') / 255.0),
        ("-1 to 1 Scaling", lambda x: (x.astype('float32') / 127.5) - 1.0),
        ("ImageNet Mean Subtraction (BGR)", None)
    ]
    
    print("\n--- Testing Preprocessing Methods on Neutral Gray Image ---")
    for name, func in methods:
        if name == "ImageNet Mean Subtraction (BGR)":
            # BGR
            x = neutral_img[..., ::-1].astype('float32')
            # Mean subtraction
            x[..., 0] -= 103.939
            x[..., 1] -= 116.779
            x[..., 2] -= 123.68
            img_input = np.expand_dims(x, axis=0)
        else:
            img_input = np.expand_dims(func(neutral_img), axis=0)
            
        pred = model.predict(img_input, verbose=0)
        val = float(pred[0][0])
        print(f"{name:30}: Raw Output = {val:.6f}")

    # Test with Zeroes and Ones for 0-1 scaling specifically
    print("\n--- Testing 0-1 Scaling extremes ---")
    zero_img = np.zeros((1, 224, 224, 3), dtype=np.float32)
    one_img = np.ones((1, 224, 224, 3), dtype=np.float32)
    
    pred_zero = model.predict(zero_img, verbose=0)
    pred_one = model.predict(one_img, verbose=0)
    print(f"Zeros (0.0) : {float(pred_zero[0][0]):.6f}")
    print(f"Ones  (1.0) : {float(pred_one[0][0]):.6f}")

if __name__ == "__main__":
    test_scaling_methods()
