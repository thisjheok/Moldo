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
  username: string;
  email: string;
  name: string;
  totalExamCount: number;
};
