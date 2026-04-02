import sys
from sqlalchemy import create_engine

url = 'postgresql://postgres:postgres@127.0.0.1:5433/agriguard'
try:
    engine = create_engine(url)
    engine.connect()
    print("Database connection successful!")
except Exception as e:
    with open("error.log", "w") as f:
        f.write(str(e))
    print("Failed, wrote to error.log")
