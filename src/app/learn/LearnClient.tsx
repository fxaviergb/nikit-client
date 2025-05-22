"use client";

import React, { useEffect, useState } from "react";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import { fetchKnowledges, createKnowledge, updateKnowledge } from "@/services/api";

const LearnClient: React.FC = () => {
  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadList();
  }, []);

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
              {editItemId ? "Modificar grupo de conocimiento" : "Agrega un grupo de conocimiento"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={editItemId ? editName : name}
                onChange={(e) =>
                  editItemId ? setEditName(e.target.value) : setName(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {!editItemId && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}
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

export default LearnClient;