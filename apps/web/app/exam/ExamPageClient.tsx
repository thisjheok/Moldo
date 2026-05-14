"use client";

import type { ExamQuestion, ExamSession } from "@repo/types";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { submitAnswer, submitSession } from "../../lib/api";
import { formatDuration } from "../../utils/formatters";

type ExamPageClientProps = {
  questions: ExamQuestion[];
  session: ExamSession;
};

type ExamIconName =
  | "chart"
  | "chevron"
  | "check"
  | "clock"
  | "headphones"
  | "image"
  | "info"
  | "mic"
  | "play"
  | "speaker"
  | "spinner"
  | "volume";

type QuestionAnswerState = {
  hasPlayed: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isCompleted: boolean;
  remainingSeconds: number;
  audioBlob: Blob | null;
};

const questionReplayCount = 2;

function createInitialQuestionState(questions: ExamQuestion[]): QuestionAnswerState[] {
  return questions.map((question) => ({
    hasPlayed: false,
    isPlaying: false,
    isRecording: false,
    isCompleted: false,
    remainingSeconds: question.answerSeconds,
    audioBlob: null,
  }));
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

function selectFemaleEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferredNames = [
    "Samantha",
    "Google UK English Female",
    "Microsoft Jenny",
    "Microsoft Aria",
    "Microsoft Zira",
    "Karen",
    "Moira",
    "Tessa",
    "Victoria",
    "Fiona",
    "Serena",
  ];

  return (
    preferredNames
      .map((name) => englishVoices.find((voice) => voice.name.includes(name)))
      .find(Boolean) ??
    englishVoices.find((voice) => /female|woman|girl/i.test(voice.name)) ??
    englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us") ??
    englishVoices[0] ??
    null
  );
}

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

  if (name === "mic") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4Z" />
        <path d="M19 10a7 7 0 0 1-14 0" />
        <path d="M12 17v4" />
        <path d="M8 21h8" />
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

export function ExamPageClient({ questions, session }: ExamPageClientProps) {
  const [currentQuestion, setCurrentQuestion] = useState(session.currentQuestionOrder);
  const [isGrading, setIsGrading] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [questionStates, setQuestionStates] = useState<QuestionAnswerState[]>(() =>
    createInitialQuestionState(questions),
  );
  const [microphoneError, setMicrophoneError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingQuestionIndexRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);
  const autoPlayedQuestionRef = useRef<number | null>(null);
  const playbackSessionRef = useRef(0);
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const currentQuestionIndex = questions.findIndex((question) => question.order === currentQuestion);
  const safeCurrentQuestionIndex = currentQuestionIndex >= 0 ? currentQuestionIndex : 0;
  const currentQuestionData = questions[safeCurrentQuestionIndex] ?? questions[0];
  const currentQuestionState = questionStates[safeCurrentQuestionIndex] ?? questionStates[0];
  const questionNumbers = questions.map((question) => question.order);
  const completedAnswerCount = questionStates.filter((questionState) => questionState.isCompleted).length;
  const savedRecordingCount = questionStates.filter((questionState) => questionState.audioBlob).length;
  const totalExamSeconds = questions.reduce((total, question) => total + question.answerSeconds, 0);
  const totalRemainingSeconds = questionStates.reduce(
    (total, questionState) => total + questionState.remainingSeconds,
    0,
  );
  const isCurrentQuestionComplete = Boolean(currentQuestionState?.isCompleted);

  const persistAnswer = useCallback(
    async (audioBlob: Blob, questionIndex: number) => {
      const question = questions[questionIndex];

      if (!question) {
        return;
      }

      setIsSavingAnswer(true);

      try {
        await submitAnswer(session.id, {
          questionId: question.id,
          questionOrder: question.order,
          durationSeconds: Math.max(question.answerSeconds - (questionStates[questionIndex]?.remainingSeconds ?? 0), 0),
          audioFileName: `${question.id}.${audioBlob.type.includes("mp4") ? "m4a" : "webm"}`,
          mimeType: audioBlob.type || undefined,
        });
      } catch {
        setMicrophoneError("답변 저장에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setIsSavingAnswer(false);
      }
    },
    [questionStates, questions, session.id],
  );

  const startRecording = useCallback(async () => {
    if (currentQuestionState?.isRecording || currentQuestionState?.isCompleted) {
      return;
    }

    setMicrophoneError("");
    setQuestionStates((states) =>
      states.map((questionState, index) =>
        index === safeCurrentQuestionIndex ? { ...questionState, hasPlayed: true, isPlaying: false } : questionState,
      ),
    );

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicrophoneError("이 브라우저에서는 음성 녹음을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      audioChunksRef.current = [];
      recordingQuestionIndexRef.current = safeCurrentQuestionIndex;
      mediaStreamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const questionIndex = recordingQuestionIndexRef.current;
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (questionIndex !== null) {
          setQuestionStates((states) =>
            states.map((questionState, index) =>
              index === questionIndex
                ? {
                    ...questionState,
                    isRecording: false,
                    isCompleted: true,
                    audioBlob,
                  }
                : questionState,
            ),
          );
          void persistAnswer(audioBlob, questionIndex);
        }

        stream.getTracks().forEach((track) => track.stop());
        if (mediaStreamRef.current === stream) {
          mediaStreamRef.current = null;
        }
        if (recorderRef.current === recorder) {
          recorderRef.current = null;
        }
        recordingQuestionIndexRef.current = null;
      };

      setQuestionStates((states) =>
        states.map((questionState, index) =>
          index === safeCurrentQuestionIndex
            ? {
                ...questionState,
                hasPlayed: true,
                isPlaying: false,
                isRecording: true,
                remainingSeconds:
                  questionState.remainingSeconds > 0 ? questionState.remainingSeconds : currentQuestionData.answerSeconds,
              }
            : questionState,
        ),
      );
      recorder.start();
    } catch {
      setMicrophoneError("마이크 권한이 필요합니다. 브라우저 권한을 허용한 뒤 다시 시도해 주세요.");
      setQuestionStates((states) =>
        states.map((questionState, index) =>
          index === safeCurrentQuestionIndex ? { ...questionState, isPlaying: false } : questionState,
        ),
      );
    }
  }, [
    currentQuestionData.answerSeconds,
    currentQuestionState?.isCompleted,
    currentQuestionState?.isRecording,
    persistAnswer,
    safeCurrentQuestionIndex,
  ]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    setQuestionStates((states) =>
      states.map((questionState, index) =>
        index === safeCurrentQuestionIndex ? { ...questionState, isRecording: false } : questionState,
      ),
    );
  }, [safeCurrentQuestionIndex]);

  useEffect(() => {
    function loadFemaleVoice() {
      femaleVoiceRef.current = selectFemaleEnglishVoice(window.speechSynthesis.getVoices());
    }

    if ("speechSynthesis" in window) {
      loadFemaleVoice();
      window.speechSynthesis.addEventListener("voiceschanged", loadFemaleVoice);
    }

    return () => {
      playbackSessionRef.current += 1;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener("voiceschanged", loadFemaleVoice);
    };
  }, []);

  useEffect(() => {
    if (!currentQuestionState?.isRecording) {
      return;
    }

    const timerId = window.setInterval(() => {
      setQuestionStates((states) =>
        states.map((questionState, index) => {
          if (index !== safeCurrentQuestionIndex || !questionState.isRecording) {
            return questionState;
          }

          return {
            ...questionState,
            remainingSeconds: Math.max(questionState.remainingSeconds - 1, 0),
          };
        }),
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [currentQuestionState?.isRecording, safeCurrentQuestionIndex]);

  useEffect(() => {
    if (currentQuestionState?.isRecording && currentQuestionState.remainingSeconds <= 0) {
      stopRecording();
    }
  }, [currentQuestionState?.isRecording, currentQuestionState?.remainingSeconds, stopRecording]);

  const playCurrentQuestion = useCallback(() => {
    if (currentQuestionState?.isPlaying || currentQuestionState?.isRecording || currentQuestionState?.isCompleted) {
      return;
    }

    setQuestionStates((states) =>
      states.map((questionState, index) =>
        index === safeCurrentQuestionIndex ? { ...questionState, isPlaying: true } : questionState,
      ),
    );

    const sessionId = playbackSessionRef.current + 1;
    playbackSessionRef.current = sessionId;

    if (!("speechSynthesis" in window)) {
      globalThis.setTimeout(() => {
        if (playbackSessionRef.current === sessionId) {
          startRecording();
        }
      }, currentQuestionData.prepSeconds * questionReplayCount * 1000);
      return;
    }

    window.speechSynthesis.cancel();
    const selectedVoice =
      femaleVoiceRef.current ?? selectFemaleEnglishVoice(window.speechSynthesis.getVoices());
    femaleVoiceRef.current = selectedVoice;

    const speakQuestion = (playCount: number) => {
      if (playbackSessionRef.current !== sessionId) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(currentQuestionData.ttsScriptEn);
      utterance.lang = "en-US";
      utterance.rate = 0.82;
      utterance.pitch = 1;
      utterance.voice = selectedVoice;
      utterance.onend = () => {
        if (playbackSessionRef.current !== sessionId) {
          return;
        }

        if (playCount < questionReplayCount) {
          globalThis.setTimeout(() => speakQuestion(playCount + 1), 450);
          return;
        }

        startRecording();
      };
      utterance.onerror = () => {
        if (playbackSessionRef.current !== sessionId) {
          return;
        }

        if (playCount < questionReplayCount) {
          speakQuestion(playCount + 1);
          return;
        }

        startRecording();
      };
      window.speechSynthesis.speak(utterance);
    };

    speakQuestion(1);
  }, [
    currentQuestionData.prepSeconds,
    currentQuestionData.ttsScriptEn,
    currentQuestionState?.isCompleted,
    currentQuestionState?.isPlaying,
    currentQuestionState?.isRecording,
    safeCurrentQuestionIndex,
    startRecording,
  ]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isGrading) {
      return;
    }

    if (autoPlayedQuestionRef.current === currentQuestion) {
      return;
    }

    autoPlayedQuestionRef.current = currentQuestion;

    const timerId = globalThis.setTimeout(() => {
      playCurrentQuestion();
    }, 150);

    return () => globalThis.clearTimeout(timerId);
  }, [currentQuestion, isGrading, playCurrentQuestion]);

  async function finishExam() {
    playbackSessionRef.current += 1;
    window.speechSynthesis?.cancel();
    setIsGrading(true);
    setMicrophoneError("");

    try {
      await submitSession(session.id);
    } catch {
      setIsGrading(false);
      setMicrophoneError("세션 제출에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  function handleNextQuestion() {
    if (!isCurrentQuestionComplete || isSavingAnswer) {
      return;
    }

    if (safeCurrentQuestionIndex === questions.length - 1) {
      void finishExam();
      return;
    }

    setCurrentQuestion(questions[safeCurrentQuestionIndex + 1]?.order ?? currentQuestion);
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
            <span>{formatDuration(Math.min(totalExamSeconds, totalRemainingSeconds), { padMinutes: true })}</span>
          </div>
          <span className="exam-divider" aria-hidden="true" />
          <button className="exam-end-button" type="button" onClick={() => void finishExam()} disabled={currentQuestionState?.isRecording}>
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
                <span>문항 수집</span>
                <strong>완료</strong>
              </li>
              <li>
                <span className="grading-step-icon done">
                  <ExamIcon name="check" />
                </span>
                <span>답변 저장</span>
                <strong>완료</strong>
              </li>
              <li>
                <span className="grading-step-icon active">
                  <ExamIcon name="spinner" />
                </span>
                <span>세션 제출</span>
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
                <button
                  className="audio-play-button"
                  type="button"
                  aria-label="재생"
                  onClick={playCurrentQuestion}
                  disabled={currentQuestionState?.isPlaying || currentQuestionState?.hasPlayed || currentQuestionState?.isRecording}
                >
                  <ExamIcon name="play" />
                </button>
                <time>0:00</time>
                <div className="audio-track" aria-hidden="true">
                  <span style={{ width: currentQuestionState?.hasPlayed ? "100%" : "2%" }} />
                </div>
                <time>{formatDuration(currentQuestionData.prepSeconds, { padMinutes: true })}</time>
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
                    className={[
                      number === currentQuestion ? "active" : "",
                      questionStates[number - 1]?.hasPlayed ? "played" : "",
                      questionStates[number - 1]?.isPlaying ? "playing" : "",
                      questionStates[number - 1]?.isRecording ? "recording" : "",
                      questionStates[number - 1]?.isCompleted ? "completed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    key={number}
                    aria-current={number === currentQuestion ? "step" : undefined}
                    aria-label={`문항 ${number}, ${
                      questionStates[number - 1]?.isCompleted
                        ? "답변 완료"
                        : questionStates[number - 1]?.isRecording
                          ? "녹음 중"
                          : questionStates[number - 1]?.isPlaying
                            ? "재생 중"
                            : questionStates[number - 1]?.hasPlayed
                              ? "재생 완료"
                              : "대기"
                    }`}
                    disabled={questionStates.some((questionState) => questionState.isRecording)}
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
                <p>지문이 2회 재생된 뒤 자동으로 답변 시간이 시작됩니다.</p>
              </div>
            </section>

            <section className="answer-timer-card" aria-labelledby="answer-time-title">
              <div className="answer-time-heading">
                <ExamIcon name="clock" />
                <h2 id="answer-time-title">답변 시간</h2>
              </div>
              <strong>{formatDuration(currentQuestionState?.remainingSeconds ?? 0, { padMinutes: true })}</strong>
            </section>

            <div className="recording-notice" role="status" aria-live="polite">
              <ExamIcon name={currentQuestionState?.isRecording ? "mic" : currentQuestionState?.isCompleted ? "check" : "info"} />
              <span>
                {microphoneError ||
                  (isSavingAnswer
                    ? "답변을 저장하는 중입니다."
                    : currentQuestionState?.isCompleted
                      ? `${completedAnswerCount}/${questions.length} 답변 완료 · ${savedRecordingCount}개 녹음 저장`
                      : currentQuestionState?.isRecording
                        ? "답변 중입니다. 시간이 끝나면 자동으로 저장됩니다."
                        : currentQuestionState?.isPlaying
                          ? "지문 재생 중입니다. 2회 재생이 끝나면 자동으로 답변 시간이 시작됩니다."
                          : currentQuestionState?.hasPlayed
                            ? "지문 재생이 끝나면 자동으로 답변 시간이 시작됩니다."
                            : "지문 2회 재생 후 자동으로 답변 시간이 시작됩니다.")}
              </span>
            </div>

            <div className="question-actions">
              <button
                className="button primary next-question-button"
                type="button"
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionComplete || currentQuestionState?.isRecording || isSavingAnswer}
              >
                {safeCurrentQuestionIndex === questions.length - 1 ? "채점하기" : "다음 문항"}
                <ExamIcon name="chevron" />
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
