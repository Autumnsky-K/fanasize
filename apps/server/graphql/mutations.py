import strawberry
from strawberry.types import Info
from typing import Optional
import datetime
from supabase import AsyncClient
from postgrest import AsyncPostgrestClient

from .types import User, Session, PostType, PostImageType, ProfileType

@strawberry.type
class Mutation:
  @strawberry.mutation
  async def signUp(self, email: str, password: str, info: Info) -> User:
    supabase: AsyncClient = info.context["supabase"]
    # Supabase Auth를 사용하여 사용자를 생성
    res = await supabase.auth.sign_up({
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
    supabase: AsyncClient = info.context["supabase"]
    res = await supabase.auth.sign_in_with_password({
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
    image_urls: list[str]  # list[str] 타입으로 필수 인자 변경
  ) -> PostType:
    """새로운 게시물 작성. 인증된 사용자만 호출 가능."""

    user = info.context.get("user")
    if not user:
      raise Exception("인증이 필요합니다.")
    
    token = info.context.get("access_token")
    if not token:
      raise Exception("인증이 필요합니다.")

    # 이미지 URL 리스트가 비어 있는지 확인
    if not image_urls:
      raise Exception("이미지는 최소 1개 이상 필요합니다.")
    
    supabase: AsyncClient = info.context["supabase"]

    pg: AsyncPostgrestClient = supabase.postgrest.auth(token=token)
    # 'posts' 테이블에 새로운 데이터를 삽입
    # 사용자마다 스코프 생성하여 요청 실행
    response = await pg.table("posts").insert({
      "content": content,
      "user_id": str(user.id)
    }).execute()

    if not response.data:
      raise Exception("게시물을 생성하지 못했습니다.")
  
    new_post_data = response.data[0]
    new_post_id = new_post_data['id']

    # 생성된 post_id를 사용하여 post_images 테이블에 이미지 URL들 삽입
    images_to_insert = [
      {
        "post_id": new_post_id,
        "image_url": url,
        "order": index
      } for index, url in enumerate(image_urls)
    ]
    images_response = await pg.table("post_images").insert(images_to_insert).execute()

    if not images_response.data:
      # TODO: 이미 생성된 post 삭제 후 롤백하는 로직 필요
      raise Exception("게시물 이미지를 저장하지 못했습니다.")
    
    images_list = [PostImageType(image_url=img['image_url'], order=img['order']) for img in images_to_insert]

    profile_response = await supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    author_instance = ProfileType(**profile_response.data)

    created_at_datetime = datetime.datetime.fromisoformat(new_post_data['created_at'])

    pg.aclose()

    # 생성된 데이터를 PostType으로 변환하여 반환
    return PostType(
      id=new_post_data['id'],
      created_at=created_at_datetime,
      user_id=new_post_data['user_id'],
      content=new_post_data['content'],
      images=images_list,
      author=author_instance, 
    )