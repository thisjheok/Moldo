export type ResultAnswer = {
  questionId: string;
  questionOrder: number;
  questionPrompt: string;
  transcript: string;
  modelAnswer: string;
  score: number;
  maxScore: number;
  audioUrl?: string;
  durationSeconds: number;
  modelAnswerAudioUrl?: string;
  modelAnswerDurationSeconds?: number;
  improvements: string[];
};

export type ExamResult = {
  id: string;
  examId: string;
  examTitle: string;
  takenAt: string;
  questionCount: number;
  totalScore: number;
  maxScore: number;
  answers: ResultAnswer[];
};
