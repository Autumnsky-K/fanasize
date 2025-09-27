import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,  // Supabase SDK가 자동으로 토큰 갱신 시도
    persistSession: true,  // 세션 지속성 활성화
    detectSessionInUrl: false,  // URL에서 세션 감지 비활성화
    lock: processLock,
  },
});

// Supabase Auth가 앱이 포그라운드에 있을 때 세션을 계속 새로고침하도록 지시
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  })
}

/**
 * Supabase의 refreshToken을 사용하여 세션 갱신 및 새로운 accessToken 반환
 * ErrorLink에서 호출
 */
export const refreshAuthSession = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('세션 갱신 실패: ', error.message);
      // 갱신 실패 시 로그아웃 처리 (AuthContext의 signOut 호출 필요)
      return null;
    }

    if (data.session) {
      console.log('세션 갱신 성공. 새로운 액세스 토큰 저장.');
      return data.session.access_token;
    }
  } catch (error) {
    console.error('refreshAuthSession 오류: ', error);
  }
  return null;
};

/**
 * Keychain에서 현재 accessToken 가져옴
 * Apollo Client의 authLink에서 사용
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token || null;
  } catch (error) {
    console.error('액세스 토큰 가져오기 실패: ', error);
    return null;
  }
};
