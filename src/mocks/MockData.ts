export class MockData {
    static getTopics(): { id: string; name: string; description: string }[] {
      return [
        { id: "qwerty1", name: "Topic 1", description: "Lorem ipsum lorem" },
        { id: "qwerty2", name: "Topic 2", description: "Lorem ipsum lorem" },
        { id: "qwerty3", name: "Topic 3", description: "Lorem ipsum lorem" },
      ];
    }
  
    static getQuizzesByTopic(topicId: string): { id: string; name: string; description: string }[] {
      const mockQuizzes: Record<string, { id: string; name: string; description: string }[]> = {
        "qwerty1": [
          { id: "asdfg1", name: "Cuestionario 1", description: "Lorem ipsum lorem" },
          { id: "asdfg2", name: "Cuestionario 2", description: "Lorem ipsum lorem" },
        ],
        "qwerty2": [
          { id: "asdfg3", name: "Cuestionario 3", description: "Lorem ipsum lorem" },
        ],
      };
      return mockQuizzes[topicId] || [];
    }
  
    /**
   * Datos mock para el resumen de un quiz en el formato original de la API.
   */
  static getQuizSummary(quizId: string): {
    id: string;
    name: string;
    description: string;
    metadata: { questions: string };
    attempts: { id: string; grade: string; maxGrade: string; date: string }[];
  } | null {
    const mockSummaries: Record<string, any> = {
      "asdfg1": {
        id: "asdfg1",
        name: "Cuestionario 1",
        description: "Lorem ipsum lorem",
        metadata: {
          questions: "10", // Simulamos que viene como string desde la API
        },
        attempts: [
          { id: "attemp1", grade: "7", maxGrade: "10", date: "16/03/2025 23:10:15" },
          { id: "attemp2", grade: "9", maxGrade: "10", date: "16/03/2025 23:15:15" },
        ],
      },
    };
    return mockSummaries[quizId] || null;
  }
  }
  