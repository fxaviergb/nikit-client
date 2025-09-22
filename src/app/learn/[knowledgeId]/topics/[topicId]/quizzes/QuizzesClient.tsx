"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericListCard from "@/components/List/GenericListCard";
import { fetchQuizzesByTopic } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";

interface QuizzesClient {
  topicId: string;
}

const QuizzesClient: React.FC<QuizzesClient> = ({ topicId }) => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    router.push("/constructor");
  };

  const handleMixedEvaluation = () => {
    router.push(
      `/evaluation/execution?type=MIXED&source=${encodeURIComponent(
        JSON.stringify({
          knowledges: [],
          topics: [topicId],
          quizzes: [],
        }),
      )}&isInteractive=true&isShuffled=true&questionCount=5`,
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
            listData={listData}
            generateHref={(id) => `/evaluation/quiz/${id}/summary`}
          />

          {/* ✅ Botones juntos, pegados con gap */}
          <div className="flex justify-end gap-3 px-4 pb-2 pt-6">
            {listData.length > 1 && (
              <button
                onClick={handleMixedEvaluation}
                className="rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700"
              >
                Evaluación aleatoria
              </button>
            )}
            <button
              onClick={handleCreateQuiz}
              className="rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700"
            >
              Crear un cuestionario
            </button>
          </div>
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
