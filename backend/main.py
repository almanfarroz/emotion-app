from fastapi import Depends, FastAPI, HTTPException, Form
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import auth
import models, schemas
from database import SessionLocal, engine
from access_token import create_access_token, decode_access_token
from scan import predict
from pydantic import BaseModel
from qa import get_answers
from typing import List, Dict, Any

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

class QAPayload(BaseModel):
    context: str
    question: str

@app.post("/predict-qa")
def predict(payload: QAPayload):
    answers, probabilities = get_answers(payload.context, payload.question)
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

@app.post('/login', response_model=schemas.User)
async def login_user(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.login_user(db, user_login.username, user_login.password)
    return user