import os
import tensorflow as tf
from tensorflow import keras

# Define model paths
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Trained Model")
AUTISM_MODEL_PATH = os.path.join(MODELS_DIR, "asd_facemodel_detection.keras")
ADHD_MODEL_PATH = os.path.join(MODELS_DIR, "adhd_cnn_model.h5")

class ModelLoader:
    def __init__(self):
        self.autism_model = None
        self.adhd_model = None
        self.load_models()

    def load_models(self):
        print("Loading Autism model from:", AUTISM_MODEL_PATH)
        try:
            self.autism_model = tf.keras.models.load_model(AUTISM_MODEL_PATH)
            print("Autism model loaded successfully.")
        except Exception as e:
            print(f"Error loading Autism model: {e}")

        print("Loading ADHD model from:", ADHD_MODEL_PATH)
        try:
            self.adhd_model = tf.keras.models.load_model(ADHD_MODEL_PATH)
            print("ADHD model loaded successfully.")
        except Exception as e:
            print(f"Error loading ADHD model: {e}")

# Global instance
model_loader = ModelLoader()
