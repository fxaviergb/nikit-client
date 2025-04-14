"use client";

import React, { useEffect, useState } from "react";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import { fetchTopics } from "@/services/api";

const EvaluationClient: React.FC = () => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await fetchTopics();
        setListData(data);
      } catch (err) {
        setError("Error al cargar los temas.");
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  if (loading) return <p>Cargando temas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {listData.length === 0 ? (
        <p>No hay evaluaciones disponibles.</p>
      ) : (
        <GenericListCard
          cardTitle="Topics"
          listData={listData}
          generateHref={(id) => `/evaluation/quiz/${id}`}
        />
      )}
    </>
  );
};

export default EvaluationClient;
