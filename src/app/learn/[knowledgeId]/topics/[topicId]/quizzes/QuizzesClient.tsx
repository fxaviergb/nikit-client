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

  return (
    <>
      {loading && <p>Cargando cuestionarios...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && listData.length > 0 && (
        <GenericListCard
          cardTitle="Cuestionarios"
          listData={listData}
          generateHref={(id) => `/evaluation/quiz/${id}/summary`}
        />
      )}

      {!loading && !error && listData.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">
            Aún no se han creado cuestionarios para este tema.
          </p>
          <button
            onClick={handleCreateQuiz}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Crear un cuestionario
          </button>
        </div>
      )}
    </>
  );
};

export default QuizzesClient;
