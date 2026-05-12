# AI Agent Development Specification: "Now & Then" Todo Web App

## 1. 프로젝트 개요 (Project Overview)

- **프로젝트 명:** Now & Then (나우 앤 댄)
- **목적:** 기한이 정해진 일(Now)과 미정인 아이디어(Then)를 효율적으로 분리하여 관리하는 웹 기반 투두 애플리케이션의 빠른 MVP 개발.
- **인증 범위:** MVP 단계에서는 인증 없이 단일 유저 환경으로 구현한다. Supabase RLS는 비활성화 상태로 시작하며, 인증 기능은 향후 확장 과제로 남긴다.

---

## 2. 기술 스택 (Tech Stack)

- **프론트엔드 및 프레임워크:** Next.js (App Router 권장)
- **스타일링:** Tailwind CSS
- **백엔드 및 데이터베이스:** Supabase (PostgreSQL)
- **언어:** TypeScript (안정성 및 AI 코드 생성 정확도 향상 목적)
- **날짜 처리:** `date-fns` (날짜 포맷팅 및 로컬 변환)

> **Node.js 버전:** `>=20.9.0` 필수. Next.js 16은 Node 18에서 설치가 불완전하게 되어 `dist/bin/next` 모듈 누락 오류가 발생한다.

---

## 3. 핵심 화면 구조 및 UI/UX (Core UI/UX Layout)

화면은 명확한 사용성을 위해 다음 3가지 섹션으로 구성되어야 한다.

- **Section 1. 날짜 선택 (Date Picker):** 사용자가 특정 날짜를 지정할 수 있는 UI. 기본값은 오늘 날짜.

- **Section 2. Now (선택한 날짜의 Todo):** Section 1에서 선택된 날짜에 할당된 구체적인 할 일 목록. 추가, 체크(완료), 삭제 기능 포함.

- **Section 3. Then (날짜가 정해지지 않은 Todo):** 기한은 없으나 잊지 않고 보관해야 할 '미정' 할 일 목록.
  - 각 항목에는 **날짜 지정 버튼**이 있으며, 클릭 시 인라인 날짜 피커(date input)가 노출된다.
  - 날짜를 선택하면 해당 태스크의 `target_date`가 업데이트되고, Then 목록에서 제거되어 Now 섹션에 반영된다.

### 빈 상태 (Empty State)

- Now 섹션이 비어 있을 때: `"오늘 할 일이 없어요. Then에서 날짜를 지정해보세요."` 안내 문구 표시
- Then 섹션이 비어 있을 때: `"보관된 아이디어가 없어요. 자유롭게 추가해보세요."` 안내 문구 표시

---

## 4. 데이터베이스 스키마 요구사항 (Database Schema - Supabase)

`tasks` 테이블을 기준으로 다음의 스키마 구조를 생성할 것.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | Primary Key, `gen_random_uuid()` 기본값 |
| `title` | TEXT | 할 일 내용, 필수값 |
| `is_completed` | BOOLEAN | 완료 여부, 기본값 `false` |
| `target_date` | DATE \| NULL | 지정된 날짜. 값이 존재하면 'Now', `null`이면 'Then'으로 분류 |
| `created_at` | TIMESTAMPTZ | 생성 시간, 기본값 `now()` |

> **타임존 처리:** `target_date`는 UTC 기준 `DATE` 타입으로 저장한다. 클라이언트에서 날짜를 표시할 때는 `date-fns` 등의 라이브러리를 사용하여 사용자 로컬 기준으로 변환하여 렌더링한다.

---

## 5. 환경 변수 (Environment Variables)

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 항목을 설정할 것.

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 6. 단계별 구현 지침 (Implementation Steps)

AI 에이전트는 다음 순서에 따라 코드를 작성하고 환경을 구성할 것.

### Step 1: 초기 세팅 (Setup)

- TypeScript와 Tailwind CSS가 적용된 Next.js 프로젝트 설정.
- 아래 패키지 설치:
  ```bash
  npm install @supabase/supabase-js date-fns
  ```
- `.env.local` 파일 템플릿 작성 (Section 5 참고).
- Supabase 클라이언트 싱글톤 파일(`/lib/supabaseClient.ts`) 생성.

> **Windows 환경 참고:** `localhost:3000` 접속이 안 될 경우 `127.0.0.1:3000`으로 접속한다. Windows에서 `localhost`가 IPv6(`::1`)로 해석되어 발생하는 이슈다.

### Step 2: UI 컴포넌트 개발 (Components)

- 'Now'와 'Then' 두 영역이 시각적으로 명확히 대비되는 메인 레이아웃 구축.
- 재사용 가능한 `TaskItem`, `TaskList`, `TaskInput` UI 컴포넌트 작성.
- 빈 상태(Empty State) UI 포함.

### Step 3: 상태 관리 및 데이터 연동 (Data Fetching)

- `useTasks` Custom Hook을 작성하여 CRUD(생성, 읽기, 수정, 삭제) 로직을 UI와 분리.
- `target_date` 유무에 따라 데이터를 필터링하여 화면의 두 섹션('Now', 'Then')에 각각 매핑.
- Then → Now 이동: `target_date` 업데이트 후 로컬 상태를 즉시 반영(Optimistic Update 권장).

### Step 4: 스타일링 (Refinement)

Tailwind CSS를 활용하여 아래 디자인 가이드에 맞게 스타일링한다.

| 항목 | 값 |
|---|---|
| 배경색 | `#F5F0E8` (크림 화이트) |
| Now 섹션 강조색 | `#1A1A1A` (딥 블랙) |
| Then 섹션 강조색 | `#6B7280` (미디엄 그레이) |
| 완료 항목 텍스트 | `line-through`, `text-gray-400` |
| 기본 폰트 | `font-mono` (Tailwind 내장) |
| 다크모드 | 미지원 (MVP 단계) |
| 모서리 스타일 | `rounded-none` — 직선 중심의 미니멀 컨셉 |

---

## 7. 깃 커밋 컨벤션 (Git Commit Convention)

모든 커밋 메시지는 **Gitmoji** 스타일을 따른다.

### 형식

```
<emoji> <type>: <subject>

[optional body]
```

### 주요 이모지 목록

| 이모지 | 타입 | 설명 |
|---|---|---|
| 🎉 | `init` | 프로젝트 초기 세팅 |
| ✨ | `feat` | 새로운 기능 추가 |
| 🐛 | `fix` | 버그 수정 |
| ♻️ | `refactor` | 코드 리팩토링 (기능 변경 없음) |
| 💄 | `style` | UI / 스타일 변경 |
| 🗃️ | `db` | 데이터베이스 스키마 변경 |
| 🔧 | `chore` | 설정 파일, 빌드 스크립트 수정 |
| 📝 | `docs` | 문서 작성 및 수정 |
| 🚀 | `deploy` | 배포 관련 작업 |
| 🧪 | `test` | 테스트 추가 및 수정 |
| 🔥 | `remove` | 코드 또는 파일 삭제 |
| 🩹 | `patch` | 간단한 수정 / 임시 패치 |

### 예시

```
✨ feat: Then 섹션에서 날짜 지정 기능 추가

인라인 date input을 통해 target_date를 설정하면
Then 목록에서 제거되고 Now 섹션으로 이동한다.
```

---

## 8. AI 에이전트 코딩 컨벤션 규칙 (Coding Guidelines)

- **TypeScript:** 모든 컴포넌트의 Props, State 및 Supabase 응답 객체에 대해 엄격한 타입(`Interface` / `Type`)을 정의할 것.
- **컴포넌트 분리:** 데이터 통신 로직과 UI 렌더링을 분리하여 작성할 것 (`useTasks` Custom Hook 활용).
- **렌더링 방식:** Next.js App Router 생태계에 맞춰, 사용자 상호작용(상태 관리)이 필요한 곳에만 최소한으로 `"use client"` 지시어를 사용할 것.
- **에러 핸들링:** Supabase 데이터베이스 작업 실패 시 콘솔 에러 로깅 및 사용자에게 보여줄 예외 처리 코드를 반드시 포함할 것.
- **정렬 기준:** Now 섹션은 `created_at` 오름차순, Then 섹션은 `created_at` 내림차순으로 정렬한다.
