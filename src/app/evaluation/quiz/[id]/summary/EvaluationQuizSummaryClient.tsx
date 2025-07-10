"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizSummary } from "@/services/api";
import { QuizSummary } from "@/types/quiz-summary";
import QuizAttemptsTable from "@/components/Quiz/QuizAttemptsTable";

interface EvaluationQuizClientSummaryProps {
  quizId: string;
}

const EvaluationQuizClientSummary: React.FC<EvaluationQuizClientSummaryProps> = ({
  quizId,
}) => {
  const router = useRouter();
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

          return (
            <div
              key={attempt.id}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer flex flex-col gap-2"
              onClick={() =>
                router.push(`/evaluation/quiz/${quizId}/attempt/${attempt.id}`)
              }
            >
              {/* Línea superior: Intento */}
              <div className="text-sm text-gray-800 font-semibold">
                📘 Intento #{index + 1}
              </div>

              {/* Línea del medio: Fecha y Nota */}
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>📅 {formatDate(attempt.date)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${gradeColor} font-bold`}
                >
                  Nota: {attempt.grade}
                </span>
              </div>

              {/* Última línea: Ver intento */}
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
      {/* Cabecera estilo Card */}
      <div className="bg-white rounded-xl p-5 shadow-md mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
            {quizSummary.name}
          </h1>
          <p className="text-gray-600 text-sm mb-1">{quizSummary.description}</p>
          <p className="text-gray-700 text-sm font-semibold">
            Preguntas: {quizSummary.questions}
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2 sm:mt-0 sm:ml-6 w-full sm:w-auto">
          <button
            onClick={() =>
              router.push(`/evaluation/quiz/${quizId}/execution`)
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
          >
            Iniciar
          </button>
          <button
            onClick={() => router.push(`/learn`)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Intentos Anteriores */}
      <h2 className="text-xl font-semibold mb-4">Intentos Anteriores</h2>

      {validAttempts.length === 0 ? (
        <div className="text-center text-gray-600 py-10 bg-gray-50 rounded-md shadow-sm">
          <p className="text-lg">Aún no se han registrado intentos.</p>
        </div>
      ) : (
        <>
          {/* Tabla para desktop */}
          <div className="hidden sm:block">
            <QuizAttemptsTable
              quizId={quizId}
              attempts={validAttempts}
              generateHref={(id) => `/evaluation/quiz/${quizId}/attempt/${id}`}
            />
          </div>

          {/* Cards para mobile */}
          <QuizAttemptsCardList />
        </>
      )}
    </div>
  );
};

export default EvaluationQuizClientSummary;
