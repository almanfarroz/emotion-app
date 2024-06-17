from dotenv import load_dotenv
import os

load_dotenv()
username= os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
url=os.getenv("DB_URL")
#port="80"
db_name=os.getenv("DB_NAME")

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

database_url = f"mysql+pymysql://{username}:{password}@{url}/{db_name}"
if(password == None or password == ""):
    database_url = f"mysql+pymysql://{username}@{url}/{db_name}"
engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False,autoflush=False, bind=engine)

Base = declarative_base()