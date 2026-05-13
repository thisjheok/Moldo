import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";

type IconName = "chevron" | "document" | "message" | "search" | "target";

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
  {
    title: "실전 모의고사 C",
    tag: "모의고사",
    questions: "20",
    time: "약 20분",
    difficulty: "상",
    type: "종합",
    icon: "document" as IconName,
  },
];

const filters = ["난이도 전체", "문항 수 전체", "예상 시간 전체", "유형 전체"];

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
      <SiteHeader />

      <main className="simple-main">
        <section className="simple-hero" aria-labelledby="main-title">
          <h1 id="main-title">시험형 영어 말하기 연습</h1>
          <p>실전과 유사한 환경에서 연습하고, AI 피드백으로 말하기 실력을 향상하세요.</p>
        </section>

        <section className="simple-filter-panel" aria-label="시험 검색 및 필터">
          <label className="simple-search-box">
            <Icon name="search" />
            <span className="sr-only">시험명 또는 유형 검색</span>
            <input placeholder="시험명 또는 유형 검색" type="search" />
          </label>

          <div className="simple-filter-row">
            {filters.map((filter) => (
              <button className="simple-filter-button" type="button" key={filter}>
                {filter}
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        <section className="simple-exam-list" aria-label="시험 목록">
          {exams.map((exam) => (
            <article className="simple-exam-row" key={exam.title}>
              <div className="simple-exam-title">
                <span className="simple-exam-icon">
                  <Icon name={exam.icon} />
                </span>
                <div>
                  <h2>{exam.title}</h2>
                  <span className="tag">{exam.tag}</span>
                </div>
              </div>

              <div className="simple-exam-meta">
                <span>문항 수</span>
                <strong>{exam.questions}</strong>
              </div>
              <div className="simple-exam-meta">
                <span>예상 시간</span>
                <strong>{exam.time}</strong>
              </div>
              <div className="simple-exam-meta">
                <span>난이도</span>
                <strong>{exam.difficulty}</strong>
              </div>
              <div className="simple-exam-meta">
                <span>유형</span>
                <strong>{exam.type}</strong>
              </div>

              <Link className="button primary simple-start-button" href="/exam">
                시작하기
                <Icon name="chevron" />
              </Link>
            </article>
          ))}
        </section>
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
