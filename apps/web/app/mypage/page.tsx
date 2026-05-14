import { getMyProfile, listMyResults } from "../../lib/api";
import { ApiErrorState } from "../components/ApiState";
import { HistoryTable } from "../components/HistoryTable";
import { SiteHeader } from "../components/SiteHeader";

type MyPageIconName = "chevron" | "user";

function MyPageIcon({ name }: { name: MyPageIconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
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

export default async function MyPage() {
  const [profile, results] = await Promise.all([
    getMyProfile().catch(() => null),
    listMyResults().catch(() => null),
  ]);

  if (profile === null || results === null) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <main className="mypage-main">
          <ApiErrorState message="마이페이지 정보를 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

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
              <h1>{profile.name}</h1>
              <p>{profile.email}</p>
            </div>
          </div>

          <div className="mypage-total">
            <span>총 응시 횟수</span>
            <strong>{profile.totalExamCount}회</strong>
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

          <HistoryTable histories={results} />

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
