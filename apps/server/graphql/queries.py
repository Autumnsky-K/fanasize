import strawberry
from typing import List
from strawberry.types import Info
from supabase import AsyncClient
import datetime

from .types import PostType, PostImageType

@strawberry.type
class Query:
  @strawberry.field
  async def list_posts(self, info: Info) -> List[PostType]:
    """모든 게시물 목록을 최신순으로 조회"""
    supabase: AsyncClient = info.context["supabase"]

    response = await supabase.table("posts").select(
      "*, post_images(*)"
    ).order("created_at", desc=True).execute()

    if not response.data:
      return []
    
    posts = []
    for post_data in response.data:
      raw_images = post_data.pop('post_images', [])

      images_list = [PostImageType(image_url=img['image_url'], order=img['order']) for img in raw_images]

      post_instance = PostType(
        id=post_data['id'],
        created_at=datetime.datetime.fromisoformat(post_data['created_at']),
        user_id=post_data['user_id'],
        content=post_data['content'],
        images=images_list  # images 필드에 직접 할당
      )
      posts.append(post_instance)
    return posts