import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { Platform } from "react-native";

const backendUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/graphql'
  : 'http://localhost:8000/graphql';

const httpLink = new HttpLink({
  uri: backendUrl,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
