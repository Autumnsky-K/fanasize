import os
from dotenv import load_dotenv

# 파일이 import 되는 시점에 .env 파일을 최우선으로 로드
load_dotenv()

# 환경 변수를 읽어서 파이썬 상수로 정의
SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str | None = os.getenv("SUPABASE_KEY")

# 필수 환경 변수가 설정되었는지 확인
if not SUPABASE_URL or not SUPABASE_KEY:
  raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
