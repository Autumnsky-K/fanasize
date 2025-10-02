import asyncio
from supabase import AsyncClient, acreate_client
from typing import Optional

from .config import SUPABASE_URL, SUPABASE_KEY

# Supabase 클라이언트 생성
supabase: Optional[AsyncClient] = None

async def create_supabase():
  global supabase
  if not supabase:
    supabase = await acreate_client(
      SUPABASE_URL,
      SUPABASE_KEY,
    )
  return supabase
