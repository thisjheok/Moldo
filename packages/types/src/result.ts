export type ScoreCategory =
  | "question_relevance"
  | "delivery"
  | "fluency"
  | "grammar"
  | "vocabulary"
  | "coherence";

export type ScoreItem = {
  category: ScoreCategory;
  label: string;
  score: number;
  maxScore: number;
};

export type ResultAnswer = {
  questionId: string;
  questionOrder: number;
  questionPrompt: string;
  transcript: string;
  modelAnswer: string;
  audioUrl?: string;
  durationSeconds: number;
  modelAnswerAudioUrl?: string;
  modelAnswerDurationSeconds?: number;
  strengths: string[];
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
  scores: ScoreItem[];
  answers: ResultAnswer[];
};
