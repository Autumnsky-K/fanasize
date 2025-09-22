import strawberry
import datetime
from typing import List

@strawberry.type
class User:
  id: strawberry.ID
  email: str
  created_at: datetime.datetime

@strawberry.type
class Query:
  @strawberry.field
  def hello(self) -> str:
    return "Hello, world!"
  
@strawberry.type
class Session:
  access_token: str
  refresh_token: str
  user: User