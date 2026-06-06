import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const testsDir = path.join(rootDir, "tests");
const mockDataDir = path.join(rootDir, "packages", "mock-data");
const examsPath = path.join(mockDataDir, "exams.json");
const questionsPath = path.join(mockDataDir, "exam-questions.json");

const GENERATED_EXAM_ID_PREFIX = "opic-set-";
const DEFAULT_PREP_SECONDS = 30;
const DEFAULT_ANSWER_SECONDS = 90;

const typeByOrder = new Map([
  [1, "self_intro"],
  [11, "role_play"],
  [12, "problem_solving"],
  [13, "past_experience"],
  [15, "role_play"],
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function pad(value, width) {
  return String(value).padStart(width, "0");
}

function questionTypeFor(order, prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (typeByOrder.has(order)) {
    return typeByOrder.get(order);
  }

  if (
    lowerPrompt.includes("compare") ||
    lowerPrompt.includes("different from") ||
    lowerPrompt.includes("changed over time") ||
    lowerPrompt.includes("has changed") ||
    (lowerPrompt.startsWith("how has ") && lowerPrompt.includes("changed")) ||
    lowerPrompt.includes("is changing") ||
    lowerPrompt.includes("different now compared")
  ) {
    return "comparison";
  }

  if (
    lowerPrompt.includes("a time when") ||
    lowerPrompt.includes("memorable") ||
    lowerPrompt.includes("last time") ||
    lowerPrompt.includes("recently") ||
    lowerPrompt.includes("when you were")
  ) {
    return "past_experience";
  }

  return "personal_prompt";
}

function parseQuestions(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^(\d+)\.\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      order: Number(match[1]),
      prompt: match[2].trim(),
    }));
}

function buildExamSet(fileName) {
  const match = fileName.match(/^exam-(\d+)\.md$/);

  if (!match) {
    return null;
  }

  const setNumber = Number(match[1]);
  const examId = `${GENERATED_EXAM_ID_PREFIX}${pad(setNumber, 3)}`;
  const questions = parseQuestions(readFileSync(path.join(testsDir, fileName), "utf8"));

  if (questions.length === 0) {
    throw new Error(`No numbered questions found in ${fileName}`);
  }

  return {
    exam: {
      id: examId,
      title: `OPIc 연습 세트 ${setNumber}`,
      tag: "OPIc 모의고사",
      questionCount: questions.length,
      estimatedMinutes: Math.ceil((questions.length * (DEFAULT_PREP_SECONDS + DEFAULT_ANSWER_SECONDS)) / 60),
      mode: "mock",
      icon: "document",
      description: "OPIc 인터뷰 흐름에 맞춰 자기소개, 주제 설명, 경험, 비교, 롤플레이, 문제 해결 문항을 연습합니다.",
    },
    questions: questions.map((question) => ({
      id: `${examId}-q${pad(question.order, 2)}`,
      examId,
      order: question.order,
      type: questionTypeFor(question.order, question.prompt),
      ttsScriptEn: question.prompt,
      prepSeconds: DEFAULT_PREP_SECONDS,
      answerSeconds: DEFAULT_ANSWER_SECONDS,
    })),
  };
}

const generatedSets = readdirSync(testsDir)
  .map(buildExamSet)
  .filter(Boolean)
  .sort((left, right) => left.exam.id.localeCompare(right.exam.id));

const existingExams = readJson(examsPath);
const existingQuestions = readJson(questionsPath);
const existingQuestionsById = new Map(existingQuestions.map((question) => [question.id, question]));

const preservedExams = existingExams.filter((exam) => !exam.id.startsWith(GENERATED_EXAM_ID_PREFIX));
const preservedQuestions = existingQuestions.filter(
  (question) => !question.examId.startsWith(GENERATED_EXAM_ID_PREFIX),
);
const generatedQuestions = generatedSets.flatMap((set) =>
  set.questions.map((question) => {
    const existingQuestion = existingQuestionsById.get(question.id);

    if (existingQuestion?.ttsAudioUrl && existingQuestion.ttsScriptEn === question.ttsScriptEn) {
      return {
        ...question,
        ttsAudioUrl: existingQuestion.ttsAudioUrl,
      };
    }

    return question;
  }),
);

writeJson(examsPath, [...preservedExams, ...generatedSets.map((set) => set.exam)]);
writeJson(questionsPath, [...preservedQuestions, ...generatedQuestions]);

console.log(`Synced ${generatedSets.length} OPIc exam sets from ${testsDir}`);
