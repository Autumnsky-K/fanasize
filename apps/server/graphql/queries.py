import strawberry
from typing import List
from strawberry.types import Info
import datetime

from .types import PostType

@strawberry.type
class Query:
  @strawberry.field
  async def list_posts(self, info: Info) -> List[PostType]:
    """모든 게시물 목록을 최신순으로 조회"""
    supabase_client = info.context["supabase_client"]

    response = await supabase_client.table("posts").select("*").order("created_at", desc=True).execute()

    if not response.data:
      return []
    
    posts = []
    for post_data in response.data:
      post_data['created_at'] = datetime.datetime.fromisoformat(post_data['created_at'])
      posts.append(PostType(**post_data))
    return posts