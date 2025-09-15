"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  fetchKnowledges,
  fetchTopicsByKnowledge,
  fetchQuizzesByTopic,
  fetchQuizById,
  updateQuiz,
} from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";
import { Quiz, QuizQuestion, QuizOption } from "@/types/quiz";

const MIN_QUESTIONS = 5;
const MIN_OPTIONS = 2;
const optionLabels = ["A", "B", "C", "D", "E", "F"];

const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor"), {
  ssr: false,
});

const baseAudit = () => ({
  createdAt: new Date().toISOString(),
  updatedAt: null,
  createdBy: "system",
  updatedBy: null,
});

const createNewQuestion = (quizId: string): QuizQuestion => ({
  id: `front-uuid-${crypto.randomUUID()}`,
  question: "Nueva pregunta",
  questionVersion: 1,
  quizId,
  options: [],
  audit: baseAudit(),
});

const createNewOption = (questionId: string | null): QuizOption => ({
  id: `front-uuid-${crypto.randomUUID()}`,
  questionId,
  option: "Nueva opción",
  answer: { isCorrect: false, justification: "", extras: [] },
  audit: baseAudit(),
});

/* -------------------- SUBCOMPONENTES -------------------- */

interface OptionItemProps {
  option: QuizOption;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}
const OptionItem: React.FC<OptionItemProps> = ({
  option,
  index,
  onEdit,
  onDelete,
}) => {
  const icon = option.answer.isCorrect ? "✅" : "🔹";
  const bgClass = option.answer.isCorrect
    ? "bg-green-50 border-green-500"
    : "border-gray-300";

  return (
    <div
      key={option.id}
      className={`flex items-center space-x-2 rounded-md border p-2 ${bgClass}`}
    >
      <span>{icon}</span>
      <span className="font-semibold">{optionLabels[index]}.</span>
      <span>{option.option}</span>
      <button
        onClick={onEdit}
        className="ml-auto text-xs text-blue-600 hover:underline"
      >
        ✏️ Editar
      </button>
      <button
        onClick={onDelete}
        className="ml-2 text-xs text-red-600 hover:underline"
      >
        🗑️
      </button>
    </div>
  );
};

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  onEdit: (updated: QuizQuestion) => void;
  onAddOption: () => void;
  onDelete: () => void;
  onEditOption: (opt: QuizOption) => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteLink: (i: number) => void;
  jsonEditActive: boolean;
  setJsonEditActive: (val: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onEdit,
  onAddOption,
  onDelete,
  onEditOption,
  onDeleteOption,
  onDeleteLink,
  jsonEditActive,
  setJsonEditActive,
}) => {
  const renderJson = () =>
    JSON.stringify(
      {
        question: question.question,
        options: question.options.map((opt) => ({
          option: opt.option,
          answer: {
            isCorrect: opt.answer.isCorrect,
            justification: opt.answer.justification,
            extras: opt.answer.extras,
          },
        })),
      },
      null,
      2,
    );

  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState(renderJson());
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previousValidJsonText, setPreviousValidJsonText] =
    useState(renderJson());
  const [originalQuestion] = useState<QuizQuestion>(
    JSON.parse(JSON.stringify(question)),
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleJsonChange = (text: string) => {
    setJsonText(text);
  };

  return (
    <div className="rounded-lg bg-white shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-lg p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-base text-gray-600">
          {index + 1}. {question.question}
        </h3>
        <span className="text-gray-600">{isOpen ? "⬆️" : "⬇️"}</span>
      </div>

      {isOpen && (
        <div className="border-t p-4">
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={onAddOption}
              className="text-sm text-green-600 hover:underline"
            >
              ➕ Opción
            </button>

            <button
              onClick={() => {
                if (showJson) {
                  try {
                    const parsed = JSON.parse(jsonText);
                    const reconstructed: QuizQuestion = {
                      ...question,
                      question: parsed.question,
                      options: parsed.options.map((o: any) => ({
                        id: o.id || `front-uuid-${crypto.randomUUID()}`,
                        questionId: question.id,
                        option: o.option,
                        answer: {
                          isCorrect: o.answer.isCorrect,
                          justification: o.answer.justification,
                          extras: o.answer.extras || [],
                        },
                        audit:
                          question.options.find(
                            (opt) => opt.option === o.option,
                          )?.audit || baseAudit(),
                      })),
                    };
                    onEdit(reconstructed);
                    setPreviousValidJsonText(jsonText);
                    setShowJson(false);
                    setJsonEditActive(false);
                    setJsonError(null);
                  } catch (err: any) {
                    setJsonError(err.message);
                  }
                } else {
                  setPreviousValidJsonText(renderJson());
                  setShowJson(true);
                  setJsonEditActive(true);
                }
              }}
              className="text-sm text-purple-600 hover:underline"
            >
              {showJson ? "🔙 Vista normal" : "🧩 JSON"}
            </button>

            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:underline"
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => {
                onEdit(originalQuestion);
                setJsonText(
                  JSON.stringify(
                    {
                      question: originalQuestion.question,
                      options: originalQuestion.options.map((opt) => ({
                        option: opt.option,
                        answer: {
                          isCorrect: opt.answer.isCorrect,
                          justification: opt.answer.justification,
                          extras: opt.answer.extras || [],
                        },
                      })),
                    },
                    null,
                    2,
                  ),
                );
              }}
              className="text-sm text-red-600 hover:underline"
            >
              ↩️ Restaurar
            </button>

            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:underline"
            >
              🗑️ Eliminar
            </button>
          </div>

          {showJson ? (
            <CodeEditor
              value={jsonText}
              language="json"
              className="mt-4 rounded border bg-gray-50 p-2 text-sm"
              onChange={(e) => handleJsonChange(e.target.value)}
            />
          ) : (
            <>
              <div className="mt-2 space-y-2">
                {question.options.map((opt, oIndex) => (
                  <OptionItem
                    key={opt.id}
                    option={opt}
                    index={oIndex}
                    onEdit={() => onEditOption(opt)}
                    onDelete={() => onDeleteOption(opt.id)}
                  />
                ))}
              </div>

              {question.options.find((o) => o.answer.isCorrect)?.answer
                .justification && (
                <div className="mt-4 rounded border-l-4 border-yellow-500 bg-yellow-50 p-3 text-yellow-800">
                  <p className="font-semibold">Justificación:</p>
                  <p className="text-sm">
                    {
                      question.options.find((o) => o.answer.isCorrect)?.answer
                        .justification
                    }
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-blue-600">
                    {question.options
                      .find((o) => o.answer.isCorrect)
                      ?.answer.extras?.map((link, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 hover:underline"
                          >
                            {link}
                          </a>
                          <button
                            onClick={() => onDeleteLink(i)}
                            className="ml-2 text-xs text-red-600"
                          >
                            🗑️
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {jsonError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-red-600">
              ❌ Error de formato JSON
            </h2>
            <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">
              {jsonError}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setJsonError(null)}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Volver a revisar
              </button>
              <button
                onClick={() => {
                  setJsonError(null);
                  setShowJson(false);
                  setJsonEditActive(false);
                  setJsonText(previousValidJsonText);
                }}
                className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- COMPONENTE PRINCIPAL -------------------- */

const EditorClient: React.FC = () => {
  const [knowledges, setKnowledges] = useState<GenericListItem[]>([]);
  const [topics, setTopics] = useState<GenericListItem[]>([]);
  const [quizzes, setQuizzes] = useState<GenericListItem[]>([]);

  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<Quiz | null>(null);

  const [modalQuestion, setModalQuestion] = useState<QuizQuestion | null>(null);
  const [modalOption, setModalOption] = useState<QuizOption | null>(null);
  const [modalQuizData, setModalQuizData] = useState<Quiz | null>(null);
  const [modalType, setModalType] = useState<
    "question" | "option" | "quiz" | null
  >(null);
  const [jsonEditActive, setJsonEditActive] = useState(false);

  const [newLink, setNewLink] = useState("");

  const [showQuizJson, setShowQuizJson] = useState(false);
  const [quizJsonText, setQuizJsonText] = useState("");
  const [quizJsonError, setQuizJsonError] = useState<string | null>(null);
  const [bulkQuestionsModal, setBulkQuestionsModal] = useState(false);
  const [bulkQuestionsJson, setBulkQuestionsJson] = useState<string>("[]");
  const [bulkQuestionsError, setBulkQuestionsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchKnowledges().then(setKnowledges);
  }, []);

  useEffect(() => {
    if (!selectedKnowledge) {
      setTopics([]);
      setQuizzes([]);
      setSelectedTopic(null);
      return;
    }
    fetchTopicsByKnowledge(selectedKnowledge).then((data) => {
      setTopics(data);
      setQuizzes([]);
      setSelectedTopic(null);
      setSelectedQuiz(null);
      setQuizData(null);
    });
  }, [selectedKnowledge]);

  useEffect(() => {
    if (!selectedTopic) {
      setQuizzes([]);
      setSelectedQuiz(null);
      return;
    }
    fetchQuizzesByTopic(selectedTopic).then((data) => {
      setQuizzes(data);
      setSelectedQuiz(null);
      setQuizData(null);
    });
  }, [selectedTopic]);

  useEffect(() => {
    if (!selectedQuiz) {
      setQuizData(null);
      return;
    }
    fetchQuizById(selectedQuiz).then(setQuizData);
  }, [selectedQuiz]);

  const renderQuizJson = () =>
    JSON.stringify(
      {
        name: quizData?.name,
        description: quizData?.description,
        questions: quizData?.questions.map((q) => ({
          question: q.question,
          options: q.options.map((o) => ({
            option: o.option,
            answer: o.answer,
          })),
        })),
      },
      null,
      2,
    );

  /* -------- Manejo de modal -------- */
  const openEditor = (
    type: "quiz" | "question" | "option",
    data: Quiz | QuizQuestion | QuizOption,
  ) => {
    setModalType(type);
    if (type === "quiz") setModalQuizData(data as Quiz);
    if (type === "question") setModalQuestion(data as QuizQuestion);
    if (type === "option") setModalOption(data as QuizOption);
  };

  const closeModal = () => {
    setModalQuestion(null);
    setModalOption(null);
    setModalQuizData(null);
    setModalType(null);
    setNewLink("");
  };

  /* -------- Operaciones -------- */
  const handleAddQuestion = () => {
    if (!quizData) return;
    const newQ = createNewQuestion(quizData.id);
    setQuizData({ ...quizData, questions: [...quizData.questions, newQ] });
    openEditor("question", newQ);
  };

  const handleAddOption = (questionId?: string | null) => {
    if (!quizData) return;
    const newO = createNewOption(questionId);
    setQuizData({
      ...quizData,
      questions: quizData.questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, newO] } : q,
      ),
    });
    openEditor("option", newO);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuizData((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.filter((q) => q.id !== questionId),
          }
        : prev,
    );
  };

  const handleDeleteOption = (questionId: string, optionId: string) => {
    setQuizData((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    options: q.options.filter((opt) => opt.id !== optionId),
                  }
                : q,
            ),
          }
        : prev,
    );
  };

  const handleDeleteLink = (linkIndex: number) => {
    if (modalOption) {
      const updatedExtras = [...(modalOption.answer.extras || [])];
      updatedExtras.splice(linkIndex, 1);
      setModalOption({
        ...modalOption,
        answer: { ...modalOption.answer, extras: updatedExtras },
      });
    }
  };

  const handleSave = () => {
    if (modalType === "quiz" && modalQuizData) {
      setQuizData((prev) => (prev ? { ...prev, ...modalQuizData } : prev));
    } else if (modalType === "question" && modalQuestion && quizData) {
      setQuizData({
        ...quizData,
        questions: quizData.questions.map((q) =>
          q.id === modalQuestion.id ? modalQuestion : q,
        ),
      });
    } else if (modalType === "option" && modalOption && quizData) {
      setQuizData({
        ...quizData,
        questions: quizData.questions.map((q) =>
          q.id === modalOption.questionId
            ? {
                ...q,
                options: q.options.map((o) =>
                  o.id === modalOption.id ? modalOption : o,
                ),
              }
            : q,
        ),
      });
    }
    closeModal();
  };

  /* -------- Validación -------- */
  const getValidationErrors = (): string[] => {
    if (!quizData) return ["No hay cuestionario cargado"];
    const errors: string[] = [];

    if (!selectedTopic) errors.push("Debe seleccionar un tópico.");
    if (!quizData.name?.trim()) errors.push("Debe ingresar un nombre.");
    if (!quizData.description?.trim())
      errors.push("Debe ingresar una descripción.");
    if (quizData.questions.length < MIN_QUESTIONS)
      errors.push(`Debe registrar al menos ${MIN_QUESTIONS} preguntas.`);

    quizData.questions.forEach((q, i) => {
      if (q.options.length < MIN_OPTIONS)
        errors.push(
          `La pregunta ${i + 1} debe tener al menos ${MIN_OPTIONS} opciones.`,
        );

      if (q.options.filter((opt) => opt.answer.isCorrect).length !== 1)
        errors.push(
          `La pregunta ${i + 1} debe tener exactamente UNA opción correcta.`,
        );

      if (q.options.some((opt) => !opt.option.trim()))
        errors.push(
          `Todas las opciones de la pregunta ${i + 1} deben tener texto.`,
        );
    });

    return errors;
  };

  const handleValidateQuiz = async () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert("❌ Errores encontrados:\n\n" + errors.join("\n"));
      return false;
    }
    alert("✅ Validación exitosa.");
    return true;
  };

  const handleSaveQuiz = async () => {
    if (!quizData) return;
    try {
      if (!(await handleValidateQuiz())) return;
      const payload = cleanQuizForBackend(quizData);
      const updatedQuiz = await updateQuiz(quizData.id, payload);
      setQuizData(updatedQuiz);
      alert("✅ Cambios guardados correctamente.");
    } catch (err: any) {
      alert("❌ Error al guardar: " + err.message);
    }
  };

  const cleanQuizForBackend = (quiz: Quiz) => {
    const isFrontGeneratedId = (id: string | undefined) =>
      !!id && id.startsWith("front-uuid-");
    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        id: q.id && !isFrontGeneratedId(q.id) ? q.id : undefined,
        question: q.question,
        options: q.options.map((o) => ({
          id: o.id && !isFrontGeneratedId(o.id) ? o.id : undefined,
          option: o.option,
          answer: {
            isCorrect: o.answer.isCorrect,
            justification: o.answer.justification,
            extras: o.answer.extras?.filter((e) => !!e?.trim()) || [],
          },
        })),
      })),
    };
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="relative space-y-6 p-6">
      <a id="top" />
      <h1 className="text-xl font-bold">Editor de Cuestionarios</h1>

      {/* Selectores */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Área de Conocimiento
          </label>
          <select
            className="w-full rounded border p-2"
            value={selectedKnowledge ?? ""}
            onChange={(e) => setSelectedKnowledge(e.target.value || null)}
          >
            <option value="">Seleccione un área</option>
            {knowledges.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        {topics.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium">Tópico</label>
            <select
              className="w-full rounded border p-2"
              value={selectedTopic ?? ""}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
            >
              <option value="">Seleccione un tópico</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {quizzes.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Cuestionario
            </label>
            <select
              className="w-full rounded border p-2"
              value={selectedQuiz ?? ""}
              onChange={(e) => setSelectedQuiz(e.target.value || null)}
            >
              <option value="">Seleccione un cuestionario</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Botones */}
      {quizData && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleValidateQuiz}
            className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
          >
            Validar
          </button>
          <button
            onClick={handleSaveQuiz}
            className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              if (showQuizJson) {
                try {
                  const parsed = JSON.parse(quizJsonText);
                  setQuizData((prev) =>
                    prev
                      ? {
                          ...prev,
                          name: parsed.name,
                          description: parsed.description,
                          questions: parsed.questions.map((q: any) => ({
                            id: q.id || `front-uuid-${crypto.randomUUID()}`,
                            question: q.question,
                            options: q.options.map((o: any) => ({
                              id: o.id || `front-uuid-${crypto.randomUUID()}`,
                              option: o.option,
                              answer: o.answer,
                            })),
                            audit: baseAudit(),
                          })),
                        }
                      : null,
                  );
                  setShowQuizJson(false);
                  setQuizJsonError(null);
                } catch (err: any) {
                  setQuizJsonError(err.message);
                }
              } else {
                setQuizJsonText(renderQuizJson());
                setShowQuizJson(true);
              }
            }}
            className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-600"
          >
            {showQuizJson ? "Vista normal" : "{ } JSON"}
          </button>
        </div>
      )}

      {/* Vista del cuestionario */}
      {quizData && (
        <div className="mt-6">
          {showQuizJson ? (
            <CodeEditor
              value={quizJsonText}
              language="json"
              className="w-full rounded border bg-gray-50 p-2 text-sm"
              onChange={(e) => setQuizJsonText(e.target.value)}
            />
          ) : (
            <>
              <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    {quizData.name}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openEditor("quiz", quizData);
                      }}
                      className="text-sm font-normal text-blue-600 hover:underline"
                    >
                      ✏️ Editar
                    </a>
                  </h2>
                  <p className="text-gray-600">{quizData.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Versión {quizData.version} · Creado el{" "}
                    {quizData.audit?.createdAt
                      ? new Date(quizData.audit.createdAt).toLocaleString()
                      : "Fecha desconocida"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {quizData.questions.map((question, qIndex) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={qIndex}
                    onEdit={(updatedQuestion) => {
                      setQuizData((prev) =>
                        prev
                          ? {
                              ...prev,
                              questions: prev.questions.map((q) =>
                                q.id === updatedQuestion.id
                                  ? updatedQuestion
                                  : q,
                              ),
                            }
                          : prev,
                      );
                    }}
                    onAddOption={() => handleAddOption(question.id)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                    onEditOption={(opt) => openEditor("option", opt)}
                    onDeleteOption={(optionId) =>
                      handleDeleteOption(question.id, optionId)
                    }
                    onDeleteLink={handleDeleteLink}
                    jsonEditActive={jsonEditActive}
                    setJsonEditActive={setJsonEditActive}
                  />
                ))}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleAddQuestion}
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    ➕ Añadir nueva pregunta
                  </button>
                  <button
                    onClick={() => setBulkQuestionsModal(true)}
                    className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    📥 Añadir varias preguntas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {bulkQuestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              📥 Añadir varias preguntas
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              Ingresa un JSON con el formato usado para preguntas y opciones.
            </p>
            <textarea
              rows={12}
              className="font-mono w-full rounded border p-2 text-sm"
              value={bulkQuestionsJson}
              onChange={(e) => setBulkQuestionsJson(e.target.value)}
            />
            {bulkQuestionsError && (
              <p className="mt-2 text-sm text-red-600">
                ❌ {bulkQuestionsError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setBulkQuestionsModal(false)}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(bulkQuestionsJson);
                    if (!Array.isArray(parsed)) {
                      throw new Error(
                        "El JSON debe ser un array de preguntas.",
                      );
                    }
                    const newQuestions: QuizQuestion[] = parsed.map(
                      (q: any) => ({
                        id: `front-uuid-${crypto.randomUUID()}`,
                        question: q.question || "Pregunta sin título",
                        questionVersion: 1,
                        quizId: quizData?.id || "",
                        options: (q.options || []).map((o: any) => ({
                          id: `front-uuid-${crypto.randomUUID()}`,
                          questionId: quizData?.id || "",
                          option: o.option,
                          answer: o.answer,
                          audit: baseAudit(),
                        })),
                        audit: baseAudit(),
                      }),
                    );

                    setQuizData((prev) =>
                      prev
                        ? {
                            ...prev,
                            questions: [...prev.questions, ...newQuestions],
                          }
                        : prev,
                    );

                    setBulkQuestionsModal(false);
                    setBulkQuestionsJson("[]");
                    setBulkQuestionsError(null);
                  } catch (err: any) {
                    setBulkQuestionsError(err.message);
                  }
                }}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error JSON Quiz */}
      {quizJsonError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-red-600">
              ❌ Error de formato JSON
            </h2>
            <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">
              {quizJsonError}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setQuizJsonError(null)}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Volver a revisar
              </button>
              <button
                onClick={() => {
                  setQuizJsonError(null);
                  setShowQuizJson(false);
                }}
                className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante regresar al inicio */}
      <a
        href="#top"
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg hover:bg-blue-700"
        title="Volver al inicio"
      >
        ⬆️
      </a>
    </div>
  );
};

export default EditorClient;
