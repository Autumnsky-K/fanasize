import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { Platform } from "react-native";
import * as Keychain from 'react-native-keychain';

const backendUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/graphql'
  : 'http://localhost:8000/graphql';

const httpLink = new HttpLink({
  uri: backendUrl,
});

const authLink = new SetContextLink(async ({ headers }) => {
  try {
    // Keychain에 저장된 토큰 불러오기
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      // 토큰이 있을 경우, Authorization 헤더에 Bearer 토큰 설정
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${credentials.password}`,
        },
      };
    }
  } catch (error) {
    console.error('Keychain-Error: ', error);
  }

  // 토큰이 없으면 기존 헤더만 반환
  return {
    headers,
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
