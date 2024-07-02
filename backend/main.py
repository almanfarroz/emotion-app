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
import seaborn as sns
import io
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

emotions_contexts = {
    "angry": "Start by giving yourself enough quiet and time to remember about yourself what feels steady and consistent in your nature and interactions with others.Give yourself the freedom to your interest in having interests.  Are you motivated because of competing with others or because an activity itself feels satisfying?If you are able to develop a sense of defining yourself without fear of judging yourself, you will start coming close to knowing who you are.",
    "happy": "Anger is not necessarily a bad thing. If you are angry and you can talk about your feelings, that would be very helpful. Anger usually comes along with something else, like feeling sad, worried, overwhelmed, confused, and many others. Consider looking at what you notice in addition to anger and you may have a different starting point. If you get along well with friends and don't get angry with them, look at the differences. Do you feel criticized by your parents or family? Misunderstood? There could be any number of things.I wonder if you start getting angry very slowly and it builds or if it happens quickly. Try to keep an eye on the patterns and see if you can stop and look at what else is going on as you start to get angry. Anger is a real emotion in itself. It almost always connects to something else as well.",
    "sad": "Allow yourself to feel the sadness and understand its source. Talk to someone you trust about your feelings, and engage in self-care activities that help soothe and comfort you.",
    # Add more emotions and contexts as needed
}

class ContextResponse(BaseModel):
    emotions: Dict[str, str]

class QAPayload(BaseModel):
    context: str
    question: str

class PredictionCreate(BaseModel):
    prediction: str
    user_id: int

@app.post("/predict-qa")
def predictqa(payload: QAPayload):
    answers, probabilities = get_answers(payload.context, payload.question)
    return {"answers": answers, "probabilities": probabilities}

@app.get("/contexts", response_model=ContextResponse)
def get_contexts():
    return {"emotions": emotions_contexts}

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
def create_prediction(prediction: schemas.PredictionCreate, db: Session = Depends(get_db)):
    db_prediction = predictions.create_prediction(db=db, prediction=prediction)
    return db_prediction

@app.get("/emotion_chart/")
def get_emotion_chart(db: Session = Depends(get_db)):
    stats = db.query(models.Prediction.prediction, func.count(models.Prediction.prediction)).group_by(models.Prediction.prediction).all()
    labels = [item[0] for item in stats]
    sizes = [item[1] for item in stats]

    plt.figure(figsize=(8, 8))
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=sns.color_palette("hsv", len(labels)))
    plt.axis('equal')
    plt.title('Emotion Distribution (All Users)')

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")