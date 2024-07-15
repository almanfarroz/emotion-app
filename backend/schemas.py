# schemas.py
from pydantic import BaseModel
from typing import Union

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Union[str, None] = None

class PredictionCreate(BaseModel):
    prediction: str
    user_id: int  # Add user_id here

class Prediction(PredictionCreate):
    id: int

    class Config:
        from_attributes = True
