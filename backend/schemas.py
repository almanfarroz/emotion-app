from pydantic import BaseModel
from typing import Union, Optional

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

# Schema for PredictionCreate
class PredictionCreate(BaseModel):
    prediction: str
# Schema for Prediction (response model)
class Prediction(PredictionCreate):
    id: int

    class Config:
        from_attributes = True

# class Prediction(BaseModel):
#     id = int
#     user_id = int
#     photo = String
#     prediction = String
#     created_at = Optional[str]