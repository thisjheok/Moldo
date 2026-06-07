import { getExam, getExamQuestions } from "../../lib/api";
import { getServerCookieHeader } from "../../lib/api/server";
import { ApiEmptyState, ApiErrorState } from "../components/ApiState";
import { AttemptExamLoader } from "./AttemptExamLoader";
import { StartExamGate } from "./StartExamGate";

type ExamPageProps = {
  searchParams?: Promise<{
    attemptId?: string;
    examId?: string;
  }>;
};

export default async function ExamPage({ searchParams }: ExamPageProps) {
  const params = await searchParams;
  const attemptId = params?.attemptId;
  const examId = params?.examId;
  const cookieHeader = await getServerCookieHeader();

  if (!attemptId) {
    if (examId) {
      const [exam, questions] = await Promise.all([
        getExam(examId, { cookieHeader }).catch(() => null),
        getExamQuestions(examId).catch(() => null),
      ]);

      if (exam === null || questions === null) {
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

      return <StartExamGate exam={exam} questions={questions} />;
    }

    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message="시험 시작 버튼을 눌러 새 시험 세션을 시작해 주세요." />
        </main>
      </div>
    );
  }

  return <AttemptExamLoader attemptId={attemptId} />;
}
