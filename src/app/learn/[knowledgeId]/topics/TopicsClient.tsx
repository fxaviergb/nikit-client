"use client";

import React, { useEffect, useState } from "react";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import { fetchTopicsByKnowledge, createTopic, updateTopic } from "@/services/api";

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
          className="text-blue-600 ml-4 text-lg"
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
      await updateTopic(editItemId, { name: editName, description: editDescription });
      setEditItemId(null);
      setEditName("");
      setEditDescription("");
      await loadTopics();
    } catch (err) {
      alert("Error al actualizar el tema.");
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

      {(showModal || editItemId) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editItemId ? "Modificar tema" : "Agrega un tema"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={editItemId ? editName : name}
                onChange={(e) => editItemId ? setEditName(e.target.value) : setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={editItemId ? editDescription : description}
                onChange={(e) => editItemId ? setEditDescription(e.target.value) : setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItemId(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={editItemId ? handleUpdate : handleSave}
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