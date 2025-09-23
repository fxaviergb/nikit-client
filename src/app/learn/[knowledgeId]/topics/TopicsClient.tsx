"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenericListCard from "@/components/List/GenericListCard";
import { GenericListItem } from "@/types/generic-list-item";
import {
  fetchTopicsByKnowledge,
  createTopic,
  updateTopic,
  fetchAttemptsSummary,
} from "@/services/api";
import QuizAttemptsSection from "@/components/Quiz/QuizAttemptsSection";
import { AttemptSummary } from "@/types/attempt-summary";
import ToggleSwitch from "@/components/Switchers/ToggleSwitch";
import EvaluationConfigModal from "@/components/Evaluation/EvaluationConfigModal";

interface TopicsClientProps {
  knowledgeId: string;
}

const TopicsClient: React.FC<TopicsClientProps> = ({ knowledgeId }) => {
  const router = useRouter();

  const [listData, setListData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Sección de intentos
  const [showAttempts, setShowAttempts] = useState(false);
  const [attemptsSummary, setAttemptsSummary] = useState<AttemptSummary | null>(
    null,
  );
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Estado para abrir/cerrar modal
  const [showEvalModal, setShowEvalModal] = useState(false);

  useEffect(() => {
    if (!knowledgeId) {
      setError("ID de grupo de conocimiento no proporcionado");
      setLoading(false);
      return;
    }
    loadTopics();
  }, [knowledgeId]);

  const mapWithActions = (items: GenericListItem[]): GenericListItem[] =>
    items.map((item) => ({
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

  const handleToggleAttempts = async () => {
    if (!showAttempts) {
      setLoadingAttempts(true);
      const summary = await fetchAttemptsSummary([knowledgeId], null, null);
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
        JSON.stringify({ knowledges: [knowledgeId], topics: [], quizzes: [] }),
      )}&isInteractive=${isInteractive}&isShuffled=${isShuffled}&questionCount=${questionCount}`,
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
          cardActions={
            <ToggleSwitch
              label="Intentos"
              checked={showAttempts}
              onToggle={handleToggleAttempts}
            />
          }
          listData={listData}
          generateHref={(id) => `/learn/${knowledgeId}/topics/${id}/quizzes`}
        />
      )}

      {/* ✅ Botones principales */}
      <div className="flex flex-col justify-end gap-3 px-4 pb-2 pt-6 sm:flex-row">
        <button
          className="w-full rounded bg-green-600 px-4 py-2 text-white shadow transition hover:bg-green-700 sm:w-50"
          onClick={() => setShowEvalModal(true)}
        >
          Evaluación aleatoria
        </button>
        <button
          className="w-full rounded bg-blue-600 px-4 py-2 text-white shadow transition hover:bg-blue-700 sm:w-50"
          onClick={() => setShowModal(true)}
        >
          Agregar
        </button>
      </div>

      {/* Modal de configuración */}
      <EvaluationConfigModal
        isOpen={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        onConfirm={handleConfirmEvaluation}
      />

      {/* Sección elegante de intentos */}
      {showAttempts && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          {loadingAttempts ? (
            <p className="text-gray-500">Cargando intentos...</p>
          ) : attemptsSummary && attemptsSummary.attempts.length > 0 ? (
            <QuizAttemptsSection
              quizId={knowledgeId}
              attempts={attemptsSummary.attempts}
              title={`Dominio de la sección: ${attemptsSummary.efficiencyPercentage?.toFixed(2) ?? 0}%`}
            />
          ) : (
            <p className="text-gray-600">
              No se han registrado intentos en este grupo.
            </p>
          )}
        </div>
      )}

      {/* Modal agregar/editar */}
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
