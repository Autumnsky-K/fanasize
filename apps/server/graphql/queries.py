import strawberry
from typing import List
from strawberry.types import Info
from supabase import AsyncClient
import datetime

from .types import PostType, PostImageType, ProfileType

@strawberry.type
class Query:
  @strawberry.field
  async def list_posts(self, info: Info) -> List[PostType]:
    """모든 게시물 목록을 최신순으로 조회"""
    supabase: AsyncClient = info.context["supabase"]

    response = await supabase.rpc("get_posts_with_details").execute()

    if not response.data:
      return []
    
    posts = []
    for row in response.data:
      post_data = row['post_details']

      author_data = post_data.get('author') or {}
      images_data = post_data.get('images') or []

      author_instance = ProfileType(
        id=author_data.get('id'),
        handle=author_data.get('handle'),
        username=author_data.get('username'),
        avatar_url=author_data.get('avatar_url')
      )

      images_list = [PostImageType(
        image_url=img.get('imageUrl'),
        order=img.get('order')
      ) for img in images_data]

      post_instance = PostType(
        id=post_data['id'],
        created_at=datetime.datetime.fromisoformat(post_data['createdAt']),
        user_id=post_data['userId'],
        content=post_data['content'],
        author=author_instance,
        images=images_list,  # images 필드에 직접 할당
      )
      posts.append(post_instance)

    return posts