import strawberry
import datetime
import uuid
from typing import List

@strawberry.type
class User:
  id: strawberry.ID
  email: str
  created_at: datetime.datetime
  
@strawberry.type
class Session:
  access_token: str
  refresh_token: str
  user: User

@strawberry.type
class PostType:
  id: strawberry.ID
  created_at: datetime.datetime
  user_id: uuid.UUID
  content: str | None
  image_url: str | None