"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { login } from "../../lib/api";
import { SiteHeader } from "../components/SiteHeader";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("hong@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace(searchParams.get("next") ?? "/mypage");
      router.refresh();
    } catch {
      setError("이메일 또는 비밀번호를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="login-main">
        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-heading">
            <h1>로그인</h1>
            <p>응시 기록과 결과를 저장하려면 로그인하세요.</p>
          </div>

          <label className="login-field">
            <span>이메일</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="login-field">
            <span>비밀번호</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button className="login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>

          <Link className="login-secondary-link" href="/">
            시험 목록으로 돌아가기
          </Link>
        </form>
      </main>
    </div>
  );
}

function LoginShell() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="login-main">
        <div className="login-panel" aria-busy="true">
          <div className="login-heading">
            <h1>로그인</h1>
            <p>로그인 화면을 불러오는 중입니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
