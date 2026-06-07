"use client";

import type { ExamQuestion, ExamSummary } from "@moldo/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "../../lib/api";

type AuthRequiredExamGateProps = {
  exam: ExamSummary;
  questions: ExamQuestion[];
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  );
}

export function AuthRequiredExamGate({ exam, questions }: AuthRequiredExamGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helperMessage, setHelperMessage] = useState("");
  const firstQuestion = questions[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setHelperMessage("");
    setIsSubmitting(true);

    try {
      await login(email, password);
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
    <div className="exam-shell">
      <header className="exam-topbar">
        <Link className="exam-brand" href="/" aria-label="Moldo 홈">
          <img className="exam-brand-logo" src="/logo.png" alt="" aria-hidden="true" />
          <span>Moldo</span>
        </Link>
      </header>

      <main className="exam-workspace opic-exam-workspace exam-prestart-workspace" aria-hidden="true">
        <h1 className="opic-question-heading">
          <span>Question {firstQuestion.order} of {questions.length}</span>
        </h1>

        <section className="stimulus-panel opic-stimulus-panel" aria-label="Ava">
          <div className="stimulus-placeholder" aria-label="이미지 지문 영역">
            <Image
              className="stimulus-image"
              src="/ava.png"
              alt="시험관"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              width={1254}
              height={1254}
            />
          </div>

          <div className="audio-section" aria-label="지문 재생">
            <p className="audio-instruction">재생 버튼을 눌러 시험 발문 듣기</p>
            <div className="audio-player" aria-label="지문 오디오 플레이어">
              <button className="audio-play-button" type="button" disabled>
                <PlayIcon />
              </button>
              <div className="audio-track">
                <div className="audio-progress" style={{ width: "0%" }} />
              </div>
              <span className="audio-time">00:00</span>
            </div>
          </div>
        </section>

        <section className="question-panel opic-question-panel" aria-label="문항">
          <div className="question-copy">
            <span>Question {firstQuestion.order}</span>
            <p>{firstQuestion.ttsScriptEn}</p>
          </div>
        </section>
      </main>

      <div className="exam-modal-backdrop" role="presentation">
        <section
          className="exam-modal auth-required-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`auth-required-title-${exam.id}`}
          aria-describedby={`auth-required-desc-${exam.id}`}
        >
          <div className="exam-modal-heading">
            <span className="exam-modal-icon">
              <LockIcon />
            </span>
            <div>
              <h2 id={`auth-required-title-${exam.id}`}>로그인 후 시험 보기</h2>
              <p id={`auth-required-desc-${exam.id}`}>로그인 하고 Moldo를 사용해보세요.</p>
            </div>
          </div>

          <form className="auth-modal-form" onSubmit={handleSubmit}>
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
              <button className="button secondary exam-modal-button" type="button" onClick={() => router.push("/")}>
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
    </div>
  );
}
