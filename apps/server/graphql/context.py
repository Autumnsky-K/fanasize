from fastapi import Request

from ..core import dependencies

async def get_context(request: Request):
  """
  모든 GraphQL 리졸버에 공유될 컨텍스트를 생성
  이 컨텍스트 딕셔너리에 supabase_client를 담아 전달
  """
  user = None
  authorization = request.headers.get("Authorization")

  supabase_client = dependencies.supabase_client

  if authorization and authorization.startswith("Bearer "):
    token = authorization.split(" ")[1]
    try:
      # 토큰 검증 및 사용자 정보 가져오기
      user = await supabase_client.auth.get_user(token)
    except Exception as e:
      # 토큰이 유효하지 않을 경우 user는 None으로 유지
      print(f"--- Token Validation Error: {e} ---")
      pass

  return {
      "supabase_client": supabase_client,
      "user": user.user if user else None
  }