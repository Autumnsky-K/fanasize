import strawberry
import datetime
import uuid
from typing import List
from strawberry.types import Info
from supabase import AsyncClient

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
class PostImageType:
  image_url: str
  order: int

@strawberry.type
class PostType:
  id: strawberry.ID
  created_at: datetime.datetime
  user_id: uuid.UUID
  content: str | None
  images: List[PostImageType]