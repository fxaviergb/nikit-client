"use client";

import React, { useEffect, useState } from "react";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import { fetchTopicsByKnowledge, createTopic } from "@/services/api";

interface TopicsClientProps {
  knowledgeId: string;
}

const TopicsClient: React.FC<TopicsClientProps> = ({ knowledgeId }) => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!knowledgeId) {
      setError("ID de grupo de conocimiento no proporcionado");
      setLoading(false);
      return;
    }

    const loadTopics = async () => {
      try {
        const data = await fetchTopicsByKnowledge(knowledgeId);
        setListData(data);
      } catch (err) {
        setError("Error al cargar los temas.");
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [knowledgeId]);

  const handleSave = async () => {
    try {
      await createTopic(knowledgeId, { name, description });
      setShowModal(false);
      setName("");
      setDescription("");
      const updatedList = await fetchTopicsByKnowledge(knowledgeId);
      setListData(updatedList);
    } catch (err) {
      alert("Error al guardar el tema.");
    }
  };

  if (loading) return <p>Cargando temas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {listData.length === 0 ? (
        <p>No hay temas disponibles.</p>
      ) : (
        <GenericListCard
          cardTitle="Temas"
          listData={listData}
          generateHref={(id) => `/learn/${knowledgeId}/topics/${id}/quizzes`}
        />
      )}

      <div className="flex justify-end pt-6 pb-2 px-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Agregar
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Agrega un tema</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopicsClient;
