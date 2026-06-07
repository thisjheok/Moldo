"use client";

import type { ExamAttempt, ExamQuestion } from "@moldo/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAttempt, getExamQuestions } from "../../lib/api";
import { ApiEmptyState, ApiErrorState } from "../components/ApiState";
import { ExamPageClient } from "./ExamPageClient";

type AttemptExamLoaderProps = {
  attemptId: string;
};

type AttemptExamState =
  | { status: "loading" }
  | { status: "ready"; attempt: ExamAttempt; questions: ExamQuestion[] }
  | { status: "empty" }
  | { status: "error"; message: string };

export function AttemptExamLoader({ attemptId }: AttemptExamLoaderProps) {
  const router = useRouter();
  const [state, setState] = useState<AttemptExamState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadAttempt() {
      try {
        const attempt = await getAttempt(attemptId);

        if (attempt.status === "completed" && attempt.resultId) {
          router.replace(`/result?resultId=${attempt.resultId}`);
          return;
        }

        if (attempt.status === "completed") {
          if (isMounted) {
            setState({
              status: "error",
              message: "완료된 시험 세션의 결과 정보를 찾지 못했습니다.",
            });
          }
          return;
        }

        if (attempt.status === "failed") {
          if (isMounted) {
            setState({
              status: "error",
              message: "채점에 실패한 시험 세션입니다. 메인 화면에서 다시 시작해 주세요.",
            });
          }
          return;
        }

        const questions = await getExamQuestions(attempt.examId);

        if (!isMounted) {
          return;
        }

        if (questions.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", attempt, questions });
      } catch {
        if (isMounted) {
          setState({ status: "error", message: "시험 세션을 불러오지 못했습니다." });
        }
      }
    }

    void loadAttempt();

    return () => {
      isMounted = false;
    };
  }, [attemptId, router]);

  if (state.status === "ready") {
    return <ExamPageClient questions={state.questions} attempt={state.attempt} />;
  }

  if (state.status === "empty") {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiEmptyState message="이 시험에는 아직 문항이 없습니다." />
        </main>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message={state.message} />
        </main>
      </div>
    );
  }

  return (
    <div className="exam-shell">
      <main className="exam-workspace">
        <section className="simple-filter-panel" aria-live="polite">
          <p>시험 세션을 불러오는 중입니다.</p>
        </section>
      </main>
    </div>
  );
}
