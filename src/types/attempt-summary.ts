import { QuizAttempt } from "./quiz-summary";

export interface AttemptSummary {
  efficiencyPercentage: number;
  attempts: QuizAttempt[];
}