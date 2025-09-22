export interface ReviewOption {
  id: string;
  option: string;
  review: {
    isSelected: boolean;
    isCorrect: boolean;
    feedback: string;
    points: string;
    extras: string[];
  };
}

export interface ReviewQuestion {
  id: string;
  question: string;
  options: ReviewOption[];
  review: {
    status: string;
    feedback: string;
    points: string;
    extras: string[];
  };
}

export interface AttemptReviewResponse {
  attemptId: string;
  quizId: string;
  quizType: string;
  review: ReviewQuestion[];
  grade: {
    qualification: string;
    maxQualification: string;
    reviewDate: string;
  };
  requestSource: {
    knowledges: string[];
    topics: string[];
    quizzes: string[];
  };
}
