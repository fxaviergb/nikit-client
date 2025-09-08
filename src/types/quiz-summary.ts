export interface QuizAttempt {
    id: string;
    grade: number;
    maxGrade: number;
    date: string;
    efficiencyPercentage?: number;
  }
  
  export interface QuizSummary {
    id: string;
    name: string;
    description: string;
    questions: number;
    attempts: QuizAttempt[];
  }
  
  export interface QuizSummaryApiResponse {
    id?: string;
    name?: string;
    description?: string;
    metadata?: { questions?: string };
    attempts?: { id?: string; grade?: string; maxGrade?: string; date?: string }[];
  }
  