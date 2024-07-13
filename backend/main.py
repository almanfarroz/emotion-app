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

fixed_context = "Mental health is a state of well-being in which an individual realizes their own abilities, can cope with normal stresses of life, can work productively, and is able to make a contribution to their community, You can maintain mental health by practicing self-care, staying connected with loved ones, seeking professional help when needed, and maintaining a healthy lifestyle, Signs of a mental health disorder can include changes in mood, behavior, or thinking patterns, withdrawal from social activities, and difficulty functioning in daily life, Detecting depression in yourself can involve noticing persistent feelings of sadness, loss of interest in activities, changes in appetite or sleep patterns, and difficulty concentrating, Normal anxiety is a temporary response to stress, whereas an anxiety disorder involves persistent and excessive worry that interferes with daily activities, Bipolar disorder is a mental health condition characterized by extreme mood swings, including episodes of mania and depression, You can help a friend with mental health issues by listening to them, offering support, encouraging them to seek professional help, and being patient, Factors that can influence mental health include genetics, environment, lifestyle, and life experiences, Managing stress involves techniques such as exercise, relaxation methods, time management, and seeking support from others, PTSD is a mental health condition triggered by experiencing or witnessing a traumatic event, Coping with panic attacks can involve deep breathing exercises, grounding techniques, and seeking therapy if needed, Obsessive-compulsive disorder is a mental health condition characterized by unwanted repetitive thoughts (obsessions) and behaviors (compulsions), You can seek professional help for mental health issues by talking to a doctor, therapist, or counselor, Cognitive-behavioral therapy is a type of talk therapy that helps individuals identify and change negative thought patterns and behaviors, Antidepressant medications work by balancing chemicals in the brain that affect mood and emotions, Schizophrenia is a chronic mental health disorder that affects a person's thinking, feeling, and behavior, Balancing work and personal life involves setting boundaries, prioritizing self-care, and seeking support from employers and loved ones, Bullying can lead to long-term mental health issues such as anxiety, depression, and low self-esteem, Managing insomnia related to anxiety can involve creating a bedtime routine, reducing caffeine intake, and seeking therapy, Self-care in mental health involves activities that promote well-being and reduce stress, such as exercise, hobbies, and relaxation techniques, Supporting a family member with a mental health disorder involves being understanding, encouraging them to seek help, and being there for them, Eating disorders are mental health conditions characterized by unhealthy eating habits that negatively affect physical and mental health, Coping with loneliness involves staying connected with others, engaging in activities you enjoy, and seeking support if needed, A psychologist is a professional who studies mental processes and behavior and provides therapy, while a psychiatrist is a medical doctor who can prescribe medication and provide therapy, Combating stigma involves educating others, sharing personal experiences, and advocating for mental health awareness, Mindfulness is the practice of being present and fully engaged in the current moment, Meditation can help with mental health by reducing stress, improving focus, and promoting relaxation, Personality disorders are mental health conditions characterized by unhealthy patterns of thinking, feeling, and behaving, Managing social anxiety involves exposure to social situations, practicing relaxation techniques, and seeking therapy, Childhood trauma can have long-term effects on mental health, including increased risk of depression, anxiety, and PTSD, Identifying burnout involves recognizing signs such as chronic fatigue, irritability, and loss of interest in work or activities, Seasonal affective disorder is a type of depression that occurs at certain times of the year, usually in winter, Communicating with someone in a mental health crisis involves staying calm, listening without judgment, and encouraging them to seek help, If you feel no one can help, consider reaching out to a mental health professional or crisis hotline, Dealing with excessive guilt involves recognizing and challenging negative thoughts, seeking therapy, and practicing self-compassion, Dissociative disorders are mental health conditions that involve disruptions in memory, identity, or consciousness, Maintaining mental health during a pandemic involves staying connected, practicing self-care, and seeking support if needed, Social media can impact mental health by contributing to feelings of inadequacy, anxiety, and depression, Coping with hopelessness involves seeking therapy, staying connected with loved ones, and engaging in activities that bring joy, Sleep disorders involve problems with the quality, timing, and amount of sleep, and can be addressed through lifestyle changes, therapy, and medication, Overcoming fear of failure involves setting realistic goals, practicing self-compassion, and seeking support from others, Exposure therapy is a type of therapy that helps individuals confront and reduce their fears through gradual exposure to the feared object or situation, Caring for children's mental health involves providing a supportive environment, encouraging open communication, and seeking professional help if needed, Generalized anxiety disorder involves excessive and persistent worry about various aspects of life, Managing excessive anger involves recognizing triggers, practicing relaxation techniques, and seeking therapy, Conversion disorder involves neurological symptoms that are not explained by medical conditions but are related to psychological factors, Maintaining mental health at work involves setting boundaries, practicing self-care, and seeking support from colleagues and employers, Acute stress disorder is a short-term condition that occurs after experiencing a traumatic event, Managing recurrent negative thoughts involves identifying and challenging negative thought patterns, and practicing mindfulness and cognitive-behavioral techniques, Substance abuse can negatively impact mental health by increasing the risk of mental health disorders and impairing cognitive function, Coping with chronic anxiety involves seeking therapy, practicing relaxation techniques, and making lifestyle changes, Group therapy involves a therapist working with multiple individuals at the same time, providing support and feedback, Dealing with feelings of inadequacy involves recognizing and challenging negative thoughts, seeking therapy, and practicing self-compassion, Adjustment disorder involves emotional or behavioral symptoms in response to a stressful event, Maintaining mental health during pregnancy involves seeking support, practicing self-care, and communicating with healthcare providers, Art therapy involves using creative processes to improve mental health and well-being, Supporting the mental health of teenagers involves open communication, providing a supportive environment, and seeking professional help if needed, Domestic violence can lead to long-term mental health issues such as anxiety, depression, and PTSD, Dealing with fear of the future involves setting realistic goals, seeking support from others, and practicing mindfulness, Somatoform disorders involve physical symptoms that are not explained by medical conditions but are related to psychological factors, Managing difficult emotions involves recognizing and validating feelings, practicing relaxation techniques, and seeking therapy, Borderline personality disorder is a mental health condition characterized by unstable moods, behavior, and relationships, Maintaining mental health after losing a loved one involves seeking support from others, allowing yourself to grieve, and seeking therapy if needed, Specific phobia involves an intense fear of a particular object or situation, Coping with anxiety before exams or presentations involves preparation, relaxation techniques, and positive self-talk, Long-term stress can lead to mental health issues such as anxiety, depression, and burnout, Dealing with excessive jealousy or envy involves recognizing and challenging negative thoughts, practicing gratitude, and seeking therapy, Psychosomatic disorders involve physical symptoms that are influenced by mental or emotional factors, Maintaining mental health when facing major life changes involves seeking support, practicing self-care, and being open to new experiences, Narcissistic personality disorder is characterized by a need for admiration and a lack of empathy for others, Coping with feelings of guilt after making a mistake involves recognizing and challenging negative thoughts, seeking forgiveness, and practicing self-compassion, Schizoid personality disorder is characterized by a lack of interest in social relationships and a limited range of emotional expression, Maintaining mental health while caring for elderly or sick people involves seeking support, practicing self-care, and setting boundaries, Postpartum anxiety disorder involves excessive worry and fear after giving birth, Coping with feelings of isolation involves staying connected with others, engaging in activities you enjoy, and seeking support if needed, Sleep deprivation can negatively impact mental health by increasing the risk of anxiety, depression, and cognitive impairments, Managing sudden anxiety involves practicing deep breathing exercises, grounding techniques, and seeking therapy if needed, Health anxiety disorder involves excessive worry about having a serious illness, Maintaining mental health when facing financial stress involves seeking support, creating a budget, and practicing self-care, Antisocial personality disorder is characterized by a disregard for the rights of others and a lack of empathy, Coping with anxiety in crowded places involves practicing relaxation techniques, gradual exposure, and seeking therapy, Avoidant personality disorder is characterized by feelings of inadequacy and a fear of social rejection, Maintaining mental health during retirement involves staying active, seeking social connections, and finding new hobbies, Gaming addiction can negatively impact mental health by leading to increased anxiety, depression, and social isolation, Coping with anxiety before bedtime involves creating a bedtime routine, reducing caffeine intake, and practicing relaxation techniques, Paranoid personality disorder is characterized by pervasive distrust and suspicion of others, Maintaining mental health during exam periods involves setting realistic study goals, taking breaks, and practicing relaxation techniques, Dependent personality disorder is characterized by an excessive need to be taken care of and fear of separation, Dealing with fear of rejection involves recognizing and challenging negative thoughts, seeking support, and practicing self-compassion, Social media addiction can negatively impact mental health by contributing to feelings of inadequacy, anxiety, and depression, Coping with health-related anxiety involves seeking accurate information, practicing relaxation techniques, and seeking therapy, Histrionic personality disorder is characterized by a need for attention and approval and exaggerated emotional expressions, Maintaining mental health when facing career changes involves seeking support, being open to new opportunities, and practicing self-care, Work addiction can negatively impact mental health by leading to burnout, stress, and strained relationships, Coping with appearance-related anxiety involves recognizing and challenging negative thoughts, practicing self-compassion, and seeking therapy, Obsessive-compulsive personality disorder is characterized by a preoccupation with orderliness, perfectionism, and control, Maintaining mental health during interpersonal conflicts involves practicing effective communication, setting boundaries, and seeking support, Sexual abuse can lead to long-term mental health issues such as anxiety, depression, and PTSD, Coping with anxiety related to big responsibilities involves setting realistic goals, seeking support, and practicing self-care, Borderline personality disorder is characterized by unstable moods, behavior, and relationships."

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
def create_prediction(prediction: schemas.PredictionCreate, db: Session = Depends(get_db)):
    db_prediction = predictions.create_prediction(db=db, prediction=prediction)
    return db_prediction

@app.get("/emotion_chart/")
def get_emotion_chart(db: Session = Depends(get_db)):
    stats = db.query(models.Prediction.prediction, func.count(models.Prediction.prediction)).group_by(models.Prediction.prediction).all()
    labels = [item[0] for item in stats]
    sizes = [item[1] for item in stats]
    total = sum(sizes)  # Calculate total
    
    # Add total to labels
    labels.append(f'Total: {total}')
    sizes.append(total)
    
    plt.figure(figsize=(8, 8))
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=sns.color_palette("hsv", len(labels)))
    plt.axis('equal')
    plt.title('Emotion Distribution (All Users)')

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")