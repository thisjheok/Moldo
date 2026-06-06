"use client";

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
  const [helperMessage, setHelperMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setHelperMessage("");
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

  function handleUnavailableAction(actionName: string) {
    setError("");
    setHelperMessage(`${actionName} 기능은 준비 중입니다.`);
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="login-main">
        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-heading">
            <h1>로그인</h1>
            <p>로그인 하고 Moldo를 사용해보세요.</p>
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
          {helperMessage ? <p className="login-helper-message">{helperMessage}</p> : null}

          <button className="login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>

          <div className="login-support-actions" aria-label="계정 지원">
            <button type="button" onClick={() => handleUnavailableAction("회원가입")}>
              회원가입
            </button>
            <button type="button" onClick={() => handleUnavailableAction("비밀번호 찾기")}>
              비밀번호 찾기
            </button>
          </div>
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
            <p>로그인 하고 Moldo를 사용해보세요.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
