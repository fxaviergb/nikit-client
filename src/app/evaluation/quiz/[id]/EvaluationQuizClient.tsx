"use client"; // Componente de Cliente

import React, { useEffect, useState } from "react";
import GenericListCard from "@/components/List/GenericListCard";
import { fetchQuizzesByTopic } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";

interface EvaluationQuizClientProps {
  quizId: string;
}

const EvaluationQuizClient: React.FC<EvaluationQuizClientProps> = ({ quizId }) => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError("ID de cuestionario no proporcionado");
      setLoading(false);
      return;
    }

    const loadQuizzes = async () => {
      try {
        const data = await fetchQuizzesByTopic(quizId);
        setListData(data);
      } catch (err) {
        setError("Error cargando los cuestionarios");
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [quizId]);

  return (
    <>
      {loading && <p>Cargando cuestionarios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <GenericListCard 
          cardTitle={`Cuestionarios`} 
          listData={listData} 
          generateHref={(id) => `/evaluation/quiz/${id}/summary`} // 📌 Href dinámico
        />
      )}
    </>
  );
};

export default EvaluationQuizClient;
