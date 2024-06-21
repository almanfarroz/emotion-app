from pydantic import BaseModel

# Schema for user model
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# class Prediction(BaseModel):
#     id = int
#     user_id = int
#     photo = String
#     prediction = String
#     created_at = Optional[str]