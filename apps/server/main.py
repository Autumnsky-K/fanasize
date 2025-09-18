from fastapi import FastAPI
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/users/")
async def create_user(user: UserCreate):
    # TODO: 데이터베이스에 사용자 정보 저장 로직 추가
    return user