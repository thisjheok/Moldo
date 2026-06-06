"use client";

import type { ExamQuestion, ExamSummary } from "@moldo/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAttempt } from "../../lib/api";

type StartExamGateProps = {
  exam: ExamSummary;
  questions: ExamQuestion[];
};

function TargetIcon() {
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  );
}

export function StartExamGate({ exam, questions }: StartExamGateProps) {
  const router = useRouter();
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [startError, setStartError] = useState("");
  const firstQuestion = questions[0];

  async function startExam() {
    if (isStartingExam) {
      return;
    }

    setIsStartingExam(true);
    setStartError("");

    try {
      const attempt = await createAttempt(exam.id);
      router.replace(`/exam?attemptId=${attempt.id}`);
    } catch {
      setStartError("시험 세션을 시작하지 못했습니다. 다시 시도해 주세요.");
      setIsStartingExam(false);
    }
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
          className="exam-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`start-exam-title-${exam.id}`}
          aria-describedby={`start-exam-desc-${exam.id}`}
        >
          <div className="exam-modal-heading">
            <span className="exam-modal-icon">
              <TargetIcon />
            </span>
            <div>
              <h2 id={`start-exam-title-${exam.id}`}>시험 시작 전 안내</h2>
              <p id={`start-exam-desc-${exam.id}`}>{exam.title} 응시 전에 아래 내용을 확인해 주세요.</p>
            </div>
          </div>

          <ul className="exam-modal-list">
            <li>조용한 장소에서 마이크 권한을 허용한 뒤 응시해 주세요.</li>
            <li>문항 음성은 제한된 횟수만 재생되며, 재생 후 답변 녹음이 시작됩니다.</li>
            <li>답변이 끝나면 다음 문항으로 이동하고, 마지막 문항 후 채점이 진행됩니다.</li>
            <li>응시 중 새로고침하거나 화면을 벗어나면 답변이 정상 저장되지 않을 수 있습니다.</li>
          </ul>

          {startError ? <p className="exam-modal-warning">{startError}</p> : null}

          <div className="exam-modal-actions">
            <button
              className="button secondary exam-modal-button"
              type="button"
              onClick={() => router.push("/")}
              disabled={isStartingExam}
            >
              취소
            </button>
            <button
              className="button primary exam-modal-button"
              type="button"
              onClick={() => void startExam()}
              disabled={isStartingExam}
            >
              {isStartingExam ? "시작 중" : "확인 완료"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
