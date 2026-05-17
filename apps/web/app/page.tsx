import { listExams } from "../lib/api";
import { ApiEmptyState, ApiErrorState } from "./components/ApiState";
import { ExamCard } from "./components/ExamCard";
import { SiteHeader } from "./components/SiteHeader";

type HomeIconName = "chevron" | "search";

function HomeIcon({ name }: { name: HomeIconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

const examFilters = ["난이도 전체", "문항 수 전체", "예상 시간 전체"];

export default async function HomePage() {
  let exams;

  try {
    exams = await listExams();
  } catch {
    exams = null;
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="simple-main">
        <section className="simple-hero" aria-labelledby="main-title">
          <h1 id="main-title">영어 말하기 모의고사</h1>
          <p>실제 응시 흐름과 유사한 환경에서 답변하고, AI 피드백으로 말하기 실력을 점검하세요.</p>
        </section>

        <section className="simple-filter-panel" aria-label="시험 검색 및 필터">
          <label className="simple-search-box">
            <HomeIcon name="search" />
            <span className="sr-only">시험명 또는 유형 검색</span>
            <input placeholder="시험명 또는 유형 검색" type="search" />
          </label>

          <div className="simple-filter-row">
            {examFilters.map((filter) => (
              <button className="simple-filter-button" type="button" key={filter}>
                {filter}
                <HomeIcon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        {exams === null ? (
          <ApiErrorState message="시험 목록을 불러오지 못했습니다." />
        ) : exams.length === 0 ? (
          <ApiEmptyState message="현재 응시 가능한 시험이 없습니다." />
        ) : (
          <section className="simple-exam-list" aria-label="시험 목록">
            {exams.map((exam) => (
              <ExamCard exam={exam} key={exam.id} />
            ))}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>© 2024 Moldo. All rights reserved.</p>
        <nav aria-label="정책">
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
          <a href="#">고객센터</a>
        </nav>
        <p>이메일 문의: support@moldospeaking.com</p>
      </footer>
    </div>
  );
}
