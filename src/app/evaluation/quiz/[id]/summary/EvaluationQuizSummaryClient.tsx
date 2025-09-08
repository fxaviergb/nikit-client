"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizSummary } from "@/services/api";
import { QuizSummary } from "@/types/quiz-summary";
import QuizAttemptsTable from "@/components/Quiz/QuizAttemptsTable";

interface EvaluationQuizClientSummaryProps {
  quizId: string;
}

const EvaluationQuizClientSummary: React.FC<EvaluationQuizClientSummaryProps> = ({ quizId }) => {
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
  if (!quizSummary) return <p>No se encontró información para este cuestionario.</p>;

  const validAttempts = quizSummary.attempts.filter((attempt) => {
    const hasValidDate =
      attempt.date !== null &&
      attempt.date !== "" &&
      attempt.date !== "unknown_date";
    const hasValidGrade = attempt.grade !== null;
    return hasValidDate && hasValidGrade;
  });

  const QuizAttemptsCardList = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {validAttempts.map((attempt, index) => {
          const gradeColor =
            attempt.grade >= 90
              ? "bg-green-100 text-green-800"
              : attempt.grade >= 70
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800";

          const efficiency =
            attempt.efficiencyPercentage !== undefined
              ? `${attempt.efficiencyPercentage.toFixed(2)}%`
              : "N/A";

          return (
            <div
              key={attempt.id}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer flex flex-col gap-2"
              onClick={() =>
                router.push(`/evaluation/quiz/${quizId}/attempt/${attempt.id}`)
              }
            >
              <div className="text-sm text-gray-800 font-semibold">
                📘 Intento #{index + 1}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>📅 {formatDate(attempt.date)}</span>
                <div className="flex flex-col items-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${gradeColor} font-bold`}>
                    Nota: {attempt.grade}
                  </span>
                  {attempt.efficiencyPercentage !== undefined && (
                    <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {attempt.efficiencyPercentage.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                ✏️ <span className="truncate">Ver intento</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl p-5 shadow-md mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
              {quizSummary.name}
            </h1>
            <p className="text-gray-600 text-sm mb-1">{quizSummary.description}</p>
            <p className="text-gray-700 text-sm font-semibold">
              Preguntas: {quizSummary.questions}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:mt-0 sm:ml-6 w-full sm:w-auto">
            <button
              onClick={() =>
                router.push(
                  `/evaluation/quiz/${quizId}/execution?interactive=${isInteractive}&shuffled=${isShuffled}&questionCount=${questionCount}`
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
            >
              Iniciar
            </button>
            <button
              onClick={() => router.push("/learn")}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full"
            >
              Volver
            </button>
          </div>
        </div>

        <div className="mt-1">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {showOptions ? "Ocultar opciones avanzadas" : "Mostrar opciones avanzadas"}
          </button>
        </div>

        {showOptions && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-300 ease-in-out">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Modo Interactivo</span>
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

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Opciones aleatorias</span>
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full sm:w-auto">
                <label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
                  Número de preguntas
                </label>
                <select
                  id="questionCount"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-28 w-full"
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

      <h2 className="text-xl font-semibold mb-4">Intentos Anteriores</h2>

      {validAttempts.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-md shadow-sm">
          <p className="text-lg">Aún no se han registrado intentos.</p>
        </div>
      ) : (
        <>
          <div className="hidden sm:block">
            <QuizAttemptsTable
              quizId={quizId}
              attempts={validAttempts}
              generateHref={(id) => `/evaluation/quiz/${quizId}/attempt/${id}`}
            />
          </div>
          <QuizAttemptsCardList />
        </>
      )}
    </div>
  );
};

export default EvaluationQuizClientSummary;
