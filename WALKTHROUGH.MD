# Fanasize 프로젝트 개발 과정

이 문서는 Fanasize 프로젝트의 실제 개발 과정을 순서대로 기록합니다.

## 2025년 9월 20일

### 1. 프론트엔드: 회원가입 UI 구현

- **목표:** 사용자가 이메일과 비밀번호를 입력하여 회원가입을 요청할 수 있는 UI 화면을 구현합니다.

- **파일 생성:**
    - `apps/mobile/src/screens/auth/SignUpScreen.tsx` 경로에 회원가입 화면을 위한 파일을 생성했습니다.
    - `src/screens/auth` 구조를 도입하여 코드의 역할과 책임을 분리하고 가독성을 높였습니다.

- **UI 코드 작성:**
    - 이메일, 비밀번호를 입력받는 `TextInput`과 '가입하기' `TouchableOpacity` 버튼으로 기본 UI를 구성했습니다.
    - **수정사항:** 처음에는 `react-native`의 deprecated된 `SafeAreaView`를 사용했으나, `react-native-safe-area-context` 라이브러리의 `SafeAreaView`를 사용하도록 코드를 수정했습니다.

- **화면 연동 및 확인:**
    - 앱의 진입점인 `App.tsx`가 `SignUpScreen`을 렌더링하도록 임시 수정했습니다.
    - `pnpm --filter mobile run ios` 명령어를 통해 iOS 시뮬레이터에서 회원가입 UI가 정상적으로 표시되는 것을 확인했습니다.

### 2. Git 저장소 설정 및 트러블슈팅

- **문제 상황:** `apps/mobile`에 생성한 신규 파일들이 Git에서 변경사항으로 감지되지 않았습니다.

- **1차 진단:** `git status`를 통해 확인한 결과, `apps/mobile` 디렉토리 자체가 Git에 의해 추적되고 있지 않은 'Untracked' 상태임을 발견했습니다.

- **2차 진단:** `git add apps/mobile` 실행 시, 'embedded git repository' 경고가 발생했습니다. 이는 `apps/mobile` 내부에 또 다른 `.git` 저장소가 존재하기 때문이었습니다.

- **해결 과정:**
    1. `git rm --cached apps/mobile` 명령으로 잘못된 Staging을 취소했습니다.
    2. `rm -rf apps/mobile/.git` 명령으로 `apps/mobile` 내의 중첩된 `.git` 저장소를 완전히 삭제했습니다.
    3. `git add apps/mobile` 명령으로 `apps/mobile` 디렉토리 전체를 상위 저장소에 정상적으로 추가했습니다.

### 3. 첫 기능 커밋

- `apps/mobile` 프로젝트의 초기 파일 전체와 회원가입 UI 구현 내용을 하나의 작업 단위로 묶어 커밋을 제안했습니다.
- **제안된 커밋 메시지:**
  ```
  feat(mobile): mobile 앱 초기 설정 및 회원가입 UI 구현

  - pnpm 워크스페이스에 React Native 기반의 mobile 앱 초기 파일을 추가합니다.
  - 중첩된 git 저장소를 제거하고 모노레포에서 파일들을 관리하도록 수정합니다.
  - 회원가입 화면(SignUpScreen)의 기본 UI를 구현하고, App.tsx에 임시로 렌더링합니다.
  ```

---

### 4. 프론트엔드: 회원가입 상태 관리 및 API 연동

- **상태 관리:**
    - `useState` hook을 사용하여 `SignUpScreen`의 이메일, 비밀번호 입력 값에 대한 상태 관리를 추가했습니다.
    - '가입하기' 버튼 클릭 시 `Alert`와 `console.log`를 통해 입력된 상태를 확인하는 초기 로직을 구현했습니다.

- **API 연동:**
    - 내장 `fetch` API를 사용하여 기본적인 네트워크 연결을 구현했습니다.
    - `handleSignUp` 함수를 `async`로 변경하고, `fetch`를 사용하여 백엔드 `POST /users/` 엔드포인트로 가입 정보를 전송하는 로직을 구현했습니다.
    - `try...catch`를 사용해 네트워크 오류를 처리하고, `response.ok`를 통해 API 응답의 성공/실패를 분기하여 각기 다른 `Alert`를 표시하도록 했습니다.

- **최종 확인:**
    - 프론트엔드에서 보낸 요청이 백엔드 서버에 도달하고, 백엔드가 보낸 성공 응답이 프론트엔드 `Alert`와 `console`에 정상적으로 표시되는 것을 확인하여 전체 흐름을 완성했습니다.

---

## 2025년 9월 22일

### 5. 백엔드: GraphQL 및 Supabase 연동

- **목표:** 학습 및 실무 제어 목적에 맞춰, FastAPI 서버에 직접 GraphQL API를 구축하고 Supabase 데이터베이스와 연동합니다.

- **라이브러리 설치:**
    - `supabase`: Supabase 연동을 위한 파이썬 클라이언트
    - `strawberry-graphql[fastapi]`: FastAPI에 GraphQL 서버를 구축하기 위한 라이브러리
    - `python-dotenv`: `.env` 파일로 환경 변수를 관리하기 위한 라이브러리

- **보안 및 구성:**
    - `apps/server/.env` 파일을 생성하여 Supabase URL 및 Key를 저장하고, 민감한 정보가 Git에 포함되지 않도록 최상위 `.gitignore`에 `**/.env` 규칙을 추가했습니다.
    - `apps/server/core/dependencies.py` 파일을 생성하여, `.env` 파일의 변수를 읽어 Supabase 클라이언트를 초기화하는 로직을 구현했습니다.

- **GraphQL 엔드포인트 생성:**
    - `apps/server/main.py`를 수정하여 기존 REST API 로직을 제거하고, `/graphql` 경로에서 GraphQL 요청을 처리하는 `GraphQLRouter`를 추가했습니다.

### 6. 백엔드: 인증(Auth) Mutations 구현

- **GraphQL 타입 정의:**
    - `apps/server/graphql/types.py` 파일을 생성하고, `User`와 `Session` 타입을 `strawberry`를 이용해 정의했습니다.

- **Mutation 구현:**
    - `apps/server/graphql/mutations.py` 파일을 생성하여 `signUp`과 `signIn` 뮤테이션을 구현했습니다.
    - 각 뮤테이션은 Supabase Auth의 `sign_up` 및 `sign_in_with_password` 함수를 호출하여 실제 인증을 처리합니다.

### 7. 프론트엔드: Apollo Client 연동

- **라이브러리 설치:** `@apollo/client`와 `graphql` 패키지를 `mobile` 앱에 설치했습니다.
- **ApolloProvider 설정:** `App.tsx`에서 Apollo Client 인스턴스를 생성하고, 앱 전체를 `ApolloProvider`로 감싸 GraphQL API를 사용할 수 있도록 준비했습니다. 이 과정에서 `HttpLink`를 사용하는 최신 방식으로 코드를 수정했습니다.
- **`SignUpScreen` 리팩토링:** 기존 `fetch` API 호출 방식을 `useMutation` 훅을 사용하는 방식으로 변경했습니다. 로딩 상태 처리, 타입스크립트 타입 정의(`SignUpData`, `SignUpVars`) 등을 통해 더 안정적이고 선언적인 코드로 개선했습니다.
- **`SignInScreen` 구현:** `SignUpScreen`과 유사한 구조로 로그인 화면을 구현하고, `signIn` 뮤테이션과 연동했습니다.

### 8. 개발 환경 문제 해결

- **VS Code 인터프리터:** VS Code가 `venv`의 파이썬 인터프리터를 인식하지 못해 자동 완성이 동작하지 않는 문제를, `Python: Select Interpreter` 명령을 통해 올바른 인터프리터 경로를 지정하여 해결했습니다.
- **Metro Bundler 의존성 문제:**
    - **문제:** `pnpm` 모노레포 환경에서 `mobile` 앱이 프로젝트 루트의 `node_modules`에 설치된 `@babel/runtime`을 찾지 못하는 `Unable to resolve module` 오류가 반복적으로 발생했습니다.
    - **해결:** 사용자가 직접 찾아낸 해결책에 따라, `apps/mobile/metro.config.js` 파일을 수정했습니다. `watchFolders`와 `resolver.nodeModulesPaths` 옵션을 설정하여 Metro 번들러가 모노레포 최상위의 `node_modules`를 인식하도록 하여 문제를 최종적으로 해결했습니다.
---

## 2025년 9월 23일

### 9. 프론트엔드: React Navigation 설정

- **목표:** 화면 간 이동을 담당하는 `React Navigation`을 설정하고, 인증(Auth) 스택과 메인(Main) 스택의 기본 구조를 구현합니다.

- **라이브러리 설치:**
    - 내비게이션 구현을 위해 필요한 라이브러리들을 설치했습니다.
    ```bash
    pnpm add @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-worklets
    ```

- **`react-native-reanimated` 빌드 오류 해결:**
    - **문제 상황:** `reanimated` 라이브러리 설치 후 `npx pod-install ios` 실행 시, `Invalid RNReanimated.podspec file: different prefix` 오류가 발생하며 `pod` 설치가 계속 실패했습니다.
    - **원인 분석:** `reanimated`의 설치 스크립트가 pnpm 모노레포 구조에서 `react-native`의 위치를 제대로 찾지 못하는 것이 근본 원인이었습니다. 특히, 공식 문서에서 안내하는 `babel.config.js`의 플러그인 설정이 누락되어 라이브러리가 정상적으로 변환되지 않은 상태였습니다.
    - **해결 과정:**
        1.  `apps/mobile/babel.config.js`의 `plugins` 배열 마지막에 `'react-native-reanimated/plugin'`을 추가하여 Babel 플러그인을 활성화했습니다.
        2.  이전에 시도했던 `Podfile` 수정을 모두 원래대로 되돌렸습니다. (Babel 플러그인 설정이 근본적인 해결책이었음)
        3.  캐시를 초기화(`--reset-cache`)하고 앱을 재빌드하여 `pod install` 문제를 최종적으로 해결했습니다.

### 10. 프론트엔드: 인증 스택 내비게이션 구현

- **내비게이션 구조화:**
    - `apps/mobile/src/navigation/RootNavigator.tsx` 파일을 생성하여 앱의 전체 내비게이션 흐름을 관리하도록 했습니다.
    - 로그인 여부에 따라 `AuthStack`과 `MainStack`을 선택적으로 보여주는 구조를 구현했습니다. (현재는 `AuthStack`만 보이도록 고정)
    - 내비게이션 관련 타입들을 `types.ts` 파일로 분리하여 코드의 재사용성과 유지보수성을 높였습니다.

- **화면 간 이동 UX 개선:**
    - `SignInScreen`과 `SignUpScreen`이 서로를 호출할 때, 스택이 계속 쌓이는 문제를 해결하기 위해 `navigation.navigate()` 대신 `navigation.replace()`를 사용하도록 수정했습니다.
    - 회원가입 성공 후, `navigation.reset()`을 사용하여 스택을 `SignIn` 화면으로 초기화함으로써 더 나은 사용자 경험을 제공하도록 개선했습니다.

### 11. 프론트엔드: 전역 인증 상태 관리 및 영속성 구현

- **목표:** React Context API와 Keychain을 사용하여, 앱 전반에서 로그인 상태를 공유하고 앱을 재시작해도 로그인이 유지되도록 구현합니다.

- **라이브러리 설치:**
    - `pnpm --filter mobile add react-native-keychain` 명령으로 인증 토큰을 안전하게 저장할 라이브러리를 설치했습니다.

- **`AuthContext` 구현:**
    - `apps/mobile/src/contexts/AuthContext.tsx` 파일을 생성하여, `isAuthenticated` (로그인 여부)와 `isLoading` (자동 로그인 확인 중 여부) 상태를 앱 전체에서 공유할 수 있는 Context를 구현했습니다.
    - `AuthProvider` 컴포넌트로 `App.tsx`의 `RootNavigator`를 감싸, 모든 하위 컴포넌트가 인증 상태에 접근할 수 있도록 구조를 잡았습니다.

- **로그인 영속성 구현 (Keychain 연동):**
    - `AuthContext`의 `signIn` 함수에 `Keychain.setGenericPassword`를 사용하여 토큰을 저장하는 로직을 추가했습니다.
    - `signOut` 함수에는 `Keychain.resetGenericPassword`를 사용하여 토큰을 삭제하는 로직을 추가했습니다.
    - `useEffect` 훅을 사용하여 `AuthProvider`가 마운트될 때 키체인에 저장된 토큰이 있는지 비동기적으로 확인하고, 토큰이 존재하면 `isAuthenticated` 상태를 `true`로 변경하는 자동 로그인 로직을 구현했습니다.

- **화면 흐름 연결:**
    - `SignInScreen`이 로그인 뮤테이션 성공 시, `AuthContext`의 `signIn` 함수를 호출하여 전역 상태를 업데이트하도록 수정했습니다.
    - `RootNavigator`가 `AuthContext`의 `isLoading`과 `isAuthenticated` 상태를 구독하도록 수정했습니다. 이를 통해 로딩 중에는 스피너를, 로그인 상태에 따라서는 `AuthStack` 또는 `MainStack`을 조건부로 렌더링하도록 완성했습니다.

- **코드 스타일 통일:**
    - `Prettier`가 `ios`, `android`, `vendor` 폴더 등 불필요한 파일들을 포맷하려다 오류를 일으키는 문제를 해결하기 위해, `apps/mobile/.prettierignore` 파일을 추가했습니다.
    - `pnpm --filter mobile exec prettier --write .` 명령을 실행하여 `mobile` 앱의 전체 코드 스타일을 `.prettierrc.js` 규칙에 맞게 통일했습니다.