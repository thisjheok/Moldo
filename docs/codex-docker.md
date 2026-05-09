## Codex Docker Setup

이 프로젝트는 `Codex CLI는 Docker 컨테이너 안에서`, 실제 앱 실행은 `호스트(macOS)`에서 수행하는 방식을 기준으로 한다.

### 목적

- Codex CLI 실행 환경 격리
- Docker 디스크 사용량 최소화
- FE/BE 개발 서버와 브라우저/오디오 장치 접근은 호스트에서 유지

### 포함 파일

- `Dockerfile.codex`
- `docker-compose.codex.yml`

### 1. 사전 준비

호스트에 아래가 설치되어 있어야 한다.

- Docker Desktop
- OpenAI API 키 또는 Codex CLI 로그인에 사용할 계정

### 2. 컨테이너 빌드

```bash
docker compose -f docker-compose.codex.yml build
```

### 3. 컨테이너 실행

권장 방식 1: 호스트에서 ChatGPT 로그인 후 컨테이너에서 재사용

브라우저 기반 `codex --login`은 Docker 컨테이너 안에서 실행하면 `localhost` 콜백 문제로 실패할 수 있다. 따라서 ChatGPT 로그인이 필요하면 호스트에서 먼저 로그인하고, 호스트의 `~/.codex`를 컨테이너에 마운트해 재사용하는 방식을 권장한다.

호스트에서 1회 로그인:

```bash
npx @openai/codex@latest --login
```

로그인이 완료되면 이후 컨테이너에서는 바로 사용할 수 있다.

```bash
docker compose -f docker-compose.codex.yml run --rm codex
```

컨테이너 안에서:

```bash
codex
```

권장 방식 2: API 키 방식

ChatGPT 로그인 대신 API 키를 쓰면 Docker 안에서도 별도 브라우저 콜백 없이 바로 실행할 수 있다.

```bash
export OPENAI_API_KEY="<YOUR_KEY>"
docker compose -f docker-compose.codex.yml run --rm codex
```

컨테이너 안에서:

```bash
codex
```

비권장 방식: 컨테이너 안에서 직접 `codex --login`

```bash
docker compose -f docker-compose.codex.yml run --rm codex
```

컨테이너 안에서:

```bash
codex --login
```

이 방식은 브라우저가 호스트에서 열리더라도 OAuth 콜백용 `localhost`가 컨테이너 기준으로 잡혀 실패할 수 있다.

`docker-compose.codex.yml`은 호스트의 `~/.codex`를 컨테이너의 `/root/.codex`에 연결하므로 로그인 상태와 Codex 설정이 재사용된다.

필요하면 이후에 `docker-compose.codex.yml`에 아래 같은 read-only mount를 직접 추가할 수 있다.

```yaml
volumes:
  - ${HOME}/.gitconfig:/root/.gitconfig:ro
  - ${HOME}/.ssh:/root/.ssh:ro
```

### 4. 앱은 호스트에서 실행

예시:

```bash
# host shell
cd frontend && npm run dev
cd backend && npm run dev
```

컨테이너 안의 Codex가 호스트 서버에 접근해야 하면 `host.docker.internal`을 사용한다.

예시:

- 호스트 FE: `http://localhost:3000`
- 컨테이너에서 접근: `http://host.docker.internal:3000`

### 5. 권장 사용 방식

- 기본: `codex`
- 파일 자동 수정: `codex --auto-edit`
- 샌드박스 자동 실행: `codex --full-auto`

주의:

- OpenAI 공식 안내 기준으로 `--full-auto`는 네트워크가 제한된 샌드박스 실행 모드다.
- 네트워크 접근이 필요한 작업은 기본 모드 또는 `--auto-edit`가 더 현실적이다.

### 6. 디스크 절약 팁

- 작업 후 오래된 이미지 정리:

```bash
docker image prune -a
docker builder prune
```

- 현재 사용량 확인:

```bash
docker system df
```

### 7. 운영 원칙

- 앱 프로세스는 호스트에서 실행
- Codex는 컨테이너 안에서만 실행
- 원본 음성 저장 정책과 별개로, 호스트의 `~/.codex`만 컨테이너에서 재사용
- 대형 로컬 AI 모델은 사용하지 않고 외부 API 기반으로 개발
