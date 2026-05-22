# Now & Then

기한이 정해진 일(Now)과 미정인 아이디어(Then)를 효율적으로 분리하여 관리하는 웹 기반 투두 앱.

---

## 주요 기능

- **달력 뷰** — 날짜별 투두 완료/미완료 현황을 점으로 시각화.
- **Now** — 선택한 날짜에 할당된 할 일 목록. 추가, 완료 체크, 삭제, 인라인 제목 수정 지원.
- **Then** — 기한 미정 아이디어 보관함. 날짜를 지정하면 자동으로 Now 섹션으로 이동.

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 스타일링 | Tailwind CSS |
| 백엔드/DB | Supabase (PostgreSQL) |
| 언어 | TypeScript |
| 날짜 처리 | date-fns |

---

## 시작하기

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 프로젝트 정보를 입력합니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 또는 [http://127.0.0.1:3000](http://127.0.0.1:3000) 으로 접속합니다.

> Windows에서 `localhost`가 IPv6(`::1`)로 해석될 경우 `127.0.0.1:3000`으로 접속하세요.

---

## 데이터베이스 스키마

Supabase에서 아래 `tasks` 테이블을 생성합니다.

```sql
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  is_completed boolean not null default false,
  target_date date,
  created_at  timestamptz not null default now()
);
```

- `target_date`가 있으면 **Now**, `null`이면 **Then**으로 분류됩니다.

---

## 요구 사항

- Node.js >= 20.9.0
