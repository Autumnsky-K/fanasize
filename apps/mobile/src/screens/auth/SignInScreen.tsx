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

  const { login: contextSignIn } = useAuth();

  const [signIn, { loading }] = useMutation<SignInData, SignInVars>(
    SIGNIN_MUTATION,
    {
      onCompleted: data => {
        if (data.signIn.accessToken) {
          contextSignIn(data.signIn.accessToken);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>로그인</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={navigateToSignUp}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              계정이 없으신가요? 회원가입
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 48,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a0cfff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
});

export default SignInScreen;
