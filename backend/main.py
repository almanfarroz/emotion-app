from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from keras.models import load_model
from keras.preprocessing.image import img_to_array
import numpy as np
from PIL import Image
import io

emotion_label_to_text = {
    0: 'anger', 
    1: 'disgust', 
    2: 'fear', 
    3: 'happiness', 
    4: 'sadness', 
    5: 'surprise', 
    6: 'neutral'
}

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model('model/model.h5')

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image = image.convert("L")
    image = image.resize((48, 48))
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0

    prediction = model.predict(image)
    max_index = np.argmax(prediction[0])
    predicted_emotion = emotion_label_to_text[max_index]

    return {"emotion": predicted_emotion}
