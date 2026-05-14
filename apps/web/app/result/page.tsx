import Link from "next/link";
import { getResult } from "../../lib/api";
import { ApiErrorState } from "../components/ApiState";
import { FeedbackCard } from "../components/FeedbackCard";
import { ResultAnswerCard } from "../components/ResultAnswerCard";
import { ScoreCard } from "../components/ScoreCard";
import { SiteHeader } from "../components/SiteHeader";
import { formatDateTime, formatScore } from "../../utils/formatters";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

const DEFAULT_RESULT_ID = "result-opic-mock-a-20240514";

type ResultPageProps = {
  searchParams?: Promise<{
    resultId?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const resultId = params?.resultId ?? DEFAULT_RESULT_ID;
  const result = await getResult(resultId).catch(() => null);

  if (result === null) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <main className="result-main">
          <ApiErrorState message="결과 정보를 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

  const selectedAnswer = result.answers[0];

  if (!selectedAnswer) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <main className="result-main">
          <ApiErrorState message="표시할 결과 답변이 없습니다." />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="result-main" aria-labelledby="result-title">
        <section className="result-score-section">
          <div className="result-exam-heading">
            <span>모의고사 결과</span>
            <h1 id="result-title">{result.examTitle}</h1>
            <p>{formatDateTime(result.takenAt)} 응시</p>
          </div>

          <div className="result-total-score" aria-label="총점">
            <strong>{formatScore(result.totalScore)}</strong>
            <span>/ {result.maxScore}</span>
          </div>

          <div className="result-score-grid" aria-label="세부 평가 점수">
            {result.scores.map((score) => (
              <ScoreCard score={score} key={score.category} />
            ))}
          </div>
        </section>

        <section className="result-question-bar" aria-label="문항 정보">
          <p>
            <strong>문항 {selectedAnswer.questionOrder}.</strong> {selectedAnswer.questionPrompt}
          </p>
          <Link href={`/exam?examId=${result.examId}`}>
            다른 문항 보기 ({selectedAnswer.questionOrder} / {result.questionCount})
            <ArrowIcon />
          </Link>
        </section>

        <section className="result-answer-grid" aria-label="답변 비교">
          <ResultAnswerCard
            title="내 답변"
            subtitle="전사 내용"
            content={selectedAnswer.transcript}
            audioLabel="내 답변 듣기"
            durationSeconds={selectedAnswer.durationSeconds}
          />

          <ResultAnswerCard
            title="이렇게 말하면 더 좋아요"
            subtitle="모범 답변"
            content={selectedAnswer.modelAnswer}
            audioLabel="모범 답변 듣기"
            durationSeconds={selectedAnswer.modelAnswerDurationSeconds}
          />
        </section>

        <section className="result-feedback-grid" aria-label="평가 피드백">
          <FeedbackCard title="잘한 점" tone="good" items={selectedAnswer.strengths} />
          <FeedbackCard title="개선할 점" tone="improve" items={selectedAnswer.improvements} />
        </section>
      </main>
    </div>
  );
}
