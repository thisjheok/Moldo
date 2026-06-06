"use client";

import type { ExamIconName, ExamSummary } from "@moldo/types";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatEstimatedMinutes } from "../../utils/formatters";
import { getAuthSession, login } from "../../lib/api";

type ExamCardIconName = ExamIconName | "chevron";

const modeLabels: Record<ExamSummary["mode"], string> = {
  mock: "모의고사",
};

function ExamCardIcon({ name }: { name: ExamCardIconName }) {
  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m15.5 8.5 3-3" />
        <path d="M18.5 5.5H22" />
        <path d="M18.5 5.5V2" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7V3Z" />
      <path d="M14 3v6h5" />
      <path d="M10 13h6" />
      <path d="M10 17h6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v3" />
    </svg>
  );
}

export function ExamCard({ exam }: { exam: ExamSummary }) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("hong@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [helperMessage, setHelperMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const examHref = `/exam?examId=${encodeURIComponent(exam.id)}`;

  async function handleExamClick() {
    if (isCheckingAuth) {
      return;
    }

    setIsCheckingAuth(true);
    setError("");
    setHelperMessage("");

    try {
      await getAuthSession();
      router.push(examHref);
    } catch {
      setIsAuthModalOpen(true);
    } finally {
      setIsCheckingAuth(false);
    }
  }

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
      router.push(examHref);
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
    <article className="simple-exam-row">
      <div className="simple-exam-title">
        <span className="simple-exam-icon">
          <ExamCardIcon name={exam.icon} />
        </span>
        <div>
          <h2>
            <button
              className="simple-exam-title-button"
              disabled={isCheckingAuth}
              onClick={() => void handleExamClick()}
              type="button"
            >
              {isCheckingAuth ? "확인 중" : exam.title}
            </button>
          </h2>
        </div>
      </div>

      <div className="simple-exam-meta">
        <span>문항 수</span>
        <strong>{exam.questionCount}</strong>
      </div>
      <div className="simple-exam-meta">
        <span>예상 시간</span>
        <strong>{formatEstimatedMinutes(exam.estimatedMinutes)}</strong>
      </div>
      <div className="simple-exam-meta">
        <span>유형</span>
        <strong>{modeLabels[exam.mode]}</strong>
      </div>

      {isAuthModalOpen ? (
        <div className="exam-modal-backdrop" role="presentation">
          <section
            className="exam-modal auth-required-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`home-auth-required-title-${exam.id}`}
            aria-describedby={`home-auth-required-desc-${exam.id}`}
          >
            <div className="exam-modal-heading">
              <span className="exam-modal-icon">
                <LockIcon />
              </span>
              <div>
                <h2 id={`home-auth-required-title-${exam.id}`}>로그인 후 시험 보기</h2>
                <p id={`home-auth-required-desc-${exam.id}`}>로그인 하고 Moldo를 사용해보세요.</p>
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
                <button className="button secondary exam-modal-button" type="button" onClick={() => setIsAuthModalOpen(false)}>
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
      ) : null}
    </article>
  );
}
