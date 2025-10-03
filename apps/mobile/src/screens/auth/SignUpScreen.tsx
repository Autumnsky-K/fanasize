import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
} from 'react-native';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../navigation/types';
import styled from 'styled-components/native';

const SIGNUP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      id
      email
      createdAt
    }
  }
`;

interface SignUpData {
  signUp: {
    id: string;
    email: string;
    createdAt: string;
  };
}

interface SignUpVars {
  email: string;
  password: string;
}

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<AuthScreenNavigationProp<'SignUp'>>();

  const [signUp, { data, loading, error }] = useMutation<
    SignUpData,
    SignUpVars
  >(SIGNUP_MUTATION, {
    onCompleted: completedData => {
      Alert.alert(
        '가입 성공',
        `환영합니다, ${completedData.signUp.email}님! 로그인 화면으로 이동합니다.`,
      );
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    },
    onError: err => {
      console.error('가입 실패: ', err);
      Alert.alert('가입 실패', err.message);
    },
  });

  const handleSignUp = async () => {
    signUp({
      variables: {
        email: email,
        password: password,
      },
    });
  };

  const navigateToSignIn = () => {
    navigation.replace('SignIn');
  };

  return (
    <SafeArea>
      <Container>
        <InputContainer>
          <Title>회원가입</Title>
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
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ButtonText>가입하기</ButtonText>
              )}
            </Button>
            <SecondaryButton
              onPress={navigateToSignIn}
            >
              <SecondaryButtonText>
                이미 계정이 있으신가요? 로그인
              </SecondaryButtonText>
            </SecondaryButton>
          </Form>
        </InputContainer>
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

  background-color: ${props => (props.disabled ? '#a0cfff' : '#007bff')};
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
  border-width: 1px;
  border-color: #007bff;

  background-color: transparent;
`;

const SecondaryButtonText = styled.Text`
  color: #007bff;
  font-size: 18px;
  font-weight: bold;
`;

export default SignUpScreen;
