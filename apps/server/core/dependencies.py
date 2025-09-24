import os
from supabase import create_async_client, AsyncClient
from dotenv import load_dotenv

# .env 파일로부터 환경 변수 로드
load_dotenv()

# Supabase 프로젝트 URL과 anon 키
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Supabase 클라이언트 생성
supabase_async_client: AsyncClient = create_async_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_client() -> AsyncClient:
  """
  Supabase 클라이언트 인스턴스를 반환하는 의존성 함수
  """
  return supabase_async_client