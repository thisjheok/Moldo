"use client";

import type { ExamHistoryItem, MyPageProfile } from "@moldo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAuthSession, getMyProfile, listMyResults } from "../../lib/api";
import { ApiErrorState } from "../components/ApiState";
import { HistoryTable } from "../components/HistoryTable";
import { SiteHeader } from "../components/SiteHeader";

type MyPageIconName = "chevron" | "user";
const historiesPerPage = 10;

type MyPageState =
  | { status: "loading" }
  | { status: "ready"; profile: MyPageProfile; results: ExamHistoryItem[] }
  | { status: "error" };

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

type MyPageClientProps = {
  initialIsAuthenticated: boolean;
};

export function MyPageClient({ initialIsAuthenticated }: MyPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const [state, setState] = useState<MyPageState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function loadMyPage() {
      try {
        await getAuthSession();
      } catch {
        router.replace("/login?next=/mypage");
        return;
      }

      try {
        const [profile, results] = await Promise.all([getMyProfile(), listMyResults()]);

        if (isMounted) {
          setState({ status: "ready", profile, results });
        }
      } catch {
        if (isMounted) {
          setState({ status: "error" });
        }
      }
    }

    void loadMyPage();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const pagination = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }

    const totalPages = Math.ceil(state.results.length / historiesPerPage);
    const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages || 1);
    const pageStartIndex = (currentPage - 1) * historiesPerPage;

    return {
      currentPage,
      pageHistories: state.results.slice(pageStartIndex, pageStartIndex + historiesPerPage),
      totalPages,
    };
  }, [requestedPage, state]);

  if (state.status === "loading") {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="mypage-main">
          <section className="simple-filter-panel" aria-live="polite">
            <p>마이페이지 정보를 불러오는 중입니다.</p>
          </section>
        </main>
      </div>
    );
  }

  if (state.status === "error" || pagination === null) {
    return (
      <div className="app-shell">
        <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />
        <main className="mypage-main">
          <ApiErrorState message="마이페이지 정보를 불러오지 못했습니다." />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader initialIsAuthenticated={initialIsAuthenticated} />

      <main className="mypage-main">
        <section className="mypage-profile-card" aria-label="사용자 정보">
          <div className="mypage-profile">
            <span className="mypage-profile-avatar" aria-hidden="true">
              <MyPageIcon name="user" />
            </span>
            <div>
              <h1>{state.profile.name}</h1>
              <p>
                {state.profile.username} · {state.profile.email}
              </p>
            </div>
          </div>

          <div className="mypage-total">
            <span>총 응시 횟수</span>
            <strong>{state.profile.totalExamCount}회</strong>
          </div>
        </section>

        <section className="mypage-record-section" aria-label="마이페이지 상세 정보">
          <div className="mypage-tabs" aria-label="내 활동">
            <button className="active" type="button" aria-pressed="true">
              응시 기록
            </button>
          </div>

          <HistoryTable histories={pagination.pageHistories} />

          {pagination.totalPages > 1 ? (
            <nav className="mypage-pagination" aria-label="응시 기록 페이지">
              {pagination.currentPage > 1 ? (
                <a href={`/mypage?page=${pagination.currentPage - 1}`} aria-label="이전 페이지">
                  <MyPageIcon name="chevron" />
                </a>
              ) : null}
              {getPageNumbers(pagination.totalPages).map((pageNumber) => (
                <a
                  className={pageNumber === pagination.currentPage ? "active" : undefined}
                  href={`/mypage?page=${pageNumber}`}
                  aria-current={pageNumber === pagination.currentPage ? "page" : undefined}
                  key={pageNumber}
                >
                  {pageNumber}
                </a>
              ))}
              {pagination.currentPage < pagination.totalPages ? (
                <a href={`/mypage?page=${pagination.currentPage + 1}`} aria-label="다음 페이지">
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
