"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericListCard from "@/components/List/GenericListCard";
import { fetchQuizzesByTopic, fetchAttemptsSummary } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";
import QuizAttemptsSection from "@/components/Quiz/QuizAttemptsSection";
import { AttemptSummary } from "@/types/attempt-summary";
import ToggleSwitch from "@/components/Switchers/ToggleSwitch";
import EvaluationConfigModal from "@/components/Evaluation/EvaluationConfigModal";

interface QuizzesClient {
  topicId: string;
}

const QuizzesClient: React.FC<QuizzesClient> = ({ topicId }) => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showAttempts, setShowAttempts] = useState(false);
  const [attemptsSummary, setAttemptsSummary] = useState<AttemptSummary | null>(
    null,
  );
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Estado para abrir/cerrar modal
  const [showEvalModal, setShowEvalModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!topicId) {
      setError("ID de tema no proporcionado");
      setLoading(false);
      return;
    }

    const loadQuizzes = async () => {
      try {
        const data = await fetchQuizzesByTopic(topicId);
        setListData(data);
      } catch (err) {
        setError("Error cargando los cuestionarios");
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [topicId]);

  const handleCreateQuiz = () => {
    router.push("/quiz-builder");
  };

  const handleToggleAttempts = async () => {
    if (!showAttempts) {
      setLoadingAttempts(true);
      const summary = await fetchAttemptsSummary(null, [topicId], null);
      setAttemptsSummary(summary);
      setLoadingAttempts(false);
    }
    setShowAttempts(!showAttempts);
  };

  const handleConfirmEvaluation = (
    isInteractive: boolean,
    isShuffled: boolean,
    questionCount: number,
  ) => {
    router.push(
      `/evaluation/execution?type=MIXED&source=${encodeURIComponent(
        JSON.stringify({ knowledges: [], topics: [topicId], quizzes: [] }),
      )}&isInteractive=${isInteractive}&isShuffled=${isShuffled}&questionCount=${questionCount}`,
    );
  };

  return (
    <>
      {loading && <p>Cargando cuestionarios...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && listData.length > 0 && (
        <>
          <GenericListCard
            cardTitle="Cuestionarios"
            cardActions={
              <ToggleSwitch
                label="Intentos"
                checked={showAttempts}
                onToggle={handleToggleAttempts}
              />
            }
            listData={listData}
            generateHref={(id) => `/evaluation/quiz/${id}/summary`}
          />

          {/* ✅ Botones en columna en móviles y fila en escritorio */}
          <div className="flex flex-col justify-end gap-3 px-4 pb-2 pt-6 sm:flex-row">
            {listData.length > 1 && (
              <button
                className="w-full rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700 sm:w-50"
                onClick={() => setShowEvalModal(true)}
              >
                Evaluación aleatoria
              </button>
            )}
            <button
              onClick={handleCreateQuiz}
              className="min-h-[3rem] w-full rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700 sm:w-50"
            >
              Crear un cuestionario
            </button>
          </div>

          {/* Modal de configuración */}
          <EvaluationConfigModal
            isOpen={showEvalModal}
            onClose={() => setShowEvalModal(false)}
            onConfirm={handleConfirmEvaluation}
          />

          {/* Sección de intentos */}
          {showAttempts && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              {loadingAttempts ? (
                <p className="text-gray-500">Cargando intentos...</p>
              ) : attemptsSummary && attemptsSummary.attempts.length > 0 ? (
                <QuizAttemptsSection
                  quizId={topicId}
                  attempts={attemptsSummary.attempts}
                  title={`Dominio de la sección: ${attemptsSummary.efficiencyPercentage?.toFixed(2) ?? 0}%`}
                />
              ) : (
                <p className="text-gray-600">
                  No se han registrado intentos en este tema.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !error && listData.length === 0 && (
        <div className="py-10 text-center">
          <p className="mb-4 text-lg text-gray-600">
            Aún no se han creado cuestionarios para este tema.
          </p>
          <button
            onClick={handleCreateQuiz}
            className="rounded bg-blue-600 px-6 py-2 text-white shadow transition hover:bg-blue-700"
          >
            Crear un cuestionario
          </button>
        </div>
      )}
    </>
  );
};

export default QuizzesClient;
