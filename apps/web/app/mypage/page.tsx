import { Suspense } from "react";
import { getServerIsAuthenticated } from "../../lib/api/server";
import { SiteHeader } from "../components/SiteHeader";
import { MyPageClient } from "./MyPageClient";

function MyPageShell({ initialIsAuthenticated }: { initialIsAuthenticated: boolean }) {
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

export default async function MyPage() {
  const isAuthenticated = await getServerIsAuthenticated();

  return (
    <Suspense fallback={<MyPageShell initialIsAuthenticated={isAuthenticated} />}>
      <MyPageClient initialIsAuthenticated={isAuthenticated} />
    </Suspense>
  );
}
