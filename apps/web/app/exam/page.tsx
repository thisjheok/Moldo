import { createAttempt, getExamQuestions } from "../../lib/api";
import { getServerCookieHeader } from "../../lib/api/server";
import { ApiEmptyState, ApiErrorState } from "../components/ApiState";
import { ExamPageClient } from "./ExamPageClient";

const DEFAULT_EXAM_ID = "speaking-mock-1";

type ExamPageProps = {
  searchParams?: Promise<{
    examId?: string;
  }>;
};

export default async function ExamPage({ searchParams }: ExamPageProps) {
  const params = await searchParams;
  const examId = params?.examId ?? DEFAULT_EXAM_ID;
  const cookieHeader = await getServerCookieHeader();

  const [questions, attempt] = await Promise.all([
    getExamQuestions(examId).catch(() => null),
    createAttempt(examId, { cookieHeader }).catch(() => null),
  ]);

  if (questions === null || attempt === null) {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message="시험 정보를 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiEmptyState message="이 시험에는 아직 문항이 없습니다." />
        </main>
      </div>
    );
  }

  return <ExamPageClient questions={questions} attempt={attempt} />;
}
