import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

type MyPageIconName = "chevron" | "feedback" | "user";

const examHistory = [
  {
    date: "2024-05-14 14:20",
    exam: "모의고사 A",
    questions: 15,
    score: "82점",
    duration: "15:18",
  },
  {
    date: "2024-05-10 10:05",
    exam: "모의고사 B",
    questions: 15,
    score: "76점",
    duration: "15:02",
  },
  {
    date: "2024-05-07 16:30",
    exam: "실전형 세션",
    questions: 12,
    score: "88점",
    duration: "12:11",
  },
  {
    date: "2024-05-02 11:15",
    exam: "모의고사 A",
    questions: 15,
    score: "70점",
    duration: "15:27",
  },
  {
    date: "2024-04-28 09:40",
    exam: "모의고사 B",
    questions: 15,
    score: "65점",
    duration: "15:33",
  },
];

function MyPageIcon({ name }: { name: MyPageIconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "feedback") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

export default function MyPage() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="mypage-main">
        <section className="mypage-profile-card" aria-label="사용자 정보">
          <div className="mypage-profile">
            <span className="mypage-profile-avatar" aria-hidden="true">
              <MyPageIcon name="user" />
            </span>
            <div>
              <h1>홍길동</h1>
              <p>hong@example.com</p>
            </div>
          </div>

          <div className="mypage-total">
            <span>총 응시 횟수</span>
            <strong>12회</strong>
          </div>
        </section>

        <section className="mypage-record-section" aria-label="마이페이지 상세 정보">
          <div className="mypage-tabs" aria-label="내 활동">
            <button className="active" type="button" aria-pressed="true">
              응시 기록
            </button>
            <button type="button" aria-pressed="false">
              북마크
            </button>
          </div>

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
                {examHistory.map((history) => (
                  <tr key={`${history.date}-${history.exam}`}>
                    <td>{history.date}</td>
                    <td>{history.exam}</td>
                    <td>{history.questions}</td>
                    <td>{history.score}</td>
                    <td>{history.duration}</td>
                    <td>
                      <Link className="mypage-feedback-link" href="/result">
                        <MyPageIcon name="feedback" />
                        <span>피드백 보기</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mypage-pagination" aria-label="응시 기록 페이지">
            <button type="button" aria-label="이전 페이지">
              <MyPageIcon name="chevron" />
            </button>
            <a className="active" href="#" aria-current="page">
              1
            </a>
            <a href="#">2</a>
            <a href="#">3</a>
            <button type="button" aria-label="다음 페이지">
              <MyPageIcon name="chevron" />
            </button>
          </nav>
        </section>
      </main>
    </div>
  );
}
