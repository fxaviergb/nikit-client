"use client"; // Componente de Cliente

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
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!quizSummary) return <p>No se encontró información para este cuestionario.</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Cabecera del Quiz con botones alineados a la derecha */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        {/* Información del Quiz */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{quizSummary.name}</h1>
          <p className="text-gray-600">{quizSummary.description}</p>
          <p className="text-gray-600 font-semibold">Preguntas: {quizSummary.questions}</p>
        </div>

        {/* Botones de Acción */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/evaluation/quiz/${quizId}/execution`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Iniciar
          </button>
          <button
            onClick={() => router.push(`/evaluation`)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Tabla de Intentos */}
      <h2 className="text-xl font-semibold mb-4">Intentos Anteriores</h2>
      <QuizAttemptsTable 
        quizId={quizId} 
        attempts={quizSummary.attempts} 
        generateHref={(id) => `/evaluation/quiz/${quizId}/attempt/${id}`} // 📌 URL dinámica
      />
    </div>
  );
};

export default EvaluationQuizClientSummary;
