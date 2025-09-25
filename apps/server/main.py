from contextlib import asynccontextmanager
from fastapi import FastAPI
import strawberry
from strawberry.fastapi import GraphQLRouter
from supabase import create_async_client

from .graphql.queries import Query
from .graphql.mutations import Mutation
from .graphql.context import get_context
from .core import dependencies, config

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("--- 앱 시작: Supabase 클라이언트 생성 시도 ---")
  dependencies.supabase_client = await create_async_client(
    config.SUPABASE_URL,
    config.SUPABASE_KEY,
  )
  print("--- 앱 시작: Supabase 클라이언트 생성 완료 ---")
  yield
  # 앱이 종료될 때
  print("--- 앱 종료 ---")

# strawberry를 사용하연 GraphQL 스키마 생성
# graphql/types.py에 정의된 Query 타입 사용
schema = strawberry.Schema(query=Query, mutation=Mutation)

# 스키마를 기반으로 FastAPI에서 사용할 GraphQL 라우터 생성
graphql_app = GraphQLRouter(schema, context_getter=get_context)

app = FastAPI(lifespan=lifespan)
app.include_router(graphql_app, prefix="/graphql")