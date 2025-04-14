export interface QuizOption {
    id: string;
    option: string;
  }
  
  export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
  }
  
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

  export interface QuizGradeResponse {
    attemptId: string;
    quizId: string;
    grade: {
      qualification: string;
      maxQualification: string;
      reviewDate: string;
    };
  }