import { StackNavigationProp } from "@react-navigation/stack";

// Auth Stack에서 사용할 스크린 목록과 파라미터 정의
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

// Main Stack에서 사용할 스크린 목록과 파라미터 정의
export type MainStackParamList = {
  Home: undefined;
};

// Auth Stack의 각 스크린에서 navigation prop의 타입을 정의
export type AuthScreenNavigationProp<T extends keyof AuthStackParamList, > = StackNavigationProp<AuthStackParamList, T>;