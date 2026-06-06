import { redirect } from "next/navigation";
import { getAuthSession, getMyProfile, listMyResults } from "../../lib/api";
import { getServerCookieHeader } from "../../lib/api/server";
import { ApiErrorState } from "../components/ApiState";
import { HistoryTable } from "../components/HistoryTable";
import { SiteHeader } from "../components/SiteHeader";

type MyPageIconName = "chevron" | "user";
const historiesPerPage = 10;

type MyPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

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

function getPageNumbers(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? "1");
  const cookieHeader = await getServerCookieHeader();
  const authSession = await getAuthSession({ cookieHeader }).catch(() => null);

  if (authSession === null) {
    redirect("/login?next=/mypage");
  }

  const [profile, results] = await Promise.all([
    getMyProfile({ cookieHeader }).catch(() => null),
    listMyResults({ cookieHeader }).catch(() => null),
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

  const totalPages = Math.ceil(results.length / historiesPerPage);
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages || 1);
  const pageStartIndex = (currentPage - 1) * historiesPerPage;
  const pageHistories = results.slice(pageStartIndex, pageStartIndex + historiesPerPage);

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
          </div>

          <HistoryTable histories={pageHistories} />

          {totalPages > 1 ? (
            <nav className="mypage-pagination" aria-label="응시 기록 페이지">
              {currentPage > 1 ? (
                <a href={`/mypage?page=${currentPage - 1}`} aria-label="이전 페이지">
                  <MyPageIcon name="chevron" />
                </a>
              ) : null}
              {getPageNumbers(totalPages).map((pageNumber) => (
                <a
                  className={pageNumber === currentPage ? "active" : undefined}
                  href={`/mypage?page=${pageNumber}`}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  key={pageNumber}
                >
                  {pageNumber}
                </a>
              ))}
              {currentPage < totalPages ? (
                <a href={`/mypage?page=${currentPage + 1}`} aria-label="다음 페이지">
                  <MyPageIcon name="chevron" />
                </a>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </div>
  );
}
