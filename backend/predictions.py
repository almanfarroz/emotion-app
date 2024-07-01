from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime

def create_prediction(db: Session, prediction: schemas.PredictionCreate):
    db_prediction = models.Prediction(
        prediction=prediction.prediction,
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

