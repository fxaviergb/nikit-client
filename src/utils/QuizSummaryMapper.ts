import { QuizSummary, QuizAttempt } from "@/types/quiz-summary";

export class QuizSummaryMapper {
  /**
   * Convierte la respuesta de la API o mock en un objeto `QuizSummary`, manejando estructuras dinámicas.
   * @param data Datos obtenidos desde la API o un mock (parcialmente estructurados)
   * @returns `QuizSummary`
   */
  static mapToQuizSummary(data: Partial<{
    id: string;
    name: string;
    description: string;
    metadata: { questions?: string | number }; // Puede faltar o tener distintos tipos
    attempts: { id?: string; grade?: string | number; maxGrade?: string | number; date?: string }[];
  }>): QuizSummary {
    return {
      id: data.id ?? "unknown_id",
      name: data.name ?? "Unknown Quiz",
      description: data.description ?? "No description available",
      questions: QuizSummaryMapper.parseNumber(data.metadata?.questions, 0), // Convertir `questions` a número o 0
      attempts: (data.attempts ?? []).map(attempt => QuizSummaryMapper.mapToQuizAttempt(attempt)),
    };
  }

 /**
 * Convierte un intento individual en un objeto `QuizAttempt`, asegurando datos válidos.
 * @param data Datos del intento obtenidos desde la API o un mock
 * @returns `QuizAttempt`
 */
private static mapToQuizAttempt(
  data: Partial<{
    id: string;
    grade: string | number;
    maxGrade: string | number;
    date: string;
    efficiencyPercentage: string | number;
  }>
): QuizAttempt {
  return {
    id: data.id ?? "unknown_attempt",
    grade: QuizSummaryMapper.parseNumber(data.grade, 0),
    maxGrade: QuizSummaryMapper.parseNumber(data.maxGrade, 10),
    date: data.date ?? "unknown_date",
    efficiencyPercentage: data.efficiencyPercentage !== undefined
      ? QuizSummaryMapper.parseNumber(data.efficiencyPercentage, 0)
      : undefined,
  };
}


  /**
   * Convierte valores a número, manejando strings, números y valores nulos.
   * @param value Valor a convertir
   * @param defaultValue Valor por defecto si `value` es null o inválido
   * @returns `number`
   */
  private static parseNumber(value: unknown, defaultValue: number): number {
    if (typeof value === "number") return value;
    if (typeof value === "string" && !isNaN(parseFloat(value))) return parseFloat(value);
    return defaultValue;
  }
}
