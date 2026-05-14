export type ExamHistoryItem = {
  id: string;
  resultId: string;
  examId: string;
  examTitle: string;
  takenAt: string;
  questionCount: number;
  totalScore: number;
  maxScore: number;
  durationSeconds: number;
};

export type MyPageProfile = {
  id: string;
  name: string;
  email: string;
  totalExamCount: number;
};
