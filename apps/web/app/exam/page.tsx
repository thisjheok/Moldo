import { redirect } from "next/navigation";
import { getAttempt, getAuthSession, getExam, getExamQuestions } from "../../lib/api";
import { getServerCookieHeader } from "../../lib/api/server";
import { ApiEmptyState, ApiErrorState } from "../components/ApiState";
import { AuthRequiredExamGate } from "./AuthRequiredExamGate";
import { ExamPageClient } from "./ExamPageClient";
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

      const authSession = await getAuthSession({ cookieHeader }).catch(() => null);

      if (authSession === null) {
        return <AuthRequiredExamGate exam={exam} questions={questions} />;
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

  const attempt = await getAttempt(attemptId, { cookieHeader }).catch(() => null);

  const authSession = await getAuthSession({ cookieHeader }).catch(() => null);

  if (authSession === null && attempt !== null) {
    const [exam, questions] = await Promise.all([
      getExam(attempt.examId, { cookieHeader }).catch(() => null),
      getExamQuestions(attempt.examId).catch(() => null),
    ]);

    if (exam !== null && questions !== null && questions.length > 0) {
      return <AuthRequiredExamGate exam={exam} questions={questions} />;
    }
  }

  if (attempt === null) {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message="시험 세션을 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

  if (attempt.status === "completed" && attempt.resultId) {
    redirect(`/result?resultId=${attempt.resultId}`);
  }

  if (attempt.status === "completed") {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message="완료된 시험 세션의 결과 정보를 찾지 못했습니다." />
        </main>
      </div>
    );
  }

  if (attempt.status === "failed") {
    return (
      <div className="exam-shell">
        <main className="exam-workspace">
          <ApiErrorState message="채점에 실패한 시험 세션입니다. 메인 화면에서 다시 시작해 주세요." />
        </main>
      </div>
    );
  }

  const questions = await getExamQuestions(attempt.examId).catch(() => null);

  if (questions === null) {
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
