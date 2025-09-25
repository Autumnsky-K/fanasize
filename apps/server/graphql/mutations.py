import strawberry
from strawberry.types import Info
from typing import Optional
import datetime

from .types import User, Session, PostType

@strawberry.type
class Mutation:
  @strawberry.mutation
  async def signUp(self, email: str, password: str, info: Info) -> User:
    supabase_client = info.context["supabase_client"]
    # Supabase Auth를 사용하여 사용자를 생성
    res = await supabase_client.auth.sign_up({
      "email": email,
      "password": password
    })

    # Supabase로부터 받은 사용자 정보를 User 타입으로 변환하여 반환
    return User(
      id=res.user.id,
      email=res.user.email,
      created_at=res.user.created_at
    )
  
  @strawberry.mutation
  async def signIn(self, email: str, password: str, info: Info) -> Session:
    supabase_client = info.context["supabase_client"]
    res = await supabase_client.auth.sign_in_with_password({
      "email": email,
      "password": password
    })
    user_data = User(
      id=res.user.id,
      email=res.user.email,
      created_at=res.user.created_at
    )
    return Session(
      access_token=res.session.access_token,
      refresh_token=res.session.refresh_token,
      user=user_data
    )

  @strawberry.mutation
  async def create_post(
    self,
    info: Info,
    content: str,
    image_url: Optional[str] = None
  ) -> PostType:
    """새로운 게시물 작성. 인증된 사용자만 호출 가능."""

    user = info.context.get("user")
    if not user:
      raise Exception("인증이 필요합니다.")
    
    supabase_client = info.context["supabase_client"]

    # 'posts' 테이블에 새로운 데이터를 삽입
    response = await supabase_client.table("posts").insert({
      "content": content,
      "image_url": image_url,
      "user_id": str(user.id)
    }).execute()

    if not response.data:
      raise Exception("게시물을 생성하지 못했습니다.")
    
    new_post_data = response.data[0]

    created_at_datetime = datetime.datetime.fromisoformat(new_post_data['created_at'])

    # 생성된 데이터를 PostType으로 변환하여 반환
    return PostType(
      id=new_post_data['id'],
      created_at=created_at_datetime,
      content=new_post_data['content'],
      user_id=new_post_data['user_id'],
      image_url=new_post_data['image_url'],
    )