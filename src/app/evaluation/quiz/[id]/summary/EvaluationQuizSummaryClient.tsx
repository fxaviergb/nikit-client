"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizSummary } from "@/services/api";
import { QuizSummary } from "@/types/quiz-summary";
import QuizAttemptsSection from "@/components/Quiz/QuizAttemptsSection";

interface EvaluationQuizClientSummaryProps {
  quizId: string;
}

const EvaluationQuizClientSummary: React.FC<
  EvaluationQuizClientSummaryProps
> = ({ quizId }) => {
  const router = useRouter();
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [isShuffled, setIsShuffled] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  useEffect(() => {
    if (!quizId) {
      setError("ID de cuestionario no proporcionado");
      setLoading(false);
      return;
    }

    const loadQuizSummary = async () => {
      try {
        const summary = await fetchQuizSummary(quizId);
        setQuizSummary(summary);
      } catch (err) {
        setError("Error cargando el resumen del cuestionario");
      } finally {
        setLoading(false);
      }
    };

    loadQuizSummary();
  }, [quizId]);

  if (loading) return <p>Cargando cuestionario...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!quizSummary)
    return <p>No se encontró información para este cuestionario.</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 📘 Información del cuestionario */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="mb-1 text-xl font-semibold text-gray-800 sm:text-2xl">
              {quizSummary.name}
            </h1>
            <p className="mb-1 text-sm text-gray-600">
              {quizSummary.description}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Preguntas: {quizSummary.questions}
            </p>
          </div>

          <div className="w-full sm:ml-6 sm:mt-0 sm:w-auto">
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/evaluation/quiz/${quizId}/execution?interactive=${isInteractive}&shuffled=${isShuffled}&questionCount=${questionCount}`,
                  )
                }
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Iniciar
              </button>
              <button
                onClick={() => router.back()}
                className="w-full rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Volver
              </button>
            </div>
          </div>
        </div>

        {/* ⚙️ Opciones avanzadas */}
        <div className="mt-1">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {showOptions
              ? "Ocultar opciones avanzadas"
              : "Mostrar opciones avanzadas"}
          </button>
        </div>

        {showOptions && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-300 ease-in-out">
            <div className="flex flex-wrap gap-6">
              {/* Toggle interactivo */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Modo Interactivo
                </span>
                <button
                  onClick={() => setIsInteractive(!isInteractive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isInteractive ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      isInteractive ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle aleatorio */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Opciones aleatorias
                </span>
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    isShuffled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      isShuffled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Selector de cantidad de preguntas */}
              <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                <label
                  htmlFor="questionCount"
                  className="text-sm font-medium text-gray-700"
                >
                  Número de preguntas
                </label>
                <select
                  id="questionCount"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-28"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 3).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuizAttemptsSection quizId={quizId} attempts={quizSummary.attempts} />
    </div>
  );
};

export default EvaluationQuizClientSummary;
