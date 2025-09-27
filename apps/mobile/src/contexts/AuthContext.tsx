import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

import { Session } from '../graphql/types';
import { supabase } from '../libs/auth';

export const Mode = {
  PRODUCTION: 'PRODUCTION',
  TEST: 'TEST',
} as const;

export type Mode = typeof Mode[keyof typeof Mode];

// Context에 저장할 값들의 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
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
    // Supabase auth 상태 변경 리스너 추가
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mode === Mode.TEST && event === 'INITIAL_SESSION') {
          // 테스트 모드일 때 초기 세션에서 로그아웃
          console.log('--- TEST MODE: Supabase 세셔 초기화 ---');
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN'
          || event === 'TOKEN_REFRESHED'
          || event === 'INITIAL_SESSION') {
            if (session) {
              setIsAuthenticated(true);
              console.log('유효한 세션 발견 또는 갱신, 로그인 상태로 변경.');
            } else {
              setIsAuthenticated(false);
              console.log('세션 없음 또는 유효하지 않음.');
            }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          console.log('로그아웃 이벤트 발생.');
        }
        setIsLoading(false);  // 첫 이벤트 발생 시 로딩 종료
      }
    );

    return () => {
      authListener?.subscription.unsubscribe(); // 컴포넌트 언마운트 시 리스너 해제
    }
  }, [mode]);

  const signIn = async (session: Session) => {
    try {
      // Supabase 클라이언트에 세션 정보를 명시적으로 설정
      // GraphQL SignIn 뮤테이션 성공 후 Supabase 클라이언트 내부의 상태를 업데이트
      const why = await supabase.auth.setSession({
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
      });
      console.log('Supabase 세션 설정 및 로그인 상태 변경 완료.');
    } catch (error) {
      console.error('Supabase 세션 설정 실패', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();  // Supabase 클라이언트를 통해 로그아웃
      // setIsAuthenticated(false);
      console.log('Supabase 세션 삭제 및 로그아웃 완료.');
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
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
