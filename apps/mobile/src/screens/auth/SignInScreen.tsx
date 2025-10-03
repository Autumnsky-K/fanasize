import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import { AuthScreenNavigationProp } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';

// 로그인 뮤테이션 정의
const SIGNIN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        createdAt
      }
    }
  }
`;

// 뮤테이션 결과 및 변수 타입 정의
interface SignInData {
  signIn: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
  };
}

interface SignInVars {
  email: string;
  password: string;
}

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // useNavigation 훅으로 navigation 객체 가져오기
  const navigation = useNavigation<AuthScreenNavigationProp<'SignIn'>>();

  const { signIn: contextSignIn } = useAuth();

  const [signIn, { loading }] = useMutation<SignInData, SignInVars>(
    SIGNIN_MUTATION,
    {
      onCompleted: data => {
        if (data.signIn.accessToken) {
          contextSignIn(data.signIn);
        }
      },
      onError: err => {
        console.error('로그인 실패: ', err);
        Alert.alert('로그인 실패', err.message);
      },
    },
  );

  const handleSignIn = () => {
    signIn({
      variables: {
        email: email,
        password: password,
      },
    });
  };

  const navigateToSignUp = () => {
    navigation.replace('SignUp');
  };

  return (
    <SafeArea>
      <Container>
        <Title>로그인</Title>
        <Form>
          <InputContainer>
            <InputLabel>이메일</InputLabel>
            <Input
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </InputContainer>

          <InputContainer>
            <InputLabel>비밀번호</InputLabel>
            <Input
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </InputContainer>

          <Button
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ButtonText>로그인</ButtonText>
            )}
          </Button>
          <SecondaryButton
            onPress={navigateToSignUp}
          >
            <SecondaryButtonText>
              계정이 없으신가요? 회원가입
            </SecondaryButtonText>
          </SecondaryButton>
        </Form>
      </Container>
    </SafeArea>
  );
};

const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Container = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 48px;
  text-align: center;
`;

const Form = styled.View`
  width: 100%;
`;

const InputContainer = styled.View`
  margin-bottom: 16px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
`;

const Input = styled.TextInput`
  height: 50px;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 16px;
`;

const Button = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;

  background-color: ${props => (props.disabled ? '#a0cfff' : '#007bff')} ;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const SecondaryButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  background-color: transparent;
  border-width: 1px;
  border-color: #007bff;
`;

const SecondaryButtonText = styled.Text`
  color: #007bff;
  font-size: 18px;
  font-weight: bold;
`;

export default SignInScreen;
