"use client";

import Link from "next/link";
import { useState } from "react";

type ExamIconName =
  | "chart"
  | "chevron"
  | "check"
  | "clock"
  | "headphones"
  | "image"
  | "info"
  | "play"
  | "speaker"
  | "spinner"
  | "volume";

const questionNumbers = Array.from({ length: 15 }, (_, index) => index + 1);

function ExamIcon({ name }: { name: ExamIconName }) {
  if (name === "chart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20h14" />
        <path d="M8 17v-5" />
        <path d="M12 17V7" />
        <path d="M16 17v-9" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.3 2.3 4.7-5" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "headphones") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M4 14v5h4v-7H4Z" />
        <path d="M20 14v5h-4v-7h4Z" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m4 16 4.5-4.5 3.5 3.5 2.5-2.5L20 18" />
      </svg>
    );
  }

  if (name === "info") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 7 8 5-8 5V7Z" />
      </svg>
    );
  }

  if (name === "speaker") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9v6h4l5 4V5L9 9H5Z" />
        <path d="M17 9.5a4 4 0 0 1 0 5" />
      </svg>
    );
  }

  if (name === "spinner") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 0 1 9 9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M18 8a6 6 0 0 1 0 8" />
      <path d="M20.5 5.5a10 10 0 0 1 0 13" />
    </svg>
  );
}

export default function ExamPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isGrading, setIsGrading] = useState(false);

  function handleNextQuestion() {
    if (currentQuestion === questionNumbers.length) {
      setIsGrading(true);
      return;
    }

    setCurrentQuestion((question) => question + 1);
  }

  return (
    <div className="exam-shell">
      <header className="exam-topbar">
        <Link className="exam-brand" href="/" aria-label="Ditto 홈">
          Ditto
        </Link>

        <div className="exam-status">
          <div className="exam-total-time" aria-label="남은 시험 시간">
            <ExamIcon name="clock" />
            <span>14:28</span>
          </div>
          <span className="exam-divider" aria-hidden="true" />
          <button className="exam-end-button" type="button">
            시험 종료
          </button>
        </div>
      </header>

      {isGrading ? (
        <main className="exam-grading-workspace" aria-labelledby="grading-title">
          <section className="grading-panel" aria-live="polite">
            <div className="grading-visual" aria-hidden="true">
              <div className="grading-ring">
                <ExamIcon name="chart" />
              </div>
            </div>

            <div className="grading-copy">
              <h1 id="grading-title">채점 중입니다...</h1>
              <p>잠시만 기다려 주세요.</p>
            </div>

            <div className="grading-progress" aria-label="채점 진행률 62%">
              <span />
              <strong>62%</strong>
            </div>

            <ul className="grading-step-list" aria-label="채점 단계">
              <li>
                <span className="grading-step-icon done">
                  <ExamIcon name="check" />
                </span>
                <span>음성 분석</span>
                <strong>완료</strong>
              </li>
              <li>
                <span className="grading-step-icon done">
                  <ExamIcon name="check" />
                </span>
                <span>문장 전사</span>
                <strong>완료</strong>
              </li>
              <li>
                <span className="grading-step-icon active">
                  <ExamIcon name="spinner" />
                </span>
                <span>피드백 생성</span>
                <strong>진행 중</strong>
              </li>
            </ul>

            <p className="grading-estimate">채점은 평균 30~60초 정도 소요됩니다.</p>
          </section>
        </main>
      ) : (
      <main className="exam-workspace">
        <section className="stimulus-panel" aria-labelledby="stimulus-title">
          <h1 id="stimulus-title">
            <ExamIcon name="image" />
            지문 / 이미지
          </h1>

          <div className="stimulus-placeholder" aria-label="이미지 지문 영역">
            <div className="placeholder-window" aria-hidden="true">
              <span className="placeholder-plant" />
              <span className="placeholder-mug" />
              <span className="placeholder-frame" />
              <span className="placeholder-chair" />
              <span className="placeholder-table" />
            </div>
          </div>

          <div className="audio-section">
            <h2>
              <ExamIcon name="speaker" />
              지문 듣기
            </h2>

            <div className="audio-player" aria-label="지문 오디오 플레이어">
              <button className="audio-play-button" type="button" aria-label="재생">
                <ExamIcon name="play" />
              </button>
              <time>0:00</time>
              <div className="audio-track" aria-hidden="true">
                <span />
              </div>
              <time>0:30</time>
              <button className="audio-volume-button" type="button" aria-label="음량">
                <ExamIcon name="volume" />
              </button>
            </div>
          </div>
        </section>

        <section className="question-panel" aria-label="문항 풀이">
          <section className="question-progress-card" aria-labelledby="progress-title">
            <h2 id="progress-title">문항 진행</h2>
            <div className="question-number-grid" aria-label="문항 번호">
              {questionNumbers.map((number) => (
                <button
                  className={number === currentQuestion ? "active" : ""}
                  type="button"
                  key={number}
                  aria-current={number === currentQuestion ? "step" : undefined}
                >
                  {number}
                </button>
              ))}
            </div>
          </section>

          <section className="prompt-card audio-prompt-card">
            <div>
              <h2>
                <ExamIcon name="headphones" />
                오디오 문항
              </h2>
              <p>지문을 듣고 바로 답변하세요.</p>
            </div>
          </section>

          <section className="answer-timer-card" aria-labelledby="answer-time-title">
            <div className="answer-time-heading">
              <ExamIcon name="clock" />
              <h2 id="answer-time-title">답변 시간</h2>
            </div>
            <strong>01:00</strong>
          </section>

          <div className="recording-notice" role="status">
            <ExamIcon name="info" />
            <span>지문 재생 후 자동으로 녹음이 시작됩니다.</span>
          </div>

          <div className="question-actions">
            <button className="button primary next-question-button" type="button" onClick={handleNextQuestion}>
              {currentQuestion === questionNumbers.length ? "채점하기" : "다음 문항"}
              <ExamIcon name="chevron" />
            </button>
          </div>
        </section>
      </main>
      )}
    </div>
  );
}
