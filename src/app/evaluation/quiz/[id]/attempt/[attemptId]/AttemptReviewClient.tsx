"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAttemptReview } from "@/services/api";
import { AttemptReviewResponse, ReviewQuestion, ReviewOption } from "@/types/attempt-review";

interface AttemptReviewClientProps {
  quizId: string;
  attemptId: string;
}

const AttemptReviewClient: React.FC<AttemptReviewClientProps> = ({ quizId, attemptId }) => {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<AttemptReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!quizId || !attemptId) {
      setError("Parámetros inválidos");
      setLoading(false);
      return;
    }

    const loadReview = async () => {
      try {
        const response = await fetchAttemptReview(attemptId);
        setReviewData(response);
      } catch (err) {
        console.error("❌ Error cargando revisión:", err);
        setError("Error al cargar la revisión del intento.");
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [quizId, attemptId]);

  const toggleFeedback = (questionId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const toggleCorrectAnswer = (questionId: string) => {
    setShowCorrectAnswers((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  if (loading) return <p className="text-gray-500">Cargando revisión del intento...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!reviewData || !Array.isArray(reviewData.review)) {
    return <p>No se encontró la revisión.</p>;
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="container mx-auto p-6">
      {/* Título con calificación */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revisión del Cuestionario</h1>
          <p className="text-gray-600">
            Fecha de revisión: {new Date(reviewData.grade.reviewDate).toLocaleString()}
          </p>
        </div>
        <div className="text-2xl font-semibold text-blue-600">
          {reviewData.grade.qualification} / {reviewData.grade.maxQualification}
        </div>
      </div>

      {/* Preguntas y opciones */}
      <div className="space-y-6">
        {reviewData.review.map((question: ReviewQuestion, qIndex: number) => {
          const selectedOption = question.options.find((opt) => opt.review.isSelected);
          const selectedIsCorrect = selectedOption?.review?.isCorrect;
          const selectedIsIncorrect = selectedOption?.review?.isSelected && !selectedOption?.review?.isCorrect;
          const isExpanded = expandedQuestions[question.id] || false;
          const showCorrect = showCorrectAnswers[question.id] || false;
          const correctOption = question.options.find((opt) => opt.review.isCorrect);

          return (
            <div key={question.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {qIndex + 1}. {question.question}
              </h2>
              <div className="mt-2 space-y-2">
                {question.options.map((option: ReviewOption, oIndex: number) => {
                  const { isCorrect, isSelected, feedback } = option.review;

                  let bgClass = "border-gray-300";
                  let icon = "🔹";

                  if (isSelected && isCorrect) {
                    bgClass = "bg-green-100 border-green-500";
                    icon = "✅";
                  } else if (isSelected && !isCorrect) {
                    bgClass = "bg-red-100 border-red-500";
                    icon = "❌";
                  }

                  return (
                    <div key={option.id} className="space-y-1">
                      <div className={`p-2 border rounded-md flex items-center space-x-2 ${bgClass}`}>
                        <span>{icon}</span>
                        <span className="font-semibold">{optionLabels[oIndex]}.</span>
                        <span>{option.option}</span>
                      </div>

                      {isSelected && feedback?.trim() && (
                        <div className="ml-6 p-2 bg-gray-100 border-l-4 border-gray-400 text-gray-700 rounded">
                          {feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mostrar retroalimentación general */}
              {selectedIsCorrect && question.review?.feedback?.trim() && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleFeedback(question.id)}
                    className="text-sm text-blue-600 flex items-center space-x-1 focus:outline-none"
                  >
                    <span className="hover:underline">
                      {isExpanded ? "Ocultar retroalimentación" : "Mostrar retroalimentación"}
                    </span>
                    <span
                      className={`transform transition-transform duration-300 ${
                        isExpanded ? "rotate-90" : "rotate-0"
                      }`}
                    >
                      ▶
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
                      <p className="font-semibold mb-1">Retroalimentación</p>
                      {question.review.feedback}
                    </div>
                  )}
                </div>
              )}

              {/* Mostrar respuesta correcta cuando la seleccionada es incorrecta */}
              {selectedIsIncorrect && correctOption && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleCorrectAnswer(question.id)}
                    className="text-sm text-blue-600 flex items-center space-x-1 focus:outline-none"
                  >
                    <span className="hover:underline">
                      {showCorrect ? "Ocultar respuesta correcta" : "Mostrar respuesta correcta"}
                    </span>
                    <span
                      className={`transform transition-transform duration-300 ${
                        showCorrect ? "rotate-90" : "rotate-0"
                      }`}
                    >
                      ▶
                    </span>
                  </button>
                  {showCorrect && (
                    <div className="mt-2 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded">
                      <p className="font-semibold mb-1">Respuesta correcta:</p>
                      <p>
                        <span className="font-semibold">
                          {
                            optionLabels[
                              question.options.findIndex((opt) => opt.id === correctOption.id)
                            ]
                          }
                          .{" "}
                        </span>
                        {correctOption.option}
                      </p>
                      {correctOption.review?.feedback?.trim() && (
                        <p className="mt-2 text-sm">{correctOption.review.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón "Ok" */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push(`/evaluation/quiz/${quizId}/summary`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default AttemptReviewClient;
