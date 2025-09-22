from fastapi import FastAPI
import strawberry
from strawberry.fastapi import GraphQLRouter

from .graphql.types import Query
from .graphql.mutations import Mutation

# strawberry를 사용하연 GraphQL 스키마 생성
# graphql/types.py에 정의된 Query 타입 사용
schema = strawberry.Schema(query=Query, mutation=Mutation)

# 스키마를 기반으로 FastAPI에서 사용할 GraphQL 라우터 생성
graphql_app = GraphQLRouter(schema)

app = FastAPI()

# FastAPI 앱에 GraphQL 라우터를 포함
# '/graphql' 경로로 들어오는 모든 요청은 GraphQL 서버가 처리
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def read_root():
    return {"Hello": "World"}