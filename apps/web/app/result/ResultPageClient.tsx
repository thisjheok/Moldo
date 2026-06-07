"use client";

import type { ExamResult } from "@moldo/types";
import { useEffect, useState } from "react";
import { ApiError, getResult } from "../../lib/api";
import { formatDateTime, formatScore } from "../../utils/formatters";
import { ApiErrorState } from "../components/ApiState";
import { FeedbackCard } from "../components/FeedbackCard";
import { ResultAnswerCard } from "../components/ResultAnswerCard";
import { ScoreCard } from "../components/ScoreCard";
import { SiteHeader } from "../components/SiteHeader";

type ResultPageClientProps = {
  initialIsAuthenticated: boolean;
  resultId: string | null;
};

type ResultPageState =
  | { status: "loading" }
  | { status: "ready"; result: ExamResult }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "error" };

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ResultPageClient({ initialIsAuthenticated, resultId }: ResultPageClientProps) {
  const [state, setState] = useState<ResultPageState>({ status: "loading" });
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadResult() {
      if (!resultId) {
        setState({ status: "not_found" });
        return;
      }

      try {
        const result = await getResult(resultId);

        if (isMounted) {
          setState({ status: "ready", result });
          setSelectedAnswerIndex(0);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "not_found" });
          return;
        }

        setState({ status: "error" });
      }
    }

    void loadResult();

    return () => {
      isMounted = false;
    };
  }, [resultId]);

  if (state.status === "loading") {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="result-main">
          <section className="simple-filter-panel" aria-live="polite">
            <p>결과 정보를 불러오는 중입니다.</p>
          </section>
        </main>
      </div>
    );
  }

  if (state.status === "unauthorized") {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={false} />
        <main className="result-main">
          <ApiErrorState message="로그인 후 결과를 확인해 주세요." />
        </main>
      </div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="result-main">
          <ApiErrorState message="결과를 찾을 수 없습니다." />
        </main>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="result-main">
          <ApiErrorState message="결과 정보를 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

  const selectedAnswer = state.result.answers[selectedAnswerIndex];

  if (!selectedAnswer) {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="result-main">
          <ApiErrorState message="표시할 결과 답변이 없습니다." />
        </main>
      </div>
    );
  }

  const hasPreviousAnswer = selectedAnswerIndex > 0;
  const hasNextAnswer = selectedAnswerIndex < state.result.answers.length - 1;

  return (
    <div className="app-shell">
      <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />

      <main className="result-main" aria-labelledby="result-title">
        <section className="result-score-section">
          <div className="result-exam-heading">
            <span>모의고사 결과</span>
            <h1 id="result-title">{state.result.examTitle}</h1>
            <p>{formatDateTime(state.result.takenAt)} 응시</p>
          </div>

          <div className="result-total-score" aria-label="총점">
            <strong>{formatScore(state.result.totalScore)}</strong>
            <span>/ {state.result.maxScore}</span>
          </div>

          <div className="result-score-grid" aria-label="문항 평가 점수">
            <ScoreCard
              label={`문항 ${selectedAnswer.questionOrder} 점수`}
              score={selectedAnswer.score}
              maxScore={selectedAnswer.maxScore}
            />
          </div>
        </section>

        <section className="result-question-bar" aria-label="문항 정보">
          <p>
            <strong>문항 {selectedAnswer.questionOrder}.</strong> {selectedAnswer.questionPrompt}
          </p>
          <div className="result-question-actions">
            <button
              type="button"
              disabled={!hasPreviousAnswer}
              onClick={() => setSelectedAnswerIndex((currentIndex) => currentIndex - 1)}
            >
              이전 문항
            </button>
            <span>
              {selectedAnswerIndex + 1} / {state.result.answers.length}
            </span>
            <button
              type="button"
              disabled={!hasNextAnswer}
              onClick={() => setSelectedAnswerIndex((currentIndex) => currentIndex + 1)}
            >
              다음 문항
              <ArrowIcon />
            </button>
          </div>
        </section>

        <section className="result-answer-grid" aria-label="답변 비교">
          <ResultAnswerCard
            title="내 답변"
            subtitle="전사 내용"
            content={selectedAnswer.transcript}
          />

          <ResultAnswerCard
            title="이렇게 말하면 더 좋아요"
            subtitle="모범 답변"
            content={selectedAnswer.modelAnswer}
          />
        </section>

        <section className="result-feedback-grid" aria-label="평가 피드백">
          <FeedbackCard title="개선할 점" tone="improve" items={selectedAnswer.improvements} />
        </section>
      </main>
    </div>
  );
}
