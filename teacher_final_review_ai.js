import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-ai.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9LxxgvHpfe3y9X1xVLUcuhgbV9P_CJyg",
  authDomain: "japanese-mini-app.firebaseapp.com",
  projectId: "japanese-mini-app",
  storageBucket: "japanese-mini-app.firebasestorage.app",
  messagingSenderId: "762470505083",
  appId: "1:762470505083:web:a7966513f611ae1745e0de",
  measurementId: "G-4DTKESHGT5"
};
const APP_CHECK_SITE_KEY = "6LdW9notAAAAANS3HKoOlA8mnhVmdGCx2yAO_dxA";
const GEMINI_MODEL_NAME = "gemini-3.6-flash";

const TUTOR_INSTRUCTIONS = `You are a careful Japanese-language tutor reviewing an exam-practice answer.
The teacher/model answer is a reference answer and might not be the only valid answer.
Evaluate the learner's reconstructed COMPLETE sentence, not just individual blank fragments.
Check: (1) grammar, (2) required target construction, (3) conjugation and connection, (4) meaning, (5) context, (6) naturalness, and (7) whether the answer actually satisfies this exercise.
Do not accept an answer merely because individual phrases are valid Japanese. Distinguish a grammatically and contextually valid alternative from grammatically possible Japanese that does not answer the target exercise.
Explain briefly in Traditional Chinese. Keep Japanese examples in Japanese. When context is insufficient, return uncertain. Return only the required JSON object.`;

const RESPONSE_SCHEMA = Schema.object({
  properties: {
    verdict: Schema.enumString({ enum: ["correct", "acceptable", "incorrect", "uncertain"] }),
    summary_zh: Schema.string(),
    grammar_zh: Schema.string(),
    naturalness_zh: Schema.string(),
    suggested_answer_ja: Schema.string(),
    confidence: Schema.enumString({ enum: ["high", "medium", "low"] })
  }
});

const responseCache = new Map();
let modelPromise;

export function normalizeAiAnswer(value) {
  return String(value ?? "").normalize("NFKC").replace(/[\s\u3000]+/g, "").replace(/[。、．.、，,！!？?]+$/g, "").trim();
}

export function buildCompleteSentence(question, answers) {
  if (question?.type !== "written" || !Array.isArray(question.sentenceParts)) return "";
  return question.sentenceParts.map((part, index) => `${part}${index < question.answers.length ? (answers[index] ?? "") : ""}`).join("");
}

export function isEligibleQuestion(question) {
  return question?.type === "written" && question?.sourceCertainty === "model-answer-reference";
}

export function cacheKeyFor(question, answers, normalizer = normalizeAiAnswer) {
  return `${question.id}::${answers.map(normalizer).join("\u241f")}`;
}

function parseResponse(text) {
  const parsed = JSON.parse(text);
  const verdicts = new Set(["correct", "acceptable", "incorrect", "uncertain"]);
  const confidences = new Set(["high", "medium", "low"]);
  if (!parsed || !verdicts.has(parsed.verdict) || !confidences.has(parsed.confidence)) throw new Error("Invalid AI response");
  for (const key of ["summary_zh", "grammar_zh", "naturalness_zh", "suggested_answer_ja"]) {
    if (typeof parsed[key] !== "string") throw new Error("Invalid AI response");
  }
  return parsed;
}

function getModel() {
  if (modelPromise) return modelPromise;
  modelPromise = Promise.resolve().then(() => {
    const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    return getGenerativeModel(ai, {
      model: GEMINI_MODEL_NAME,
      generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
    });
  });
  modelPromise.catch(() => { modelPromise = undefined; });
  return modelPromise;
}

function buildPrompt(question, learnerAnswers) {
  const referenceAnswers = Array.isArray(question.displayAnswer) ? question.displayAnswer : [];
  const payload = {
    question_id: question.id, section: question.section, printed_no: question.printedNo, page: question.page,
    type: question.type, sentence_parts: question.sentenceParts, learner_individual_answers: learnerAnswers,
    learner_complete_sentence: buildCompleteSentence(question, learnerAnswers), reference_individual_answers: referenceAnswers,
    reference_complete_sentence: buildCompleteSentence(question, referenceAnswers), grammar_point: question.grammarPoint,
    explanation_zh: question.explanationZh, meaning_zh: question.meaningZh, hint_zh: question.hintZh,
    source_certainty: question.sourceCertainty, adaptation: question.adaptation
  };
  return `${TUTOR_INSTRUCTIONS}\n\nReview this exercise data:\n${JSON.stringify(payload)}`;
}

export async function checkWrittenAnswer(question, answers, normalizer = normalizeAiAnswer) {
  if (!isEligibleQuestion(question)) throw new Error("Question is not eligible for AI checking");
  if (!Array.isArray(answers) || answers.length !== question.answers.length || answers.some(answer => !normalizer(answer))) throw new Error("Answer is incomplete");
  const key = cacheKeyFor(question, answers, normalizer);
  if (responseCache.has(key)) return responseCache.get(key);
  const model = await getModel();
  const result = await model.generateContent(buildPrompt(question, answers.map(answer => String(answer).trim())));
  const checked = parseResponse(result.response.text());
  responseCache.set(key, checked);
  return checked;
}

window.TeacherFinalReviewAI = { isEligibleQuestion, checkWrittenAnswer, buildCompleteSentence, cacheKeyFor, modelName: GEMINI_MODEL_NAME };
