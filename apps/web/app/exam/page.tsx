import { createSession, getExamQuestions } from "../../lib/api";
import { ApiEmptyState, ApiErrorState } from "../components/ApiState";
import { ExamPageClient } from "./ExamPageClient";

const DEFAULT_EXAM_ID = "opic-mock-a";

type ExamPageProps = {
  searchParams?: Promise<{
    examId?: string;
  }>;
};

export default async function ExamPage({ searchParams }: ExamPageProps) {
  const params = await searchParams;
  const examId = params?.examId ?? DEFAULT_EXAM_ID;

  const [questions, session] = await Promise.all([
    getExamQuestions(examId).catch(() => null),
    createSession(examId).catch(() => null),
  ]);

  if (questions === null || session === null) {
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

  return <ExamPageClient questions={questions} session={session} />;
}
