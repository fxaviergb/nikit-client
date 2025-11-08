"use client";

import React from "react";
import { useRouter } from "next/navigation";
import QuizAttemptsTable from "@/components/Quiz/QuizAttemptsTable";
import { QuizAttempt } from "@/types/quiz-summary";

interface QuizAttemptsSectionProps {
  quizId: string;
  attempts: QuizAttempt[];
  title?: string;
}

const QuizAttemptsSection: React.FC<QuizAttemptsSectionProps> = ({
  quizId,
  attempts,
  title = "Intentos Anteriores",
}) => {
  const router = useRouter();

  const validAttempts = attempts.filter((attempt) => {
    const hasValidDate =
      attempt.date !== null &&
      attempt.date !== "" &&
      attempt.date !== "unknown_date";
    const hasValidGrade = attempt.grade !== null && attempt.maxGrade !== null;
    return hasValidDate && hasValidGrade;
  });

  const totalAttempts = validAttempts.length;

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

  const QuizAttemptsCardList = () => (
    <div className="grid grid-cols-1 gap-3 sm:hidden">
      {validAttempts.map((attempt, index) => {
        const descendingAttemptNumber = totalAttempts - index;

        const gradeColor =
          attempt.grade !== null && attempt.grade >= 90
            ? "bg-green-100 text-green-800"
            : attempt.grade !== null && attempt.grade >= 70
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800";

        return (
          <div
            key={attempt.id}
            className="flex cursor-pointer flex-col gap-2 rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg"
            onClick={() =>
              router.push(`/evaluation/quiz/${quizId}/attempt/${attempt.id}`)
            }
          >
            <div className="text-sm font-semibold text-gray-800">
              📘 Intento #{descendingAttemptNumber}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>
                📅 {attempt.date ? formatDate(attempt.date) : "Sin fecha"}
              </span>
              <div className="flex flex-col items-end">
                {attempt.grade !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${gradeColor} font-bold`}
                  >
                    Nota: {attempt.grade}/{attempt.maxGrade}
                  </span>
                )}
                {attempt.efficiencyPercentage !== undefined && (
                  <span className="mt-0.5 text-[11px] font-medium text-gray-500">
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

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>

      {validAttempts.length === 0 ? (
        <div className="rounded-md bg-gray-50 py-10 text-center text-gray-600 shadow-sm">
          <p className="text-lg">Aún no se han registrado intentos.</p>
        </div>
      ) : (
        <>
          {/* Vista en tabla para pantallas grandes */}
          <div className="hidden sm:block">
            <QuizAttemptsTable
              quizId={quizId}
              attempts={validAttempts}
              generateHref={(id) => `/evaluation/quiz/${quizId}/attempt/${id}`}
            />
          </div>
          {/* Vista en tarjetas para móviles */}
          <QuizAttemptsCardList />
        </>
      )}
    </div>
  );
};

export default QuizAttemptsSection;
