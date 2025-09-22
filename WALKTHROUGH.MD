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

### 6. 백엔드: 회원가입(signUp) Mutation 구현

- **GraphQL 타입 정의:**
    - `apps/server/graphql/types.py` 파일을 생성하고, `User` 타입을 `strawberry`를 이용해 정의했습니다.

- **Mutation 구현:**
    - `apps/server/graphql/mutations.py` 파일을 생성하여 `signUp` 뮤테이션을 구현했습니다.
    - 이 뮤테이션은 이메일과 비밀번호를 인자로 받아 `supabase_client.auth.sign_up`을 호출하여 실제 사용자 생성을 요청합니다.

### 7. 디버깅 과정

- **`ImportError`:** `uvicorn` 실행 시 상대 경로 임포트 문제를 해결하기 위해, 실행 위치를 `apps/` 디렉토리로 변경하고 `server.main:app`과 같이 모듈 형태로 앱을 실행하도록 명령어를 수정했습니다.
- **`NameError`:** `dependencies.py`에서 `load_dotenv` 함수를 임포트하지 않은 문제를 해결했습니다.
- **`strawberry` 명명 규칙:** GraphQL 쿼리 시 `created_at` 필드를 찾지 못하는 문제를 통해, `strawberry`가 파이썬의 `snake_case`를 GraphQL의 `camelCase`로 자동 변환하는 특징을 학습하고 쿼리를 `createdAt`으로 수정했습니다.
- **"Invalid Email" 오류:** Supabase 프로젝트 대시보드에서 'Email' 공급자가 비활성화되어 있던 것을 발견하고 활성화하여 문제를 해결했습니다.
- **`await` 관련 `TypeError`:** `supabase` 라이브러리가 동기(synchronous) 방식으로 동작함에도 불구하고, 비동기(asynchronous)로 잘못 가정하여 추가했던 `async/await` 키워드를 `mutations.py`에서 다시 제거하여 최종적으로 문제를 해결했습니다.