import { Quiz, QuizQuestion } from "@/types/quiz";

export class JsonUtils {
  static renderQuizJson(quizData: Quiz): string {
    return JSON.stringify(
      {
        name: quizData?.name,
        description: quizData?.description,
        questions: quizData?.questions.map((q) => ({
          question: q.question,
          options: q.options.map((o) => ({
            option: o.option,
            answer: o.answer,
          })),
        })),
      },
      null,
      2,
    );
  }

  static renderQuestionJson(q: QuizQuestion): string {
    return JSON.stringify(
      {
        question: q.question,
        options: q.options.map((opt) => ({
          option: opt.option,
          answer: {
            isCorrect: opt.answer.isCorrect,
            justification: opt.answer.justification,
            extras: opt.answer.extras,
          },
        })),
      },
      null,
      2,
    );
  }
}
