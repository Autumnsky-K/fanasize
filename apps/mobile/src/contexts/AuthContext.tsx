import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import * as Keychain from 'react-native-keychain';

export const Mode = {
  PRODUCTION: 'PRODUCTION',
  TEST: 'TEST',
} as const;

export type Mode = typeof Mode[keyof typeof Mode];

// Context에 저장할 값들의 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context를 제공하는 컴포넌트 정의
interface AuthProviderProps {
  children: ReactNode;
  mode: Mode;
}

export const AuthProvider = ({ children, mode }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        // 테스트 모드일 경우, 저장된 토큰을 삭제
        if (mode === Mode.TEST) {
          console.log('--- TEST MODE: Keychain 초기화 ---');
          await Keychain.resetGenericPassword();
        }
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          console.log('저장된 토큰 발견, 로그인 상태로 변경합니다.');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Keychain 불러오기 실패', error);
      } finally {
        // 로딩 상태는 작업이 종료된 후 무조건 종료되도록 수정
        setIsLoading(false);
      }
    };

    loadToken();
  }, [mode]);

  const signIn = async (token: string) => {
    try {
      await Keychain.setGenericPassword('session', token);
      setIsAuthenticated(true);
      console.log('토큰 저장 및 로그인 상태 변경 완료');
    } catch (error) {
      console.error('Keychain 저장 실패', error);
    }
  };

  const signOut = async () => {
    try {
      await Keychain.resetGenericPassword();
      setIsAuthenticated(false);
      console.log('토큰 삭제 및 로그아웃 완료');
    } catch (error) {
      console.error('Keychain 삭제 실패', error);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login: signIn,
    logout: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
