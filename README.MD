#  Fanasize

> 서로가 서로의 팬이 되는 소셜 미디어 플랫폼 (MVP)

## 1. 프로젝트 개요

**Fanasize**는 React Native와 FastAPI, Supabase를 사용하여 모바일 애플리케이션을 구축하는 과정을 담은 프로젝트입니다. 복잡한 시스템을 설계하고, 발생 가능한 기술적 문제를 해결하며, 안정적인 아키텍처를 만들어나가는 과정을 목표로 합니다.

- **작업 기간:** 2025.09 ~ 지속 개발 중
- **주요 목표:** React Native와 FastAPI를 활용하여 실제 서비스 수준의 아키텍처와 개발 프로세스를 경험하고, 모바일 애플리케이션의 전체적인 흐름을 구현하는 것을 목표로 합니다.

## 2. 주요 기능

### ✅ 구현 완료

- **사용자 인증:**
  - Supabase Auth를 이용한 이메일/비밀번호 기반 회원가입 및 로그인
  - JWT 기반 세션 관리 및 자동 갱신 (Silent Refresh)
- **게시물:**
  - 아티스트의 텍스트 및 다중 이미지 게시물 작성
  - Supabase Storage를 이용한 이미지 업로드
- **프로필:**
  - 가입 시 사용자 프로필 자동 생성 (DB Trigger)
  - 게시물에 작성자 프로필 정보(이름, 핸들, 프로필 사진) 연동

### 🗓️ 구현 예정

- **상호작용:** 게시물 '좋아요' 및 댓글 기능
- **UI/UX:** 프로필 상세 페이지
- **알림:** 신규 게시물, 댓글 등에 대한 푸시 알림 (FCM/APNS)

## 3. 기술 스택 및 아키텍처

| 구분 | 기술 | 상세 내용 |
| :--- | :--- | :--- |
| **공통** | `pnpm` (workspace) | 모노레포 구조를 통해 프론트엔드, 백엔드, 공유 타입을 효율적으로 관리 |
| **Frontend** | `React Native`, `TypeScript` | iOS/Android 크로스플랫폼 모바일 앱 개발 |
| | `Apollo Client` | GraphQL 서버와의 데이터 통신 및 캐시 관리 |
| | `Zustand` | 간결하고 효율적인 전역 상태 관리 |
| | `styled-components` | 컴포넌트 기반의 동적 스타일링 |
| **Backend** | `Python`, `FastAPI` | 현대적이고 빠른 고성능 웹 프레임워크 |
| | `Strawberry` | 코드 우선(Code-first) 방식의 GraphQL API 구현 |
| **Database** | `Supabase` (PostgreSQL) | 데이터베이스, 인증, 스토리지, 서버리스 함수 등 백엔드 기능 제공 |

<br/>

## 4. 프로젝트 구조 (모노레포)

`pnpm` 워크스페이스를 사용하여 프론트엔드와 백엔드 프로젝트를 하나의 레포지토리에서 관리합니다.

```
/fanasize/
├── apps/
│   ├── mobile/      # React Native (Frontend)
│   └── server/      # FastAPI (Backend)
├── package.json
└── pnpm-workspace.yaml
```

## 5. 주요 개발 기록 및 트러블슈팅

### Metro 번들러의 모노레포 의존성 문제 해결

- **문제점:** React Native의 Metro 번들러는 기본적으로 프로젝트 외부(상위 디렉토리)에 있는 모노레포의 `node_modules`를 인식하지 못하여 'unknown module' 오류를 발생시켰습니다.
- **해결 과정:**
  - `metro.config.js`에 `watchFolders` 옵션을 추가하여, Metro 번들러가 pnpm 워크스페이스의 루트 디렉토리(`fanasize/`)를 감시하도록 설정했습니다.
- **결과:** 이 설정을 통해 pnpm 워크스페이스 환경에서 React Native 프로젝트가 모노레포 루트의 의존성을 정상적으로 사용하도록 만들었습니다.

### GraphQL API 서버의 안정적인 DB 커넥션 관리

- **문제점:** API 요청마다 DB 클라이언트를 생성하여 비효율적이고 연결 수 제한 문제가 발생할 수 있었습니다.
- **해결 과정:** FastAPI의 `lifespan` 이벤트를 활용하여, 서버 시작 시 Supabase 클라이언트를 초기화하고 종료 시 해제하는 컨텍스트 매니저를 구현했습니다. 이를 통해 애플리케이션 전체 생명주기 동안 단일 클라이언트 인스턴스를 유지하고 재사용할 수 있게 되었습니다.
- **결과:** 안정적이고 효율적인 데이터베이스 커넥션 관리 아키텍처를 구축했습니다.

## 6. Git 커밋 컨벤션

프로젝트의 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 명세를 따릅니다.
