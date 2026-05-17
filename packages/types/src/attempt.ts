export type AttemptStatus = "in_progress" | "submitted" | "grading" | "completed" | "failed";

export type AttemptAnswerMetadata = {
  questionId: string;
  questionOrder: number;
  durationSeconds: number;
  audioFileName?: string;
  mimeType?: string;
  audioStorageKey?: string;
  audioUrl?: string;
  uploadedAt?: string;
  recordedAt: string;
};

export type ExamAttempt = {
  id: string;
  examId: string;
  status: AttemptStatus;
  resultId?: string;
  startedAt: string;
  currentQuestionOrder: number;
  answers: AttemptAnswerMetadata[];
  submittedAt?: string;
};
