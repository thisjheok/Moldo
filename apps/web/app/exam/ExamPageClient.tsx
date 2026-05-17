"use client";

import type { ExamAttempt, ExamQuestion } from "@moldo/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import avaImage from "../assets/ava.png";
import { getAttempt, submitAttempt, uploadAttemptAnswerAudio } from "../../lib/api";
import { formatDuration } from "../../utils/formatters";

type ExamPageClientProps = {
  questions: ExamQuestion[];
  attempt: ExamAttempt;
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
  playbackCount: number;
  isReplayAvailable: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isCompleted: boolean;
  recordingSeconds: number;
  audioBlob: Blob | null;
};

const maxQuestionPlaybackCount = 2;
const maxGradableAnswerSeconds = 120;

function createInitialQuestionState(questions: ExamQuestion[]): QuestionAnswerState[] {
  return questions.map(() => ({
    hasPlayed: false,
    playbackCount: 0,
    isReplayAvailable: false,
    isPlaying: false,
    isRecording: false,
    isCompleted: false,
    recordingSeconds: 0,
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

export function ExamPageClient({ questions, attempt }: ExamPageClientProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(attempt.currentQuestionOrder);
  const [isGrading, setIsGrading] = useState(false);
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [questionStates, setQuestionStates] = useState<QuestionAnswerState[]>(() =>
    createInitialQuestionState(questions),
  );
  const [microphoneError, setMicrophoneError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingQuestionIndexRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const discardedRecordersRef = useRef<WeakSet<MediaRecorder>>(new WeakSet());
  const pendingAfterSaveRef = useRef<(() => void) | null>(null);
  const playbackSessionRef = useRef(0);
  const replayWindowTimerRef = useRef<number | null>(null);
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const currentQuestionIndex = questions.findIndex((question) => question.order === currentQuestion);
  const safeCurrentQuestionIndex = currentQuestionIndex >= 0 ? currentQuestionIndex : 0;
  const currentQuestionData = questions[safeCurrentQuestionIndex] ?? questions[0];
  const currentQuestionState = questionStates[safeCurrentQuestionIndex] ?? questionStates[0];
  const questionNumbers = questions.map((question) => question.order);

  const clearReplayWindowTimer = useCallback(() => {
    if (replayWindowTimerRef.current !== null) {
      window.clearTimeout(replayWindowTimerRef.current);
      replayWindowTimerRef.current = null;
    }
  }, []);

  const persistAnswer = useCallback(
    async (audioBlob: Blob, questionIndex: number, durationSeconds: number) => {
      const question = questions[questionIndex];

      if (!question) {
        return;
      }

      setIsSavingAnswer(true);

      try {
        await uploadAttemptAnswerAudio(attempt.id, {
          questionId: question.id,
          questionOrder: question.order,
          durationSeconds: Math.min(durationSeconds, maxGradableAnswerSeconds),
          audioFileName: `${question.id}.${audioBlob.type.includes("mp4") ? "m4a" : "webm"}`,
          mimeType: audioBlob.type || undefined,
          audioBlob,
        });
      } catch {
        setMicrophoneError("답변 저장에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setIsSavingAnswer(false);
      }
    },
    [attempt.id, questions],
  );

  const startRecording = useCallback(async (options?: { keepReplayAvailable?: boolean; resetRemainingSeconds?: boolean }) => {
    if (
      currentQuestionState?.isCompleted ||
      (recorderRef.current && recorderRef.current.state !== "inactive")
    ) {
      return;
    }

    if (!options?.keepReplayAvailable) {
      clearReplayWindowTimer();
    }
    setMicrophoneError("");
    setQuestionStates((states) =>
      states.map((questionState, index) =>
        index === safeCurrentQuestionIndex
          ? {
              ...questionState,
              hasPlayed: true,
              isReplayAvailable: options?.keepReplayAvailable ? questionState.isReplayAvailable : false,
              isPlaying: false,
            }
          : questionState,
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
      const recordingQuestionIndex = safeCurrentQuestionIndex;
      const audioChunks: BlobPart[] = [];

      recordingQuestionIndexRef.current = recordingQuestionIndex;
      recordingStartedAtRef.current = Date.now();
      mediaStreamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: recorder.mimeType || "audio/webm",
        });
        const shouldDiscardRecording = discardedRecordersRef.current.has(recorder);

        if (!shouldDiscardRecording) {
          const durationSeconds =
            recordingStartedAtRef.current === null
              ? 0
              : Math.min(Math.round((Date.now() - recordingStartedAtRef.current) / 1000), maxGradableAnswerSeconds);

          setQuestionStates((states) =>
            states.map((questionState, index) =>
              index === recordingQuestionIndex
                ? {
                    ...questionState,
                    isRecording: false,
                    isCompleted: true,
                    recordingSeconds: durationSeconds,
                    audioBlob,
                  }
                : questionState,
            ),
          );
          void persistAnswer(audioBlob, recordingQuestionIndex, durationSeconds).finally(() => {
            const pendingAfterSave = pendingAfterSaveRef.current;
            pendingAfterSaveRef.current = null;
            pendingAfterSave?.();
          });
        }

        stream.getTracks().forEach((track) => track.stop());
        if (mediaStreamRef.current === stream) {
          mediaStreamRef.current = null;
        }
        if (recorderRef.current === recorder) {
          recorderRef.current = null;
        }
        recordingQuestionIndexRef.current = null;
        recordingStartedAtRef.current = null;
      };

      setQuestionStates((states) =>
        states.map((questionState, index) =>
          index === safeCurrentQuestionIndex
            ? {
                ...questionState,
                hasPlayed: true,
                isReplayAvailable: options?.keepReplayAvailable ? questionState.isReplayAvailable : false,
                isPlaying: false,
                isRecording: true,
                recordingSeconds: options?.resetRemainingSeconds ? 0 : questionState.recordingSeconds,
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
    currentQuestionState?.isCompleted,
    clearReplayWindowTimer,
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
            recordingSeconds: Math.min(questionState.recordingSeconds + 1, maxGradableAnswerSeconds),
          };
        }),
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [currentQuestionState?.isRecording, safeCurrentQuestionIndex]);

  useEffect(() => {
    if (
      currentQuestionState?.isRecording &&
      currentQuestionState.recordingSeconds >= maxGradableAnswerSeconds
    ) {
      stopRecording();
    }
  }, [currentQuestionState?.isRecording, currentQuestionState?.recordingSeconds, stopRecording]);

  const playCurrentQuestion = useCallback(() => {
    const playbackCount = currentQuestionState?.playbackCount ?? 0;
    const canPlayQuestion = playbackCount === 0 || (playbackCount === 1 && currentQuestionState?.isReplayAvailable);
    const isReplayingDuringRecording =
      currentQuestionState?.isRecording && playbackCount === 1 && currentQuestionState?.isReplayAvailable;

    if (
      currentQuestionState?.isPlaying ||
      currentQuestionState?.isCompleted ||
      !canPlayQuestion
    ) {
      return;
    }

    if (isReplayingDuringRecording) {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        discardedRecordersRef.current.add(recorder);
        recorder.stop();
      }
    }

    if (playbackCount === 1) {
      clearReplayWindowTimer();
    }

    setQuestionStates((states) =>
      states.map((questionState, index) =>
        index === safeCurrentQuestionIndex
          ? {
              ...questionState,
              isReplayAvailable: false,
              isPlaying: true,
              isRecording: false,
              recordingSeconds: isReplayingDuringRecording ? 0 : questionState.recordingSeconds,
              audioBlob: isReplayingDuringRecording ? null : questionState.audioBlob,
            }
          : questionState,
      ),
    );

    const sessionId = playbackSessionRef.current + 1;
    playbackSessionRef.current = sessionId;

    const completePlayback = () => {
      const completedPlaybackCount = Math.min(playbackCount + 1, maxQuestionPlaybackCount);

      setQuestionStates((states) =>
        states.map((questionState, index) =>
          {
            if (index !== safeCurrentQuestionIndex) {
              return questionState;
            }

            return {
              ...questionState,
              hasPlayed: true,
              playbackCount: completedPlaybackCount,
              isReplayAvailable: completedPlaybackCount === 1,
              isPlaying: false,
            };
          },
        ),
      );

      if (completedPlaybackCount >= maxQuestionPlaybackCount) {
        startRecording({ resetRemainingSeconds: true });
        return;
      }

      replayWindowTimerRef.current = window.setTimeout(() => {
        replayWindowTimerRef.current = null;
        setQuestionStates((states) =>
          states.map((questionState, index) =>
            index === safeCurrentQuestionIndex ? { ...questionState, isReplayAvailable: false } : questionState,
          ),
        );
      }, 5000);

      startRecording({ keepReplayAvailable: true, resetRemainingSeconds: true });
    };

    if (!("speechSynthesis" in window)) {
      const timerId = globalThis.setTimeout(() => {
        if (playbackSessionRef.current === sessionId) {
          completePlayback();
        }
      }, currentQuestionData.prepSeconds * 1000);

      return () => {
        globalThis.clearTimeout(timerId);
      };
    }

    window.speechSynthesis.cancel();
    const selectedVoice =
      femaleVoiceRef.current ?? selectFemaleEnglishVoice(window.speechSynthesis.getVoices());
    femaleVoiceRef.current = selectedVoice;

    const speakQuestion = () => {
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

        completePlayback();
      };
      utterance.onerror = () => {
        if (playbackSessionRef.current !== sessionId) {
          return;
        }

        completePlayback();
      };
      window.speechSynthesis.speak(utterance);
    };

    speakQuestion();
  }, [
    currentQuestionData.prepSeconds,
    currentQuestionData.ttsScriptEn,
    clearReplayWindowTimer,
    currentQuestionState?.isCompleted,
    currentQuestionState?.isReplayAvailable,
    currentQuestionState?.isPlaying,
    currentQuestionState?.playbackCount,
    currentQuestionState?.isRecording,
    safeCurrentQuestionIndex,
    startRecording,
  ]);

  async function submitCurrentAttempt() {
    playbackSessionRef.current += 1;
    clearReplayWindowTimer();
    window.speechSynthesis?.cancel();
    setIsGrading(true);
    setMicrophoneError("");

    try {
      await submitAttempt(attempt.id);
      setSubmittedAttemptId(attempt.id);
    } catch {
      setIsGrading(false);
      setMicrophoneError("세션 제출에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  async function finishExam() {
    if (currentQuestionState?.isRecording) {
      pendingAfterSaveRef.current = () => void submitCurrentAttempt();
      stopRecording();
      return;
    }

    await submitCurrentAttempt();
  }

  useEffect(() => {
    if (!isGrading || !submittedAttemptId) {
      return;
    }

    const attemptId = submittedAttemptId;
    let isActive = true;

    async function pollAttempt() {
      try {
        const latestAttempt = await getAttempt(attemptId);

        if (!isActive) {
          return;
        }

        if (latestAttempt.status === "completed" && latestAttempt.resultId) {
          router.push(`/result?resultId=${latestAttempt.resultId}`);
          return;
        }

        if (latestAttempt.status === "failed") {
          setIsGrading(false);
          setMicrophoneError("채점에 실패했습니다. 다시 제출해 주세요.");
        }
      } catch {
        if (isActive) {
          setIsGrading(false);
          setMicrophoneError("채점 상태를 확인하지 못했습니다. 다시 시도해 주세요.");
        }
      }
    }

    void pollAttempt();
    const timerId = window.setInterval(() => void pollAttempt(), 1200);

    return () => {
      isActive = false;
      window.clearInterval(timerId);
    };
  }, [isGrading, router, submittedAttemptId]);

  function handleNextQuestion() {
    if (isSavingAnswer) {
      return;
    }

    if (currentQuestionState?.isRecording) {
      pendingAfterSaveRef.current = () => {
        if (safeCurrentQuestionIndex === questions.length - 1) {
          void submitCurrentAttempt();
          return;
        }

        setCurrentQuestion(questions[safeCurrentQuestionIndex + 1]?.order ?? currentQuestion);
      };
      stopRecording();
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
        <Link className="exam-brand" href="/" aria-label="Moldo 홈">
          Moldo
        </Link>

        <div className="exam-status">
          <button className="exam-end-button" type="button" onClick={() => void finishExam()} disabled={isSavingAnswer}>
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
        <main className="exam-workspace opic-exam-workspace">
          <h1 className="opic-question-heading">
            Question {currentQuestion} of {questions.length}
          </h1>

          <section className="stimulus-panel opic-stimulus-panel" aria-label="Ava">
            <div className="stimulus-placeholder" aria-label="이미지 지문 영역">
              <Image className="stimulus-image" src={avaImage} alt="시험관" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>

            <div className="audio-section" aria-label="지문 재생">
              <div className="audio-player" aria-label="지문 오디오 플레이어">
                <button
                  className="audio-play-button"
                  type="button"
                  aria-label="재생"
                  onClick={playCurrentQuestion}
                  disabled={
                    currentQuestionState?.isPlaying ||
                    currentQuestionState?.isCompleted ||
                    !(
                      (currentQuestionState?.playbackCount ?? 0) === 0 ||
                      ((currentQuestionState?.playbackCount ?? 0) === 1 && currentQuestionState?.isReplayAvailable)
                    )
                  }
                >
                  <ExamIcon name="play" />
                </button>
                <time>0:00</time>
                <div className="audio-track" aria-hidden="true">
                  <span style={{ width: `${((currentQuestionState?.playbackCount ?? 0) / maxQuestionPlaybackCount) * 100}%` }} />
                </div>
                <time>{formatDuration(currentQuestionData.prepSeconds, { padMinutes: true })}</time>
                <button className="audio-volume-button" type="button" aria-label="음량">
                  <ExamIcon name="volume" />
                </button>
              </div>
            </div>
          </section>

          <section className="question-panel opic-question-panel" aria-label="문항 풀이">
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
          </section>

          <div className="question-actions opic-question-actions">
            <button
              className="button primary next-question-button"
              type="button"
              onClick={handleNextQuestion}
              disabled={isSavingAnswer}
            >
              {safeCurrentQuestionIndex === questions.length - 1 ? "채점하기" : "다음 문항"}
              <ExamIcon name="chevron" />
            </button>
          </div>

          <span className="sr-only" role="status" aria-live="polite">
            {microphoneError || (isSavingAnswer ? "답변을 저장하는 중입니다." : "")}
          </span>
        </main>
      )}
    </div>
  );
}
