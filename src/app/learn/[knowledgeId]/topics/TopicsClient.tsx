"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import {
  fetchTopicsByKnowledge,
  createTopic,
  updateTopic,
} from "@/services/api";

interface TopicsClientProps {
  knowledgeId: string;
}

const TopicsClient: React.FC<TopicsClientProps> = ({ knowledgeId }) => {
  const router = useRouter();

  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (!knowledgeId) {
      setError("ID de grupo de conocimiento no proporcionado");
      setLoading(false);
      return;
    }

    loadTopics();
  }, [knowledgeId]);

  const mapWithActions = (items: GenericListItem[]): GenericListItem[] => {
    return items.map((item) => ({
      ...item,
      actions: (
        <button
          className="ml-4 text-lg text-blue-600"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditItemId(item.id);
            setEditName(item.name);
            setEditDescription(item.text);
          }}
          title="Modificar"
        >
          ✏️
        </button>
      ),
    }));
  };

  const loadTopics = async () => {
    try {
      const data = await fetchTopicsByKnowledge(knowledgeId);
      setListData(mapWithActions(data));
    } catch (err) {
      setError("Error al cargar los temas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createTopic(knowledgeId, { name, description });
      setShowModal(false);
      setName("");
      setDescription("");
      await loadTopics();
    } catch (err) {
      alert("Error al guardar el tema.");
    }
  };

  const handleUpdate = async () => {
    if (!editItemId) return;
    try {
      await updateTopic(editItemId, {
        name: editName,
        description: editDescription,
      });
      setEditItemId(null);
      setEditName("");
      setEditDescription("");
      await loadTopics();
    } catch (err) {
      alert("Error al actualizar el tema.");
    }
  };

  const handleMixedEvaluation = () => {
    router.push(
      `/evaluation/execution?type=MIXED&source=${encodeURIComponent(
        JSON.stringify({
          knowledges: [knowledgeId],
          topics: [],
          quizzes: [],
        }),
      )}&isInteractive=true&isShuffled=true&questionCount=5`,
    );
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

      {/* ✅ Botones juntos, pegados con gap */}
      <div className="flex justify-end gap-3 px-4 pb-2 pt-6">
        <button
          className="rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700"
          onClick={handleMixedEvaluation}
        >
          Evaluación aleatoria
        </button>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Agregar
        </button>
      </div>

      {(showModal || editItemId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editItemId ? "Modificar tema" : "Agrega un tema"}
            </h2>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={editItemId ? editName : name}
                onChange={(e) =>
                  editItemId
                    ? setEditName(e.target.value)
                    : setName(e.target.value)
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Descripción
              </label>
              <textarea
                value={editItemId ? editDescription : description}
                onChange={(e) =>
                  editItemId
                    ? setEditDescription(e.target.value)
                    : setDescription(e.target.value)
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItemId(null);
                }}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={editItemId ? handleUpdate : handleSave}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
