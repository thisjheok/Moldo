"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthSession, logout } from "../../lib/api";

export function SiteHeader() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getAuthSession()
      .then(() => {
        if (isMounted) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      setIsAuthenticated(false);
      router.replace("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Moldo 홈">
        <img className="brand-logo" src="/logo.png" alt="" aria-hidden="true" />
        <span className="brand-name">Moldo</span>
      </Link>

      <nav className="site-nav" aria-label="사용자 메뉴">
        {isAuthLoaded && isAuthenticated ? (
          <button
            className="login-link"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "로그아웃 중" : "로그아웃"}
          </button>
        ) : (
          <Link className="login-link" href="/login">
            로그인
          </Link>
        )}
        <Link className="account-button" href={isAuthLoaded && isAuthenticated ? "/mypage" : "/login?next=/mypage"}>
          <span>내 정보</span>
        </Link>
      </nav>
    </header>
  );
}
