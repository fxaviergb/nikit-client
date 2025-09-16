// utils/quiz-builder.ts

import { Quiz, QuizQuestion, QuizOption } from "@/types/quiz";
import { AuditUtils } from "./AuditUtils";
import { QuizConstants } from "./QuizConstants";

export class QuizBuilderUtils {
  static createNewQuestion(quizId: string): QuizQuestion {
    return {
      id: `front-uuid-${crypto.randomUUID()}`,
      question: "Nueva pregunta",
      questionVersion: 1,
      quizId,
      options: [],
      audit: AuditUtils.baseAudit(),
    };
  }

  static createNewOption(questionId: string): QuizOption {
    return {
      id: `front-uuid-${crypto.randomUUID()}`,
      questionId,
      option: "Nueva opción",
      answer: {
        isCorrect: false,
        justification: "",
        extras: [],
      },
      audit: AuditUtils.baseAudit(),
    };
  }

  static isFrontGeneratedId(id: string | null | undefined): boolean {
    return !!id && id.startsWith("front-uuid-");
  }

  static cleanQuizForBackend(quiz: Quiz) {
    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        id: this.isFrontGeneratedId(q.id) ? undefined : q.id,
        question: q.question,
        options: q.options.map((o) => ({
          id: this.isFrontGeneratedId(o.id) ? undefined : o.id,
          option: o.option,
          answer: {
            isCorrect: o.answer.isCorrect,
            justification: o.answer.justification,
            extras: o.answer.extras?.filter((e) => !!e?.trim()) || [],
          },
        })),
      })),
    };
  }

  static getValidationErrors(
    quizData: Quiz | null,
    selectedTopic: string | null,
  ): string[] {
    if (!quizData) return ["No hay cuestionario cargado"];
    const errors: string[] = [];

    if (!selectedTopic) errors.push("Debe seleccionar un tópico.");
    if (!quizData.name?.trim()) errors.push("Debe ingresar un nombre.");
    if (!quizData.description?.trim())
      errors.push("Debe ingresar una descripción.");
    if (quizData.questions.length < QuizConstants.MIN_QUESTIONS)
      errors.push(
        `Debe registrar al menos ${QuizConstants.MIN_QUESTIONS} preguntas.`,
      );

    quizData.questions.forEach((q, i) => {
      if (q.options.length < QuizConstants.MIN_OPTIONS)
        errors.push(
          `La pregunta ${i + 1} debe tener al menos ${QuizConstants.MIN_OPTIONS} opciones.`,
        );

      if (q.options.filter((opt) => opt.answer.isCorrect).length !== 1)
        errors.push(
          `La pregunta ${i + 1} debe tener exactamente UNA opción correcta.`,
        );

      if (q.options.some((opt) => !opt.option.trim()))
        errors.push(
          `Todas las opciones de la pregunta ${i + 1} deben tener texto.`,
        );
    });

    return errors;
  }
}
