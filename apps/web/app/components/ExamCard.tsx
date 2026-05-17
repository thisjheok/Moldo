import Link from "next/link";
import type { ExamIconName, ExamSummary } from "@moldo/types";
import { formatEstimatedMinutes } from "../../utils/formatters";

type ExamCardIconName = ExamIconName | "chevron";

const difficultyLabels: Record<ExamSummary["difficulty"], string> = {
  easy: "하",
  medium: "중",
  hard: "상",
};

const modeLabels: Record<ExamSummary["mode"], string> = {
  mock: "모의고사",
};

function ExamCardIcon({ name }: { name: ExamCardIconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
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

export function ExamCard({ exam }: { exam: ExamSummary }) {
  return (
    <article className="simple-exam-row">
      <div className="simple-exam-title">
        <span className="simple-exam-icon">
          <ExamCardIcon name={exam.icon} />
        </span>
        <div>
          <h2>{exam.title}</h2>
          <span className="tag">{exam.tag}</span>
        </div>
      </div>

      <div className="simple-exam-meta">
        <span>문항 수</span>
        <strong>{exam.questionCount}</strong>
      </div>
      <div className="simple-exam-meta">
        <span>예상 시간</span>
        <strong>{formatEstimatedMinutes(exam.estimatedMinutes)}</strong>
      </div>
      <div className="simple-exam-meta">
        <span>난이도</span>
        <strong>{difficultyLabels[exam.difficulty]}</strong>
      </div>
      <div className="simple-exam-meta">
        <span>유형</span>
        <strong>{modeLabels[exam.mode]}</strong>
      </div>

      <Link className="button primary simple-start-button" href={`/exam?examId=${exam.id}`}>
        시작하기
        <ExamCardIcon name="chevron" />
      </Link>
    </article>
  );
}
