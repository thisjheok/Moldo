"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "../../lib/api";

type AuthRequiredModalProps = {
  descriptionId: string;
  onCancel: () => void;
  redirectTo: string;
  title: string;
  titleId: string;
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v3" />
    </svg>
  );
}

export function AuthRequiredModal({
  descriptionId,
  onCancel,
  redirectTo,
  title,
  titleId,
}: AuthRequiredModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [helperMessage, setHelperMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setHelperMessage("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(redirectTo);
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
    <div className="exam-modal-backdrop" role="presentation">
      <section
        className="exam-modal auth-required-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="exam-modal-heading">
          <span className="exam-modal-icon">
            <LockIcon />
          </span>
          <div>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>로그인 하고 Moldo를 사용해보세요.</p>
          </div>
        </div>

        <form className="auth-modal-form" onSubmit={handleLogin}>
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

          <div className="exam-modal-actions">
            <button className="button secondary exam-modal-button" type="button" onClick={onCancel}>
              취소
            </button>
            <button className="button primary exam-modal-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "로그인 중" : "로그인"}
            </button>
          </div>
        </form>

        <div className="login-support-actions" aria-label="계정 지원">
          <button type="button" onClick={() => handleUnavailableAction("회원가입")}>
            회원가입
          </button>
          <button type="button" onClick={() => handleUnavailableAction("비밀번호 찾기")}>
            비밀번호 찾기
          </button>
        </div>
      </section>
    </div>
  );
}
