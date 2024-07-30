from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = FastAPI()

# Load the model with custom objects
model = load_model('model/inimodelpk.h5', compile=False)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Function to convert label to emotion text
def label_to_text(label):
    emotion_label_to_text = {0: 'Angry', 1: 'Disgust', 2: 'Fear', 3: 'Happy', 4: 'Neutral', 5: 'Sad', 6: 'Surprise'}
    return emotion_label_to_text[label]

async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.fromstring(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
    
    emotions = []

    # Process each face detected
    for (x, y, w, h) in faces:
        # Extract the face ROI
        face = img[y:y+h, x:x+w]
        
        # Preprocess the face for your model
        face = cv2.resize(face, (48, 48)) # Resize to the input size of your model
        face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB) # Convert color to RGB
        face = np.expand_dims(face, axis=0) # Expand dimensions to match the model input
        face = preprocess_input(face) # Preprocess the image as required by the model

        # Make prediction
        predictions = model.predict(face)
        predicted_label = label_to_text(np.argmax(predictions))
        emotions.append(predicted_label)

        # Draw rectangle and label on the face
        cv2.putText(img, predicted_label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)

    # Return the predicted emotion for the first face detected
    if emotions:
        return {"emotion": emotions[0]}
    else:
        return {"emotion": "Turn your face towards the camera"}


