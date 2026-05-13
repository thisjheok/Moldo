import Link from "next/link";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Ditto 홈">
        <span className="brand-name">Ditto</span>
      </Link>

      <Link className="account-button" href="/mypage">
        <span className="account-avatar">
          <UserIcon />
        </span>
        <span>내 정보</span>
      </Link>
    </header>
  );
}
