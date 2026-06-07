import { Suspense } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { MyPageClient } from "./MyPageClient";

function MyPageShell() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="mypage-main">
        <section className="simple-filter-panel" aria-live="polite">
          <p>마이페이지 정보를 불러오는 중입니다.</p>
        </section>
      </main>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<MyPageShell />}>
      <MyPageClient />
    </Suspense>
  );
}
