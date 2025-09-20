import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SignUpScreen from "./src/screens/auth/SignUpScreen";

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <SignUpScreen />
    </SafeAreaProvider>
  )
}

export default App;