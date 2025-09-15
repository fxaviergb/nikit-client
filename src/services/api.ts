import axios from "axios";
import { GenericListItem } from "@/types/generic-list-item";
import { GenericListMapper } from "@/utils/GenericListMapper";
import { MockData } from "@/mocks/MockData"; // Importamos los datos mock
import { QuizSummaryMapper } from "@/utils/QuizSummaryMapper";
import { QuizSummary, QuizSummaryApiResponse } from "@/types/quiz-summary";
import { EvaluationAnswerPayload, Quiz, QuizApiResponse, QuizGradeResponse, QuizQuestion } from "@/types/quiz"; 
import { AttemptReviewResponse } from "@/types/attempt-review";
import { Login } from "@/types/login";
import { parseCookies, destroyCookie } from "nookies";


// Leer variable de entorno
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.ejemplo.com";

// Cliente Axios para llamadas reales
const AUTH_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInRva2VuSWQiOiI5ZjI4NDBiNi02MTgxLTRmYzItODExOC1hMGY1MjVkZTI4ZjYiLCJpYXQiOjE3NDQ2MDM0NTMsImV4cCI6MTc0NDYwNTI1M30.rdyb-_NwXLMe5UpbLEg-Ytmkou8dSgG7xpWS_SvoP2g";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
});

// Interceptor para agregar el token de las cookies en cada request
apiClient.interceptors.request.use(
  config => {
    const cookies = parseCookies();
    const token = cookies.token;

    config.headers = config.headers ?? {};

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  error => Promise.reject(error)
);


// Interceptor para manejar errores 401 globalmente
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      destroyCookie(null, "token");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
    }
    return Promise.reject(error);
  }
);

// 🔹 **Función para iniciar sesión**
export const login = async (
  username: string,
  password: string
): Promise<Login> => {
  try {
    const response = await axios.post<Login>(
      `${API_BASE_URL}/v1/auth/login`,
      { username, password },
      {
        headers: {
          "Content-Type": "application/json"
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// 🔹 **Función para obtener la lista de conocimientos**
export const fetchKnowledges = async (): Promise<GenericListItem[]> => {
  if (USE_MOCK) {
    console.log("Usando datos de MOCK para la lista de knwoledge.");
    const mockData = MockData.getKnowledges();
    return GenericListMapper.mapToGenericListItem(mockData);
  }

  try {
    const response = await apiClient.get<{ id: string; name: string; description: string }[]>("/api/v1/knowledge");
    return GenericListMapper.mapToGenericListItem(response.data);
  } catch (error) {
    console.error("Error fetching knowledges:", error);
    return [];
  }
};

// 🔹 **Función para obtener la lista de tópicos seg[un el ID de conocimiento**
export const fetchTopicsByKnowledge = async (knowledgeId: string): Promise<GenericListItem[]> => {
  if (USE_MOCK) {
    console.log("Usando datos de MOCK para la lista de tópicos.");
    const mockData = MockData.getTopics();
    return GenericListMapper.mapToGenericListItem(mockData);
  }

  try {
    const response = await apiClient.get<{ id: string; name: string; description: string }[]>(`/api/v1/knowledge/${knowledgeId}/topics`);
    return GenericListMapper.mapToGenericListItem(response.data);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// 🔹 **Función para obtener la lista de tópicos**
export const fetchTopics = async (): Promise<GenericListItem[]> => {
  if (USE_MOCK) {
    console.log("Usando datos de MOCK para la lista de tópicos.");
    const mockData = MockData.getTopics();
    return GenericListMapper.mapToGenericListItem(mockData);
  }

  try {
    const response = await apiClient.get<{ id: string; name: string; description: string }[]>("/api/v1/topic");
    return GenericListMapper.mapToGenericListItem(response.data);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// 🔹 **Función para obtener la lista de cuestionarios por ID de tópico**
export const fetchQuizzesByTopic = async (topicId: string): Promise<GenericListItem[]> => {
  if (USE_MOCK) {
    console.log(`Usando datos de MOCK para el tópico ID: ${topicId}`);
    const mockData = MockData.getQuizzesByTopic(topicId);
    return GenericListMapper.mapToGenericListItem(mockData);
  }

  try {
    const response = await apiClient.get<{ id: string; name: string; description: string }[]>(`/api/v1/topic/${topicId}/quizzes`);
    return GenericListMapper.mapToGenericListItem(response.data);
  } catch (error) {
    console.error(`Error fetching quizzes for ${topicId}:`, error);
    return [];
  }
};

// **Función para obtener el resumen de un quiz por ID**
export const fetchQuizSummary = async (quizId: string): Promise<QuizSummary | null> => {
  if (USE_MOCK) {
    console.log(`Usando datos de MOCK para el resumen del quiz ID: ${quizId}`);
    const mockData = MockData.getQuizSummary(quizId);
    return mockData ? QuizSummaryMapper.mapToQuizSummary(mockData) : null;
  }

  try {
    const response = await apiClient.get<Partial<QuizSummaryApiResponse>>(`/api/v1/quiz/${quizId}/summary`);
    return QuizSummaryMapper.mapToQuizSummary(response.data);
  } catch (error) {
    console.error(`Error fetching quiz summary for ${quizId}:`, error);
    return null;
  }
};

// Función para obtener preguntas del cuestionario
export const fetchQuizQuestions = async (
  quizId: string,
  questionCount?: number
): Promise<{ questions: QuizQuestion[]; attemptId: string }> => {
  try {
    
    const params = questionCount !== undefined ? { questionCount } : undefined;

    const response = await apiClient.get<QuizApiResponse>(
      `/api/v1/evaluation/create/${quizId}`,
      { params }
    );

    console.log(`Respuesta del API para quizId ${quizId}:`, response.data);

    const quizData = response.data;
    const attempt = quizData?.attempts?.[0];
    if (!attempt?.quiz?.questions) throw new Error("Formato de datos inválido");

    return {
      questions: attempt.quiz.questions,
      attemptId: attempt.id,
    };
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    return { questions: [], attemptId: "" };
  }
};

export const sendQuizAnswers = async (
  attemptId: string,
  payload: EvaluationAnswerPayload
): Promise<QuizGradeResponse> => {
  try {
    const response = await apiClient.post<QuizGradeResponse>(
      `/api/v1/evaluation/attempt/review/${attemptId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error al enviar respuestas:", error);
    throw error;
  }
};

export const fetchAttemptReview = async (
  attemptId: string
): Promise<AttemptReviewResponse | null> => {
  try {
    const response = await apiClient.get<AttemptReviewResponse>(
      `/api/v1/evaluation/attempt/${attemptId}`
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener la revisión del intento ${attemptId}:`, error);
    return null;
  }
};

export const createQuizByTopic = async (topicId: string, payload: any) => {
  try {
    const response = await apiClient.post(`/api/v1/quiz/${topicId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al crear cuestionario para topic ${topicId}:`, error);
    throw error;
  }
};

export const createKnowledge = async (payload: { name: string; description: string }) => {
  try {
    const response = await apiClient.post(`/api/v1/knowledge`, payload);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al crear grupo de conocimiento:`, error);
    throw error;
  }
};

export const createTopic = async (
  knowledgeId: string,
  payload: { name: string; description: string }
) => {
  try {
    const response = await apiClient.post(`/api/v1/topic/${knowledgeId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al crear tema para knowledgeId=${knowledgeId}:`, error);
    throw error;
  }
};

export const updateKnowledge = async (id: string, payload: { name: string }) => {
  try {
    const response = await apiClient.patch(`/api/v1/knowledge/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar grupo de conocimiento ${id}:`, error);
    throw error;
  }
};

export const updateTopic = async (id: string, payload: { name: string; description: string }) => {
  try {
    const response = await apiClient.patch(`/api/v1/topic/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar tema ${id}:`, error);
    throw error;
  }
};

// Función para obtener el detalle completo de un cuestionario
export const fetchQuizById = async (quizId: string): Promise<Quiz> => {
  try {
    const response = await apiClient.get<Quiz>(`/api/v1/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener detalle del quiz ${quizId}:`, error);
    throw error;
  }
};

// Función para actualizar un cuestionario
export const updateQuiz = async (quizId: string, payload: any): Promise<Quiz> => {
  try {
    const response = await apiClient.put<Quiz>(`/api/v1/quiz/${quizId}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar cuestionario ${quizId}:`, error);
    throw error;
  }
};
