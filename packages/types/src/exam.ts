export type ExamMode = "mock";

export type ExamIconName = "document" | "message" | "target";

export type ExamSummary = {
  id: string;
  title: string;
  tag: string;
  questionCount: number;
  estimatedMinutes: number;
  mode: ExamMode;
  icon: ExamIconName;
  description?: string;
};

export type QuestionType =
  | "self_intro"
  | "personal_prompt"
  | "role_play"
  | "past_experience"
  | "comparison"
  | "problem_solving";

export type ExamQuestion = {
  id: string;
  examId: string;
  order: number;
  type: QuestionType;
  ttsScriptEn: string;
  ttsAudioUrl?: string;
  prepSeconds: number;
  answerSeconds: number;
};
