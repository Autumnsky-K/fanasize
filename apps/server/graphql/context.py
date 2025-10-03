from fastapi import Request, Depends
from supabase import AsyncClient

from ..core import dependencies
from ..core.dependencies import create_supabase

async def get_context(request: Request, supabase: AsyncClient = Depends(create_supabase)):
  """
  모든 GraphQL 리졸버에 공유될 컨텍스트를 생성
  이 컨텍스트 딕셔너리에 Supabase Client를 담아 전달
  """
  user = None
  token = None
  authorization = request.headers.get("Authorization")

  # supabase: AsyncClient = dependencies.supabase_client

  if authorization and authorization.startswith("Bearer "):
    token = authorization.split(" ")[1]
    try:
      # 토큰 검증 및 사용자 정보 가져오기
      # user = await supabase_client.auth.get_user(token)
      user = await supabase.auth.get_user(token)
    except Exception as e:
      # 토큰이 유효하지 않을 경우 user는 None으로 유지
      print(f"--- Token Validation Error: {e} ---")
      pass

  return {
      "supabase": supabase,
      "user": user.user if user else None,
      "access_token": token if token else None,
  }