import type {
  ExamHistoryItem,
  ExamQuestion,
  ExamResult,
  ExamSession,
  ExamSummary,
  MyPageProfile,
  SessionAnswerMetadata,
} from "@repo/types";

import { apiRequest } from "./http";

export type SubmitAnswerInput = Omit<SessionAnswerMetadata, "recordedAt">;

export function listExams(): Promise<ExamSummary[]> {
  return apiRequest<ExamSummary[]>("/exams");
}

export function getExam(examId: string): Promise<ExamSummary> {
  return apiRequest<ExamSummary>(`/exams/${examId}`);
}

export function getExamQuestions(examId: string): Promise<ExamQuestion[]> {
  return apiRequest<ExamQuestion[]>(`/exams/${examId}/questions`);
}

export function createSession(examId: string): Promise<ExamSession> {
  return apiRequest<ExamSession>("/sessions", {
    method: "POST",
    body: JSON.stringify({ examId }),
  });
}

export function submitAnswer(sessionId: string, answer: SubmitAnswerInput): Promise<ExamSession> {
  return apiRequest<ExamSession>(`/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify(answer),
  });
}

export function submitSession(sessionId: string): Promise<ExamSession> {
  return apiRequest<ExamSession>(`/sessions/${sessionId}/submit`, {
    method: "POST",
  });
}

export function getResult(resultId: string): Promise<ExamResult> {
  return apiRequest<ExamResult>(`/results/${resultId}`);
}

export function listMyResults(): Promise<ExamHistoryItem[]> {
  return apiRequest<ExamHistoryItem[]>("/me/results");
}

export function getMyProfile(): Promise<MyPageProfile> {
  return apiRequest<MyPageProfile>("/me/profile");
}
