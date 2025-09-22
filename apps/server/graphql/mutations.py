import strawberry
from ..core.dependencies import supabase_client
from .types import User, Session

@strawberry.type
class Mutation:
  @strawberry.mutation
  def signUp(self, email: str, password: str) -> User:
    # Supabase Auth를 사용하여 사용자를 생성
    res = supabase_client.auth.sign_up({
      "email": email,
      "password": password
    })

    # Supabase로부터 받은 사용자 정보를 우리가 정의한 User 타입으로 변환하여 반환
    return User(
      id=res.user.id,
      email=res.user.email,
      created_at=res.user.created_at
    )
  
  @strawberry.mutation
  def signIn(self, email: str, password: str) -> Session:
    res = supabase_client.auth.sign_in_with_password({
      "email": email,
      "password": password
    })
    return Session(
      access_token=res.session.access_token,
      refresh_token=res.session.refresh_token,
      user=User(
        id=res.user.id,
        email=res.user.email,
        created_at=res.user.created_at
      )
    )