export type SessionStatus = "in_progress" | "submitted" | "grading" | "completed" | "failed";

export type SessionAnswerMetadata = {
  questionId: string;
  questionOrder: number;
  durationSeconds: number;
  audioFileName?: string;
  mimeType?: string;
  recordedAt: string;
};

export type ExamSession = {
  id: string;
  examId: string;
  status: SessionStatus;
  resultId?: string;
  startedAt: string;
  currentQuestionOrder: number;
  answers: SessionAnswerMetadata[];
  submittedAt?: string;
};
