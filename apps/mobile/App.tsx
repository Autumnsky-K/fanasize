import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Platform } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

const backendUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/graphql'
    : 'http://localhost:8000/graphql';

const httpLink = new HttpLink({
  uri: backendUrl,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

function App(): React.JSX.Element {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
