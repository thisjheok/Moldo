type IconName =
  | "chevron"
  | "clipboard"
  | "document"
  | "info"
  | "lightbulb"
  | "message"
  | "refresh"
  | "search"
  | "target"
  | "user";

const exams = [
  {
    title: "모의고사 A",
    tag: "모의고사",
    questions: "15",
    time: "약 15분",
    difficulty: "중",
    type: "종합",
    icon: "document" as IconName,
  },
  {
    title: "모의고사 B",
    tag: "모의고사",
    questions: "15",
    time: "약 15분",
    difficulty: "상",
    type: "종합",
    icon: "document" as IconName,
  },
  {
    title: "실전형 세션",
    tag: "실전",
    questions: "12",
    time: "약 12분",
    difficulty: "중상",
    type: "실전",
    icon: "target" as IconName,
  },
  {
    title: "주제별 연습",
    tag: "연습",
    questions: "10~20",
    time: "약 10~20분",
    difficulty: "하~상",
    type: "주제별",
    icon: "message" as IconName,
  },
];

const recentRecords = [
  {
    title: "모의고사 A",
    date: "2024-05-14 14:32",
    status: "진행 중",
    progress: 62,
  },
  {
    title: "실전형 세션",
    date: "2024-05-10 16:30",
    status: "완료",
    score: "82점 / 100점",
  },
  {
    title: "모의고사 B",
    date: "2024-04-28 11:15",
    status: "완료",
    score: "78점 / 100점",
  },
];

const filters = ["난이도 전체", "문항 수 전체", "예상 시간 전체", "유형 전체"];

const guideItems = [
  "시험은 실제 시험과 유사한 환경에서 진행됩니다.",
  "AI가 발음, 유창성, 내용 등 종합적으로 피드백을 제공합니다.",
  "데이터 보안과 안정적인 보호에 만전을 둡니다.",
];

function Icon({ name }: { name: IconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4.2-4.2" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 12a8 8 0 0 1 13.6-5.7" />
        <path d="M17 3v4h-4" />
        <path d="M21 12a8 8 0 0 1-13.6 5.7" />
        <path d="M7 21v-4h4" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m15.5 8.5 3-3" />
        <path d="M18.5 5.5H22" />
        <path d="M18.5 5.5V2" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    );
  }

  if (name === "clipboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8l1 3H7l1-3Z" />
        <path d="M7 6H5v15h14V6h-2" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (name === "lightbulb") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14a7 7 0 1 1 8 0c-.8.7-1.2 1.7-1.2 2.8H9.2c0-1.1-.4-2.1-1.2-2.8Z" />
      </svg>
    );
  }

  if (name === "info") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v6h5" />
      <path d="M10 13h6" />
      <path d="M10 17h6" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Ditto 홈">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Ditto</span>
        </a>

        <nav className="primary-nav" aria-label="주요 메뉴">
          <a className="active" href="#">
            시험
          </a>
          <a href="#">학습 리포트</a>
          <a href="#">이용 가이드</a>
          <a href="#">고객센터</a>
        </nav>

        <button className="account-button" type="button">
          <span className="account-avatar">
            <Icon name="user" />
          </span>
          <span>내 정보</span>
          <Icon name="chevron" />
        </button>
      </header>

      <main className="dashboard">
        <section className="main-column" aria-label="시험 선택">
          <section className="hero-section">
            <div className="hero-copy">
              <h1>시험형 영어 말하기 연습 서비스</h1>
              <p>
                실전과 유사한 환경에서 연습하고, AI 피드백으로 말하기 실력을
                향상하세요.
              </p>
              <div className="hero-actions">
                <button className="button primary hero-button" type="button">
                  시험 시작
                  <Icon name="chevron" />
                </button>
                <a className="guide-link" href="#">
                  이용 가이드 보기
                  <Icon name="chevron" />
                </a>
              </div>
            </div>

            <div
              className="hero-asset-placeholder"
              aria-label="말하기 시험 일러스트 영역"
            />
          </section>

          <section className="exam-panel" aria-labelledby="available-exams">
            <div className="search-row">
              <label className="search-box">
                <Icon name="search" />
                <span className="sr-only">시험명 또는 유형 검색</span>
                <input placeholder="시험명 또는 유형 검색" type="search" />
              </label>
              <button className="button reset-button" type="button">
                <Icon name="refresh" />
                필터 초기화
              </button>
            </div>

            <div className="filter-row" aria-label="시험 필터">
              {filters.map((filter) => (
                <button className="filter-button" type="button" key={filter}>
                  {filter}
                  <Icon name="chevron" />
                </button>
              ))}
            </div>

            <div className="exam-heading">
              <div className="title-with-help">
                <h2 id="available-exams">응시 가능한 시험</h2>
                <p>
                  <Icon name="info" />
                  원하는 시험을 선택하고 실력을 점검해 보세요.
                </p>
              </div>
              <button className="sort-button" type="button">
                최신순
                <Icon name="chevron" />
              </button>
            </div>

            <div className="exam-list">
              {exams.map((exam) => (
                <article className="exam-row" key={exam.title}>
                  <div className="exam-title-cell">
                    <span className="exam-icon">
                      <Icon name={exam.icon} />
                    </span>
                    <div>
                      <h3>{exam.title}</h3>
                      <span className="tag">{exam.tag}</span>
                    </div>
                  </div>
                  <div className="exam-meta">
                    <span>문항 수</span>
                    <strong>{exam.questions}</strong>
                  </div>
                  <div className="exam-meta">
                    <span>예상 시간</span>
                    <strong>{exam.time}</strong>
                  </div>
                  <div className="exam-meta">
                    <span>난이도</span>
                    <strong>{exam.difficulty}</strong>
                  </div>
                  <div className="exam-meta">
                    <span>유형</span>
                    <strong>{exam.type}</strong>
                  </div>
                  <button className="button primary row-button" type="button">
                    시작하기
                    <Icon name="chevron" />
                  </button>
                </article>
              ))}
            </div>

            <button className="more-button" type="button">
              더 많은 시험 보기
              <Icon name="chevron" />
            </button>
          </section>
        </section>

        <aside className="side-column" aria-label="학습 정보">
          <section className="side-card recent-card" aria-labelledby="recent-title">
            <div className="side-card-header">
              <h2 id="recent-title">최근 응시 기록</h2>
              <a href="#">
                전체 보기
                <Icon name="chevron" />
              </a>
            </div>

            <div className="record-list">
              {recentRecords.map((record) => (
                <article className="record-item" key={record.title}>
                  <div className="record-main">
                    <span className="record-icon">
                      <Icon name="document" />
                    </span>
                    <div>
                      <h3>{record.title}</h3>
                      <time>{record.date}</time>
                    </div>
                    <span className="status-badge">{record.status}</span>
                  </div>

                  {typeof record.progress === "number" ? (
                    <div className="progress-row">
                      <div
                        className="progress-track"
                        aria-label={`${record.progress}% 진행률`}
                      >
                        <span style={{ width: `${record.progress}%` }} />
                      </div>
                      <strong>{record.progress}%</strong>
                    </div>
                  ) : (
                    <div className="score-row">
                      <strong>점수 {record.score}</strong>
                      <a href="#">
                        상세 보기
                        <Icon name="chevron" />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="side-card recommendation-card">
            <div className="recommendation-heading">
              <Icon name="lightbulb" />
              <h2>추천 시험</h2>
            </div>
            <p>
              실전 점수를 올리고 싶다면
              <br />
              <strong>실전형 세션</strong>을 추천해 드려요!
            </p>
            <button className="button outline-button" type="button">
              실전형 세션 시작하기
              <Icon name="chevron" />
            </button>
          </section>

          <section className="side-card guide-card">
            <h2>이용 안내</h2>
            <ul>
              {guideItems.map((item) => (
                <li key={item}>
                  <Icon name="clipboard" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#">
              이용 가이드 보기
              <Icon name="chevron" />
            </a>
          </section>
        </aside>
      </main>

      <footer className="site-footer">
        <p>© 2024 Ditto. All rights reserved.</p>
        <nav aria-label="정책">
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
          <a href="#">고객센터</a>
        </nav>
        <p>이메일 문의: support@dittospeaking.com</p>
      </footer>
    </div>
  );
}
