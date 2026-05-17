import Link from "next/link";
import type { ExamHistoryItem } from "@moldo/types";
import { formatDateTime, formatDuration, formatScore } from "../../utils/formatters";

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

export function HistoryTable({ histories }: { histories: ExamHistoryItem[] }) {
  return (
    <div className="mypage-table-wrap">
      <table className="mypage-table">
        <thead>
          <tr>
            <th scope="col">날짜</th>
            <th scope="col">시험명</th>
            <th scope="col">문항 수</th>
            <th scope="col">점수</th>
            <th scope="col">소요 시간</th>
            <th scope="col">작업</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{formatDateTime(history.takenAt)}</td>
              <td>{history.examTitle}</td>
              <td>{history.questionCount}</td>
              <td>{formatScore(history.totalScore)}</td>
              <td>{formatDuration(history.durationSeconds)}</td>
              <td>
                <Link className="mypage-feedback-link" href={`/result?resultId=${history.resultId}`}>
                  <FeedbackIcon />
                  <span>피드백 보기</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
