from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import auth
import models, schemas
from database import SessionLocal, engine
from access_token import create_access_token, decode_access_token

# Import endpoint from scan.py
from scan import predict
# from qa import predict_qa, QAInput

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
# @app.post("/predict-qa/")
# def predict_qa_endpoint(qa_input: QAInput):
#     result = predict_qa(qa_input)  # Memanggil fungsi predict_qa dari qa.py dengan qa_input sebagai argumen
#     return result

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