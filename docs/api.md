# API Contract

현재 API 서버는 FastAPI + mock repository 기반이다. 모든 응답은 현재 구현된 Pydantic DTO shape를 따른다.

## Base

- Local API base URL: `http://localhost:8000`

## Authentication

FastAPI is the authentication owner. The API issues a signed cookie session named `moldo_session` by default, and protected endpoints require that cookie.

Initial users are seeded into SQLite from `MOLDO_AUTH_USERS` as a JSON array:

```json
[
  {
    "id": "user-1",
    "email": "hong@example.com",
    "password": "password",
    "name": "홍길동"
  }
]
```

Deployment settings:

- `MOLDO_ENV`: set to `production` in production; then `MOLDO_SESSION_SECRET` is required
- `MOLDO_DATABASE_PATH`: local SQLite file path, default `apps/api/.data/moldo.sqlite3`
- `MOLDO_SESSION_SECRET`: required secret for signing cookie sessions
- `MOLDO_SESSION_COOKIE`: cookie name, default `moldo_session`
- `MOLDO_SESSION_MAX_AGE_SECONDS`: default `1209600`
- `MOLDO_SESSION_SAME_SITE`: `lax`, `strict`, or `none`
- `MOLDO_SESSION_HTTPS_ONLY`: set to `true` behind HTTPS
- `MOLDO_SESSION_DOMAIN`: optional shared cookie domain

Protected endpoint groups:

- `/attempts`
- `/sessions`
- `/results`
- `/me`

## Error Response

현재 에러 응답은 FastAPI 기본 형식을 사용한다.

```json
{
  "detail": "Exam not found"
}
```

주요 404 케이스:

- 존재하지 않는 `examId`
- 존재하지 않는 `attemptId`
- 존재하지 않는 `sessionId`
- 존재하지 않는 `resultId`

주요 401 케이스:

- 로그인하지 않은 상태에서 보호 endpoint 호출
- 세션에 저장된 사용자가 현재 설정에 없는 경우

## Attempt Status

- `in_progress`: 응시 생성 후 진행 중
- `submitted`: 제출 접수 상태. 현재 mock 구현에서는 submit 직후 바로 `grading`으로 전환됨
- `grading`: worker 처리 중
- `completed`: worker 처리 완료, `resultId` 생성됨
- `failed`: worker 처리 실패

## Endpoints

### `GET /health`

응답 예시:

```json
{
  "status": "ok"
}
```

### `POST /auth/login`

설명: 이메일/비밀번호로 로그인하고 signed cookie session을 발급한다.

Request body:

```json
{
  "email": "hong@example.com",
  "password": "password"
}
```

응답 예시:

```json
{
  "user": {
    "id": "user-1",
    "email": "hong@example.com",
    "name": "홍길동"
  }
}
```

### `GET /auth/me`

설명: 현재 cookie session의 사용자 조회

응답 예시:

```json
{
  "user": {
    "id": "user-1",
    "email": "hong@example.com",
    "name": "홍길동"
  }
}
```

### `POST /auth/logout`

설명: 현재 cookie session 제거

응답: `204 No Content`

### `GET /exams`

설명: 시험 목록 요약 조회

응답 예시:

```json
[
  {
    "id": "speaking-mock-1",
    "title": "말하기 모의고사 1",
    "tag": "말하기 모의고사",
    "questionCount": 12,
    "estimatedMinutes": 24,
    "difficulty": "medium",
    "mode": "mock",
    "icon": "document",
    "description": "실제 시험형 흐름에 맞춰 자기소개, 일상 주제, 경험 설명, 비교, 롤플레이, 문제 해결 문항을 순서대로 연습합니다."
  }
]
```

### `GET /exams/{examId}`

설명: 단일 시험 요약 조회

응답 예시:

```json
{
  "id": "speaking-mock-1",
  "title": "말하기 모의고사 1",
  "tag": "말하기 모의고사",
  "questionCount": 12,
  "estimatedMinutes": 24,
  "difficulty": "medium",
  "mode": "mock",
  "icon": "document",
  "description": "실제 시험형 흐름에 맞춰 자기소개, 일상 주제, 경험 설명, 비교, 롤플레이, 문제 해결 문항을 순서대로 연습합니다."
}
```

### `GET /exams/{examId}/questions`

설명: 시험 문항 목록 조회. `order` 오름차순으로 반환한다.

응답 예시:

```json
[
  {
    "id": "speaking-mock-1-q1",
    "examId": "speaking-mock-1",
    "order": 1,
    "type": "self_intro",
    "ttsScriptEn": "Let's begin. Please introduce yourself. Talk about what you do, where you spend most of your day, and one interest that is important to you.",
    "prepSeconds": 30,
    "answerSeconds": 90
  }
]
```

### `POST /attempts`

설명: 시험 템플릿인 `examId`와 분리된 1회 응시 `attemptId`를 생성한다.

Request body:

```json
{
  "examId": "speaking-mock-1"
}
```

응답 예시:

```json
{
  "id": "attempt-12345678-1234-1234-1234-123456789abc",
  "examId": "speaking-mock-1",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 1,
  "answers": [],
  "submittedAt": null
}
```

### `GET /attempts/{attemptId}`

설명: 응시 상태와 문항별 업로드 메타데이터 조회

응답 예시:

```json
{
  "id": "attempt-12345678-1234-1234-1234-123456789abc",
  "examId": "speaking-mock-1",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 1,
  "answers": [],
  "submittedAt": null
}
```

### `POST /attempts/{attemptId}/answers/{questionId}/audio`

설명: 문항별 오디오 파일 업로드. request body는 raw audio bytes이며, `Content-Type`으로 오디오 MIME type을 전달한다.

Query parameters:

```txt
questionOrder=1
durationSeconds=28
audioFileName=q1.webm
```

응답 예시:

```json
{
  "id": "attempt-12345678-1234-1234-1234-123456789abc",
  "examId": "speaking-mock-1",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 2,
  "answers": [
    {
      "questionId": "speaking-mock-1-q1",
      "questionOrder": 1,
      "durationSeconds": 28,
      "audioFileName": "q1.webm",
      "mimeType": "audio/webm",
      "audioStorageKey": "attempts/attempt-12345678-1234-1234-1234-123456789abc/speaking-mock-1-q1-abcd1234.webm",
      "audioUrl": "/uploads/attempts/attempt-12345678-1234-1234-1234-123456789abc/speaking-mock-1-q1-abcd1234.webm",
      "uploadedAt": "2026-05-15T01:24:30.123456+00:00",
      "recordedAt": "2026-05-15T01:24:30.123456+00:00"
    }
  ],
  "submittedAt": null
}
```

### `POST /attempts/{attemptId}/submit`

설명: 응시 제출. submit 직후 `grading`으로 전환하고 `grading_jobs` 큐에 채점 작업을 등록한다. API는 채점 작업을 직접 수행하지 않는다. 별도 worker 프로세스가 큐에서 작업을 가져가 STT/LLM 평가를 실행하고, 완료 후 `resultId`를 생성한다.

Request body: 없음

응답 예시:

```json
{
  "id": "attempt-12345678-1234-1234-1234-123456789abc",
  "examId": "speaking-mock-1",
  "status": "grading",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 2,
  "answers": [
    {
      "questionId": "speaking-mock-1-q1",
      "questionOrder": 1,
      "durationSeconds": 28,
      "audioFileName": "q1.webm",
      "mimeType": "audio/webm",
      "audioStorageKey": "attempts/attempt-12345678-1234-1234-1234-123456789abc/speaking-mock-1-q1-abcd1234.webm",
      "audioUrl": "/uploads/attempts/attempt-12345678-1234-1234-1234-123456789abc/speaking-mock-1-q1-abcd1234.webm",
      "uploadedAt": "2026-05-15T01:24:30.123456+00:00",
      "recordedAt": "2026-05-15T01:24:30.123456+00:00"
    }
  ],
  "submittedAt": "2026-05-15T01:25:00.000000+00:00"
}
```

### Legacy `POST /sessions`

설명: 이전 mock 세션 API. 신규 플로우는 `/attempts`를 사용한다.

### `GET /results/{resultId}`

설명: 결과 상세 조회. `/result` 페이지가 바로 사용할 수 있는 구조다.

응답 예시:

```json
{
  "id": "result-speaking-mock-1-20240514",
  "examId": "speaking-mock-1",
  "examTitle": "말하기 모의고사 1",
  "takenAt": "2024-05-14T14:20:00+09:00",
  "questionCount": 12,
  "totalScore": 82,
  "maxScore": 100,
  "scores": [
    {
      "category": "relevance",
      "label": "질문 적합성",
      "score": 84,
      "maxScore": 100
    }
  ],
  "answers": [
    {
      "questionId": "speaking-mock-1-q4",
      "questionOrder": 4,
      "questionPrompt": "Describe an electronic device you use often. Explain what it looks like, how you use it, and why it is useful in your daily life.",
      "transcript": "I use my smartphone a lot every day.\nI check SNS and watch videos.\nSometimes it wastes my time.\nI want to use it less.",
      "modelAnswer": "I use my smartphone a lot every day, especially for SNS and watching videos. However, it often wastes my time, so I want to reduce my screen time and use it more productively.",
      "audioUrl": "/mock-audio/my-answer-smartphone.mp3",
      "durationSeconds": 28,
      "modelAnswerAudioUrl": "/mock-audio/model-answer-smartphone.mp3",
      "modelAnswerDurationSeconds": 31,
      "strengths": ["질문의 핵심 내용을 모두 포함했어요.", "간단한 문장으로 자신의 생각을 표현했어요."],
      "improvements": ["접속사(However, so 등)를 활용해 보세요.", "구체적인 예시를 추가하면 더 좋아요."]
    }
  ]
}
```

### `GET /me/results`

설명: 마이페이지 응시 기록 목록 조회

응답 예시:

```json
[
  {
    "id": "history-1",
    "resultId": "result-speaking-mock-1-20240514",
    "examId": "speaking-mock-1",
    "examTitle": "말하기 모의고사 1",
    "takenAt": "2024-05-14T14:20:00+09:00",
    "questionCount": 12,
    "totalScore": 82,
    "maxScore": 100,
    "durationSeconds": 918
  }
]
```

### `GET /me/profile`

설명: mock 사용자 프로필 조회

응답 예시:

```json
{
  "id": "user-1",
  "name": "홍길동",
  "email": "hong@example.com",
  "totalExamCount": 12
}
```

### `GET /me/histories`

설명: `GET /me/results`의 legacy alias. 현재는 같은 데이터를 반환한다.

## Mock Stage Limits

- 데이터 저장소는 SQLite attempt/session/result/user store + JSON fixture 조합이다.
- 시험 템플릿과 기본 mock 결과/히스토리는 아직 `packages/mock-data` fixture에서 읽는다.
- 업로드 파일은 로컬 디스크 `apps/api/.data/uploads`에 저장된다.
- `POST /attempts/{attemptId}/submit`는 SQLite 기반 `grading_jobs` 큐에 채점 작업을 등록한다.
- 로컬 worker는 `python -m moldo_api.worker` 또는 설치된 환경의 `moldo-worker`로 실행한다.
- mock worker 완료 시 attempt 상태가 `completed`가 되고 `resultId`가 생성된다.
- 인증은 signed cookie session 기반이며, 사용자 계정은 SQLite에 seed/upsert된다.
- presigned URL 발급은 아직 없다.

## Next Integration Changes

- DB 확장 시 변경:
  - 현재 `answers`와 `results`는 SQLite JSON payload로 저장한다. 검색/분석 요구가 생기면 별도 정규화 테이블로 분리한다.
  - 시험 템플릿 fixture를 DB로 옮기면 `exams`, `exam_questions` 테이블을 추가한다.
  - `examId`는 시험 템플릿 참조이고, `resultId`는 worker가 생성한 결과 참조로 분리 유지한다.

- Worker 연결 시 변경:
  - 현재는 로컬 SQLite `grading_jobs` 테이블이 큐 역할을 한다.
  - Redis/RQ/Celery를 도입할 때는 `moldo_api.queues.grading_queue` adapter를 교체한다.
  - attempt 상태는 `grading -> completed|failed` 흐름으로 사용된다.
  - `GET /results/{resultId}`는 worker 완료 후 생성된 결과를 읽게 된다.

- 업로드 연결 시 변경:
  - `AudioStorage` 구현을 로컬 디스크에서 S3/R2/GCS 같은 오브젝트 스토리지 구현으로 교체한다.
  - API는 문항별 업로드 방식을 유지한다.
