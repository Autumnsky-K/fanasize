import strawberry
import datetime
import uuid
from typing import List, Optional

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
class ProfileType:
  id: uuid.UUID
  handle: str
  username: Optional[str]
  avatar_url: Optional[str]
  updated_at: Optional[datetime.datetime] = None

@strawberry.type
class PostType:
  id: strawberry.ID
  created_at: datetime.datetime
  user_id: uuid.UUID
  content: str | None
  images: List[PostImageType]
  author: ProfileType