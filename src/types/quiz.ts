// 🧩 Metadatos de auditoría
export interface AuditMetadata {
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ✅ Metadatos de respuesta
export interface AnswerMetadata {
  isCorrect: boolean;
  justification: string;
  extras?: string[] | null;
}

// 🟢 Opción de una pregunta
export interface QuizOption {
  id?: string | null;
  option: string;
  questionId: string | null;
  answer: AnswerMetadata;
  audit?: AuditMetadata | null;
}

// 🟡 Pregunta del cuestionario
export interface QuizQuestion {
  id?: string | null;
  question: string;
  questionVersion?: number | null;
  quizId: string;
  options: QuizOption[];
  audit?: AuditMetadata | null;
}

// 🔵 Cuestionario completo
export interface Quiz {
  id: string;
  name: string;
  description: string;
  version: number;
  topicIds: string[];
  questions: QuizQuestion[];
  audit: AuditMetadata | null;
}

// 📝 Payload para enviar respuestas a evaluación
export interface EvaluationAnswerPayload {
  executionDate: string;
  questions: {
    id: string;
    options: {
      id: string;
      isSelected: boolean;
    }[];
  }[];
}

// 📈 Respuesta de calificación del cuestionario
export interface QuizGradeResponse {
  attemptId: string;
  quizId: string;
  grade: {
    qualification: string;
    maxQualification: string;
    reviewDate: string;
  };
}

// (🔙 Compatibilidad con flujos de evaluación anteriores)
export interface QuizAttempt {
  id: string;
  quiz: {
    id: string;
    questions: QuizQuestion[];
  };
}

export interface QuizApiResponse {
  id: string;
  attempts: QuizAttempt[];
}
