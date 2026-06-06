import { listExams } from "../lib/api";
import { ApiEmptyState, ApiErrorState } from "./components/ApiState";
import { ExamCard } from "./components/ExamCard";
import { SiteHeader } from "./components/SiteHeader";

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
        <p>© 2026 Moldo. All rights reserved.</p>
        <nav aria-label="정책">
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
          <a href="#">고객센터</a>
        </nav>
        <p>이메일 문의: jhjang3344@gmail.com</p>
      </footer>
    </div>
  );
}
