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
