import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// 화면
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from "../screens/auth/SignUpScreen";
import HomeScreen from "../screens/main/HomeScreen";

import { AuthStackParamList, MainStackParamList } from "./types";

// Stack Navigator 인스턴스
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// Stack Navigator 컴포넌트
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{headerShown: false}}>
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}

// Root Navigator 컴포넌트
const RootNavigator = () => {
  // TODO: 로그인 상태에 따라 MainStack으로 전환하는 로직 추가
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  )
}

export default RootNavigator;