from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)

# class Prediction(Base):
#     __tablename__ = "predictions"
#     id = Column(Integer, primary_key=True, autoincrement=True, index=True)
#     user_id = Column(Integer, ForeignKey("Users.id"), nullable=False)
#     photo = Column(String(255))
#     prediction = Column(String(255))
#     created_at = Column(DateTime, default=datetime.datetime.now)
#     user = relationship("User", foreign_keys=[user_id])