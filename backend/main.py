from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import auth
import models, schemas, predictions
from database import SessionLocal, engine
from datetime import timedelta
from access_token import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_HOURS
from scan import predict
from pydantic import BaseModel
from qa import get_answers
from typing import Dict
from fastapi.security import OAuth2PasswordRequestForm
import logging
from sqlalchemy import func
from fastapi.responses import StreamingResponse
import matplotlib.pyplot as plt
import io
import os
from recommendation import RecommendationRequest, get_recommendations, fetch_spotify_cover
from context import fixed_context

models.Base.metadata.create_all(bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    allow_origins=["*"]
)

class ContextResponse(BaseModel):
    emotions: Dict[str, str]

class QAPayload(BaseModel):
    question: str

class PredictionCreate(BaseModel):
    prediction: str
    user_id: int

@app.get("/predict-qa")
def predict_qa(question: str):
    answers, probabilities = get_answers(fixed_context, question)
    return {"answers": answers, "probabilities": probabilities}

@app.post("/predict/")
async def get_prediction(file: UploadFile = File(...)):
    return await predict(file)

@app.post('/register/', response_model=schemas.User) 
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    new_user = auth.create_user(db, user)
    return new_user

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = auth.get_user_by_username(db, username=form_data.username)
        if not user or not auth.verify_password(form_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user

@app.post("/predictions/", response_model=schemas.Prediction)
def create_prediction(prediction: schemas.PredictionCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    db_prediction = predictions.create_prediction(db=db, prediction=prediction)
    return db_prediction

@app.get("/emotion_chart/")
def get_emotion_chart(db: Session = Depends(get_db)):
    # Query to get emotion distribution from all predictions
    stats = db.query(models.Prediction.prediction, func.count(models.Prediction.prediction)).group_by(models.Prediction.prediction).all()
    
    # If no data found, respond with HTTP 404
    if not stats:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Extract labels and sizes from the query results
    labels = [item[0] for item in stats]
    sizes = [item[1] for item in stats]
    
    # Calculate the total of all emotions
    total = sum(sizes)
    
    # Define custom colors
    custom_colors = ['#3d2924', '#583a31', '#8b5343', '#a0715c', '#6c1a18', '#c63733', '#cb4440']
    
    # Plot pie chart
    plt.figure(figsize=(8, 8))
    wedges, texts, autotexts = plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=custom_colors[:len(labels)])
    
    # Customize the colors of the percentage text
    for autotext in autotexts:
        autotext.set_color('white')
    
    plt.axis('equal')  # Ensure the pie chart is circular
    plt.title('Emotion Distribution (All Users)')
    
    # Add total respondents info around the pie chart
    plt.text(-1.25, -1.25, f'Total: {total}', fontsize=12)
    
    # Save plot to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    
    # Return image as streaming response
    return StreamingResponse(buf, media_type="image/png")


@app.post("/recommend")
def recommend_songs(request: RecommendationRequest):
    recommendations = get_recommendations(request.emotion, request.popularity)
    recommendations_list = []
    for rec in recommendations:
        cover_url, track_url = fetch_spotify_cover(rec[0], rec[1])
        link_url = f"{track_url}"
        recommendations_list.append({
            "name": rec[0],
            "artist": rec[1],
            "album": rec[2],
            "release_date": rec[3],
            "cover_url": cover_url,
            "link_url": link_url
        })
    return {"recommendations": recommendations_list}
    
if __name__ == "__main__":
    app.run()
    app.run(debug=True,
            host="0.0.0.0",
            port=int(os.environ.get("PORT", 8080)))