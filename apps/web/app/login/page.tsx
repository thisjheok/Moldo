"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { login, signup } from "../../lib/api";
import { ApiError } from "../../lib/api/http";
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
  const isSignupMode = searchParams.get("mode") === "signup";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [helperMessage, setHelperMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setHelperMessage("");

    if (isSignupMode && password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignupMode) {
        await signup(username, email, password, name);
      } else {
        await login(username, password);
      }
      router.replace(searchParams.get("next") ?? "/");
      router.refresh();
    } catch (caughtError) {
      if (isSignupMode) {
        setError(getSignupErrorMessage(caughtError));
      } else {
        setError("아이디 또는 비밀번호를 확인해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function getModeHref(mode: "login" | "signup") {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "signup") {
      params.set("mode", "signup");
    } else {
      params.delete("mode");
    }
    const query = params.toString();
    return query ? `/login?${query}` : "/login";
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
            <h1>{isSignupMode ? "회원가입" : "로그인"}</h1>
            <p>
              {isSignupMode
                ? "아이디와 비밀번호로 Moldo 계정을 만드세요."
                : "로그인 하고 Moldo를 사용해보세요."}
            </p>
          </div>

          <label className="login-field">
            <span>아이디</span>
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              pattern="[A-Za-z0-9_.-]{3,40}"
              required
              title="영문, 숫자, 점, 밑줄, 하이픈 3~40자로 입력해 주세요."
              type="text"
              value={username}
            />
          </label>

          {isSignupMode ? (
            <>
              <label className="login-field">
                <span>이메일</span>
                <input
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="login-field">
                <span>이름</span>
                <input
                  autoComplete="name"
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  required
                  type="text"
                  value={name}
                />
              </label>
            </>
          ) : null}

          <label className="login-field">
            <span>비밀번호</span>
            <input
              autoComplete={isSignupMode ? "new-password" : "current-password"}
              minLength={isSignupMode ? 8 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {isSignupMode ? (
            <label className="login-field">
              <span>비밀번호 확인</span>
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                required
                type="password"
                value={passwordConfirm}
              />
            </label>
          ) : null}

          {error ? <p className="login-error">{error}</p> : null}
          {helperMessage ? <p className="login-helper-message">{helperMessage}</p> : null}

          <button className="login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? isSignupMode
                ? "가입 중"
                : "로그인 중"
              : isSignupMode
                ? "회원가입"
                : "로그인"}
          </button>

          <div className="login-support-actions" aria-label="계정 지원">
            <Link href={getModeHref(isSignupMode ? "login" : "signup")}>
              {isSignupMode ? "로그인" : "회원가입"}
            </Link>
            <button type="button" onClick={() => handleUnavailableAction("비밀번호 찾기")}>
              비밀번호 찾기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function getSignupErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.status === 404) {
    return "회원가입 API가 아직 서버에 반영되지 않았습니다. API 서버를 재시작해 주세요.";
  }

  if (error.status === 409) {
    return "이미 사용 중인 아이디 또는 이메일입니다.";
  }

  if (error.status === 422) {
    return "아이디, 이메일, 비밀번호 입력값을 확인해 주세요.";
  }

  return "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
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
