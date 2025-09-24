import os
from supabase import create_async_client, AsyncClient
from typing import Optional
from dotenv import load_dotenv

# Supabase 프로젝트 URL과 anon 키
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Supabase 클라이언트 생성
supabase_client: Optional[AsyncClient] = None
