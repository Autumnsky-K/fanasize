import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { Platform } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, Mode } from './src/contexts/AuthContext';
import { client } from './src/libs/apollo';

const CURRENT_MODE = Mode.PRODUCTION;

function App(): React.JSX.Element {
  return (
    <ApolloProvider client={client}>
      <AuthProvider mode={CURRENT_MODE}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
