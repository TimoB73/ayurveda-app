import type { Answer } from "../lib/scoring";
import type { Draft } from "../lib/storage";

export type QuizAction =
  | { type: "answer"; questionId: string; answer: Answer }
  | { type: "goto"; page: number };

export function quizReducer(state: Draft, action: QuizAction): Draft {
  switch (action.type) {
    case "answer":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answer } };
    case "goto":
      return { ...state, page: Math.max(0, action.page) };
  }
}
