# API Contract

현재 API 서버는 FastAPI + mock repository 기반이다. 모든 응답은 현재 구현된 Pydantic DTO shape를 따른다.

## Base

- Local API base URL: `http://127.0.0.1:8000`

## Error Response

현재 에러 응답은 FastAPI 기본 형식을 사용한다.

```json
{
  "detail": "Exam not found"
}
```

주요 404 케이스:

- 존재하지 않는 `examId`
- 존재하지 않는 `sessionId`
- 존재하지 않는 `resultId`

## Session Status

- `in_progress`: 세션 생성 후 진행 중
- `submitted`: 사용자가 제출 완료, 아직 worker 처리 없음
- `grading`: schema에는 정의되어 있으나 현재 mock 구현에서는 사용하지 않음
- `completed`: schema에는 정의되어 있으나 현재 mock 구현에서는 사용하지 않음
- `failed`: schema에는 정의되어 있으나 현재 mock 구현에서는 사용하지 않음

## Endpoints

### `GET /health`

응답 예시:

```json
{
  "status": "ok"
}
```

### `GET /exams`

설명: 시험 목록 요약 조회

응답 예시:

```json
[
  {
    "id": "opic-mock-a",
    "title": "OPIC 모의고사 A",
    "tag": "모의고사",
    "questionCount": 15,
    "estimatedMinutes": 15,
    "difficulty": "medium",
    "mode": "mock",
    "icon": "document",
    "description": null
  }
]
```

### `GET /exams/{examId}`

설명: 단일 시험 요약 조회

응답 예시:

```json
{
  "id": "opic-mock-a",
  "title": "OPIC 모의고사 A",
  "tag": "모의고사",
  "questionCount": 15,
  "estimatedMinutes": 15,
  "difficulty": "medium",
  "mode": "mock",
  "icon": "document",
  "description": null
}
```

### `GET /exams/{examId}/questions`

설명: 시험 문항 목록 조회. `order` 오름차순으로 반환한다.

응답 예시:

```json
[
  {
    "id": "opic-mock-a-q1",
    "examId": "opic-mock-a",
    "order": 1,
    "type": "self_intro",
    "ttsScriptEn": "Please introduce yourself. Include your work or studies and your interests.",
    "prepSeconds": 30,
    "answerSeconds": 60
  }
]
```

### `POST /sessions`

설명: 시험 응시 세션 생성

Request body:

```json
{
  "examId": "opic-mock-a"
}
```

응답 예시:

```json
{
  "id": "session-12345678-1234-1234-1234-123456789abc",
  "examId": "opic-mock-a",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 1,
  "answers": [],
  "submittedAt": null
}
```

### `GET /sessions/{sessionId}`

설명: 세션 상태 조회

응답 예시:

```json
{
  "id": "session-12345678-1234-1234-1234-123456789abc",
  "examId": "opic-mock-a",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 1,
  "answers": [],
  "submittedAt": null
}
```

### `POST /sessions/{sessionId}/answers`

설명: 답변 메타데이터 저장. 실제 파일 업로드는 아직 없다.

Request body:

```json
{
  "questionId": "opic-mock-a-q1",
  "questionOrder": 1,
  "durationSeconds": 28,
  "audioFileName": "q1.webm",
  "mimeType": "audio/webm"
}
```

응답 예시:

```json
{
  "id": "session-12345678-1234-1234-1234-123456789abc",
  "examId": "opic-mock-a",
  "status": "in_progress",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 2,
  "answers": [
    {
      "questionId": "opic-mock-a-q1",
      "questionOrder": 1,
      "durationSeconds": 28,
      "audioFileName": "q1.webm",
      "mimeType": "audio/webm",
      "recordedAt": "2026-05-15T01:24:30.123456+00:00"
    }
  ],
  "submittedAt": null
}
```

### `POST /sessions/{sessionId}/submit`

설명: 세션 제출

Request body: 없음

응답 예시:

```json
{
  "id": "session-12345678-1234-1234-1234-123456789abc",
  "examId": "opic-mock-a",
  "status": "submitted",
  "resultId": null,
  "startedAt": "2026-05-15T01:23:45.678901+00:00",
  "currentQuestionOrder": 2,
  "answers": [
    {
      "questionId": "opic-mock-a-q1",
      "questionOrder": 1,
      "durationSeconds": 28,
      "audioFileName": "q1.webm",
      "mimeType": "audio/webm",
      "recordedAt": "2026-05-15T01:24:30.123456+00:00"
    }
  ],
  "submittedAt": "2026-05-15T01:25:00.000000+00:00"
}
```

### `GET /results/{resultId}`

설명: 결과 상세 조회. `/result` 페이지가 바로 사용할 수 있는 구조다.

응답 예시:

```json
{
  "id": "result-opic-mock-a-20240514",
  "examId": "opic-mock-a",
  "examTitle": "OPIC 모의고사 A",
  "takenAt": "2024-05-14T14:20:00+09:00",
  "questionCount": 15,
  "totalScore": 82,
  "maxScore": 100,
  "scores": [
    {
      "category": "question_relevance",
      "label": "질문 정확성",
      "score": 84,
      "maxScore": 100
    }
  ],
  "answers": [
    {
      "questionId": "opic-mock-a-q3",
      "questionOrder": 3,
      "questionPrompt": "당신의 스마트폰 사용 습관에 대해 설명하고, 바꾸고 싶은 점이 있다면 말해보세요.",
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
    "resultId": "result-opic-mock-a-20240514",
    "examId": "opic-mock-a",
    "examTitle": "OPIC 모의고사 A",
    "takenAt": "2024-05-14T14:20:00+09:00",
    "questionCount": 15,
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

- 데이터 저장소는 in-memory session store + JSON fixture 조합이다.
- 서버 재시작 시 `sessions`와 답변 메타데이터는 모두 사라진다.
- `POST /sessions/{sessionId}/submit`는 worker를 호출하지 않고 상태만 `submitted`로 바꾼다.
- `resultId`는 세션 제출 후 자동 생성되지 않는다.
- 사용자 인증이 없어서 `/me/*`는 항상 같은 mock user 기준이다.
- 원본 오디오 업로드, 파일 저장, presigned URL 발급이 없다.

## Next Integration Changes

- DB 연결 시 변경:
  - `sessions`, `answers`, `results`, `histories`, `users`가 repository 내부 JSON/in-memory 구현에서 DB query로 바뀐다.
  - `sessionId`, `resultId`, `startedAt`, `submittedAt`는 DB row 기준으로 관리된다.

- Worker 연결 시 변경:
  - `POST /sessions/{sessionId}/submit`는 단순 상태 변경 대신 queue enqueue를 수행한다.
  - 세션 상태가 `submitted -> grading -> completed|failed` 흐름으로 실제 사용된다.
  - `GET /results/{resultId}`는 worker 완료 후 생성된 결과를 읽게 된다.

- 업로드 연결 시 변경:
  - `POST /sessions/{sessionId}/answers`는 메타데이터만 받는 구조에서 업로드 참조나 파일 key를 함께 다루게 될 가능성이 높다.
  - 현재 `audioFileName`, `mimeType`는 mock 필드이며 저장 정책이 확정되면 shape가 바뀔 수 있다.
