import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors, CombinedProtocolErrors } from "@apollo/client/errors";
import { Platform } from "react-native";

import { getAccessToken, refreshAuthSession } from "./auth";

const backendUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/graphql'
  : 'http://localhost:8000/graphql';

const httpLink = new HttpLink({
  uri: backendUrl,
});

const authLink = new SetContextLink(async ({ headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = new ErrorLink(({ error, forward, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (let err of error.errors) {
      // Supabase JWT 에러 메시지를 확인하여 토큰 만료를 감지
      // 백엔드에서 '인증이 필요합니다.'와 같은 메시지를 보낼 경우에도 해당
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('인증이 필요합니다')) {
        console.log('인증 에러 감지. 토큰 갱신 시도...');
        // 토큰 갱신 로직을 Observable로 래핑하여 반환
        return new Observable<ApolloLink.Result>(observer => {
          (async () => {
            try {
              const newAccessToken = await refreshAuthSession();  // 세션 갱신 시도
              if (newAccessToken) {
                // 갱신 성공 시, operation의 Authorization 헤더를 업데이트하고 요청 재시도
                const oldHeaders = operation.getContext().headers;
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${newAccessToken}`,
                  },
                });
                // 요청 재시도 후 결과를 현재 Observable로 전달
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
              } else {
                // 갱신 실패 시, 에러를 Observable로 전달하여 처리
                console.error('토큰 갱신 실패. 로그아웃 필요.');
                observer.error(error);  // 원래 에러를 전달
              }
            } catch (refreshError) {
              console.error('토큰 갱신 중 오류 발생: ', refreshError);
              observer.error(error);  // 원래 에러를 전달
            }
          }) ();
        });
      }
    }
  }

  // 네트워크 에러 또는 기타 에러 처리
  if (CombinedProtocolErrors.is(error)) {
    console.error(`[Protocol error]: ${error.message}`);
  } else {
    console.error(`[Network error or other]: ${error.message}`);
  }

  // 에러 처리하지 않았을 시 다음 링크로 전달
  return;
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
