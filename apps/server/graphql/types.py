import strawberry
import datetime
import uuid
from typing import List
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
  
  @strawberry.field
  async def images(self, info: Info) -> List[PostImageType]:
    """게시물에 연관된 이미지 목록을 반환합니다."""
    supabase_client: AsyncClient = info.context["supabase_client"]

    # self: PostType 객체. self.id를 사용해 post_id로 조회
    response = await supabase_client.table("post_images").select("image_url", "order").eq("post_id", self.id).order("order", desc=False).execute()

    if not response.data:
      return []
    
    return [PostImageType(image_url=img['image_url'], order=img['order']) for img in response.data]