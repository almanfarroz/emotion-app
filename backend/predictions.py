# prediction.py
from sqlalchemy.orm import Session
import models, schemas

def create_prediction(db: Session, prediction: schemas.PredictionCreate):
    db_prediction = models.Prediction(
        prediction=prediction.prediction,
        user_id=prediction.user_id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction
