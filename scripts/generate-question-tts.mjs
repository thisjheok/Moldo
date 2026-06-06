import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const rootDir = path.resolve(import.meta.dirname, "..");
const questionsPath = path.join(rootDir, "packages", "mock-data", "exam-questions.json");
const outputDir = path.join(rootDir, "apps", "web", "public", "tts", "questions", "nova");
const publicPrefix = "/tts/questions/nova";

const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "nova";
const DEFAULT_FORMAT = "mp3";
const DEFAULT_INSTRUCTIONS =
  "Speak clearly and naturally in an English interview examiner voice. Keep a calm, neutral test-administrator tone.";

loadDotEnv(path.join(rootDir, ".env"));

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_TTS_MODEL || DEFAULT_MODEL;
const voice = process.env.OPENAI_TTS_VOICE || DEFAULT_VOICE;
const responseFormat = process.env.OPENAI_TTS_FORMAT || DEFAULT_FORMAT;
const instructions = process.env.OPENAI_TTS_INSTRUCTIONS || DEFAULT_INSTRUCTIONS;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required. Add it to .env or export it before running this script.");
}

if (voice !== DEFAULT_VOICE) {
  console.warn(`OPENAI_TTS_VOICE is set to "${voice}". This run will not use Nova.`);
}

const questions = readJson(questionsPath);
mkdirSync(outputDir, { recursive: true });

let generatedCount = 0;
let skippedCount = 0;

for (const question of questions) {
  if (!question.ttsScriptEn) {
    throw new Error(`Question ${question.id} is missing ttsScriptEn.`);
  }

  const hash = createTtsHash({
    model,
    voice,
    responseFormat,
    instructions,
    input: question.ttsScriptEn,
  });
  const fileName = `${question.id}-${hash}.${responseFormat}`;
  const filePath = path.join(outputDir, fileName);
  const ttsAudioUrl = `${publicPrefix}/${fileName}`;

  if (existsSync(filePath)) {
    question.ttsAudioUrl = ttsAudioUrl;
    skippedCount += 1;
    console.log(`skip ${question.id}`);
    continue;
  }

  console.log(`generate ${question.id}`);
  const audio = await generateSpeech({
    apiKey,
    model,
    voice,
    input: question.ttsScriptEn,
    instructions,
    responseFormat,
  });

  writeFileSync(filePath, audio);
  question.ttsAudioUrl = ttsAudioUrl;
  generatedCount += 1;
}

writeJson(questionsPath, questions);

console.log(
  `Generated ${generatedCount} TTS file${generatedCount === 1 ? "" : "s"}; skipped ${skippedCount}; updated ${questionsPath}`,
);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function createTtsHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = unquoteDotEnvValue(line.slice(separatorIndex + 1).trim());
  }
}

function unquoteDotEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function generateSpeech({ apiKey, model, voice, input, instructions, responseFormat }) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      instructions,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI TTS request failed with ${response.status}: ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
