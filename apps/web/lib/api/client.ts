import type {
  AttemptAnswerMetadata,
  ExamHistoryItem,
  ExamQuestion,
  ExamResult,
  ExamAttempt,
  ExamSummary,
  MyPageProfile,
  SessionAnswerMetadata,
  ExamSession,
} from "@moldo/types";

import { getApiBaseUrl } from "./config";
import { apiRequest, type ApiRequestInit } from "./http";

export type SubmitAnswerInput = Omit<SessionAnswerMetadata, "recordedAt">;
export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  name: string;
};
export type AuthSession = {
  user: AuthenticatedUser;
};
export type UploadAttemptAnswerAudioInput = Omit<
  AttemptAnswerMetadata,
  "audioStorageKey" | "audioUrl" | "recordedAt" | "uploadedAt"
> & {
  audioBlob: Blob;
};

export function login(username: string, password: string): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function signup(
  username: string,
  email: string,
  password: string,
  name: string,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password, name }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export function getAuthSession(init?: ApiRequestInit): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/me", init);
}

export function listExams(): Promise<ExamSummary[]> {
  return apiRequest<ExamSummary[]>("/exams");
}

export function getExam(examId: string, init?: ApiRequestInit): Promise<ExamSummary> {
  return apiRequest<ExamSummary>(`/exams/${examId}`, init);
}

export function getExamQuestions(examId: string): Promise<ExamQuestion[]> {
  return apiRequest<ExamQuestion[]>(`/exams/${examId}/questions`);
}

export function createSession(examId: string, init?: ApiRequestInit): Promise<ExamSession> {
  return apiRequest<ExamSession>("/sessions", {
    ...init,
    method: "POST",
    body: JSON.stringify({ examId }),
  });
}

export function createAttempt(examId: string, init?: ApiRequestInit): Promise<ExamAttempt> {
  return apiRequest<ExamAttempt>("/attempts", {
    ...init,
    method: "POST",
    body: JSON.stringify({ examId }),
  });
}

export function getAttempt(attemptId: string, init?: ApiRequestInit): Promise<ExamAttempt> {
  return apiRequest<ExamAttempt>(`/attempts/${attemptId}`, init);
}

export async function uploadAttemptAnswerAudio(
  attemptId: string,
  answer: UploadAttemptAnswerAudioInput,
): Promise<ExamAttempt> {
  const params = new URLSearchParams({
    questionOrder: String(answer.questionOrder),
    durationSeconds: String(answer.durationSeconds),
  });

  if (answer.audioFileName) {
    params.set("audioFileName", answer.audioFileName);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/attempts/${attemptId}/answers/${answer.questionId}/audio?${params.toString()}`,
    {
      method: "POST",
      headers: answer.mimeType ? { "Content-Type": answer.mimeType } : undefined,
      body: answer.audioBlob,
      cache: "no-store",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Audio upload failed with status ${response.status}.`);
  }

  return response.json() as Promise<ExamAttempt>;
}

export function submitAttempt(attemptId: string, init?: ApiRequestInit): Promise<ExamAttempt> {
  return apiRequest<ExamAttempt>(`/attempts/${attemptId}/submit`, {
    ...init,
    method: "POST",
  });
}

export function submitAnswer(
  sessionId: string,
  answer: SubmitAnswerInput,
  init?: ApiRequestInit,
): Promise<ExamSession> {
  return apiRequest<ExamSession>(`/sessions/${sessionId}/answers`, {
    ...init,
    method: "POST",
    body: JSON.stringify(answer),
  });
}

export function submitSession(sessionId: string, init?: ApiRequestInit): Promise<ExamSession> {
  return apiRequest<ExamSession>(`/sessions/${sessionId}/submit`, {
    ...init,
    method: "POST",
  });
}

export function getResult(resultId: string, init?: ApiRequestInit): Promise<ExamResult> {
  return apiRequest<ExamResult>(`/results/${resultId}`, init);
}

export function listMyResults(init?: ApiRequestInit): Promise<ExamHistoryItem[]> {
  return apiRequest<ExamHistoryItem[]>("/me/results", init);
}

export function getMyProfile(init?: ApiRequestInit): Promise<MyPageProfile> {
  return apiRequest<MyPageProfile>("/me/profile", init);
}
