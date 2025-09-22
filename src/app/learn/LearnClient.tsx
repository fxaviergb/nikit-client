"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import {
  fetchKnowledges,
  createKnowledge,
  updateKnowledge,
} from "@/services/api";

const LearnClient: React.FC = () => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const router = useRouter();

  useEffect(() => {
    loadList();
  }, []);

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
          }}
          title="Modificar"
        >
          ✏️
        </button>
      ),
    }));
  };

  const loadList = async () => {
    try {
      const data = await fetchKnowledges();
      setListData(mapWithActions(data));
    } catch (err) {
      setError("Error al cargar los grupos de conocimiento.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await createKnowledge({ name, description });
      setShowModal(false);
      setName("");
      setDescription("");
      await loadList();
    } catch (err) {
      alert("Error al guardar el grupo de conocimiento.");
    }
  };

  const handleUpdate = async () => {
    if (!editItemId) return;
    try {
      await updateKnowledge(editItemId, { name: editName });
      setEditItemId(null);
      setEditName("");
      await loadList();
    } catch (err) {
      alert("Error al actualizar el grupo de conocimiento.");
    }
  };

  const handleMixedEvaluation = () => {
    router.push(
      `/evaluation/execution?type=MIXED&source=${encodeURIComponent(
        JSON.stringify({
          knowledges: listData.map((item) => item.id),
          topics: [],
          quizzes: [],
        }),
      )}&isInteractive=true&isShuffled=true&questionCount=5`,
    );
  };

  if (loading) return <p>Cargando grupos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {listData.length === 0 ? (
        <p>No hay grupos de conocimiento disponibles.</p>
      ) : (
        <GenericListCard
          cardTitle="Grupos de conocimiento"
          listData={listData}
          generateHref={(id) => `/learn/${id}/topics`}
        />
      )}

      <div className="flex justify-end gap-4 px-4 pb-2 pt-6">
        {/* ✅ Botón verde, siempre visible si hay al menos un knowledge */}
        {listData.length > 0 && (
          <button
            onClick={handleMixedEvaluation}
            className="rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700"
          >
            Evaluación aleatoria
          </button>
        )}
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
              {editItemId
                ? "Modificar grupo de conocimiento"
                : "Agrega un grupo de conocimiento"}
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
            {!editItemId && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            )}
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

export default LearnClient;
