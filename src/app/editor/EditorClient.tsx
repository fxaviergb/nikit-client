"use client";

import React, { useEffect, useState } from "react";
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

  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    const loadKnowledges = async () => {
      const data = await fetchKnowledges();
      setKnowledges(data);
    };
    loadKnowledges();
  }, []);

  useEffect(() => {
    if (!selectedKnowledge) {
      setTopics([]);
      setQuizzes([]);
      setSelectedTopic(null);
      return;
    }

    const loadTopics = async () => {
      const data = await fetchTopicsByKnowledge(selectedKnowledge);
      setTopics(data);
      setQuizzes([]);
      setSelectedTopic(null);
      setSelectedQuiz(null);
      setQuizData(null);
    };
    loadTopics();
  }, [selectedKnowledge]);

  useEffect(() => {
    if (!selectedTopic) {
      setQuizzes([]);
      setSelectedQuiz(null);
      return;
    }

    const loadQuizzes = async () => {
      const data = await fetchQuizzesByTopic(selectedTopic);
      setQuizzes(data);
      setSelectedQuiz(null);
      setQuizData(null);
    };
    loadQuizzes();
  }, [selectedTopic]);

  useEffect(() => {
    if (!selectedQuiz) {
      setQuizData(null);
      return;
    }

    const loadQuizDetails = async () => {
      const data = await fetchQuizById(selectedQuiz);
      setQuizData(data);
    };
    loadQuizDetails();
  }, [selectedQuiz]);

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const openQuestionEditor = (question: QuizQuestion | null) => {
    setModalQuestion(question);
    setModalType("question");
  };

  const openOptionEditor = (option: QuizOption) => {
    setModalOption(option);
    setModalType("option");
  };

  const closeModal = () => {
    setModalQuestion(null);
    setModalOption(null);
    setModalQuizData(null);
    setModalType(null);
    setNewLink("");
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `front-uuid-${crypto.randomUUID()}`,
      question: "Nueva pregunta",
      questionVersion: 1,
      quizId: quizData!.id,
      options: [],
      audit: {
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: "system",
        updatedBy: null,
      },
    };
    setQuizData((prev) =>
      prev ? { ...prev, questions: [...prev.questions, newQuestion] } : prev,
    );
    openQuestionEditor(newQuestion);
  };

  const handleAddOption = (questionId?: string | null) => {
    const newOption: QuizOption = {
      id: `front-uuid-${crypto.randomUUID()}`,
      questionId: questionId ?? null,
      option: "Nueva opción",
      answer: { isCorrect: false, justification: "", extras: [] },
      audit: {
        createdAt: new Date().toISOString(),
        updatedAt: null,
        createdBy: "system",
        updatedBy: null,
      },
    };
    setQuizData((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === questionId
                ? { ...q, options: [...q.options, newOption] }
                : q,
            ),
          }
        : prev,
    );
    setModalOption(newOption);
    setModalType("option");
  };

  const handleDeleteQuestion = (questionId: string | null) => {
    setQuizData((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.filter((q) => q.id !== questionId),
          }
        : prev,
    );
  };

  const handleDeleteOption = (
    questionId: string | null,
    optionId: string | null,
  ) => {
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
        answer: {
          ...modalOption.answer,
          extras: updatedExtras,
        },
      });
    }
  };

  const handleSave = () => {
    if (modalType === "quiz" && modalQuizData) {
      setQuizData((prev) => (prev ? { ...prev, ...modalQuizData } : prev));
    } else if (modalType === "question" && modalQuestion && quizData) {
      setQuizData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === modalQuestion.id ? modalQuestion : q,
              ),
            }
          : prev,
      );
    } else if (modalType === "option" && modalOption && quizData) {
      setQuizData((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === modalOption.questionId
                  ? {
                      ...q,
                      options: q.options.map((o) =>
                        o.id === modalOption.id ? modalOption : o,
                      ),
                    }
                  : q,
              ),
            }
          : prev,
      );
    }

    closeModal();
  };

  // Validar cuestionario
  const handleValidateQuiz = async () => {
    if (!quizData) return;
    if (!isValidateQuiz()) return false;
    alert("✅ Validación exitosa.");
    return true;
  };

  // Guardar cambios
  const handleSaveQuiz = async () => {
    if (!quizData) return;
    try {
      if (!isValidateQuiz()) return;

      const payload = cleanQuizForBackend(quizData);

      console.log("Enviando payload al backend:", payload);

      const updatedQuiz = await updateQuiz(quizData.id, payload);

      setQuizData(updatedQuiz);
      alert("✅ Cambios guardados correctamente.");
    } catch (err: any) {
      alert("❌ Error al guardar: " + err.message);
    }
  };

  const isValidateQuiz = (): boolean => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert("❌ Errores encontrados:\n\n" + errors.join("\n"));
      return false;
    }
    return true;
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!selectedTopic) errors.push("Debe seleccionar un tópico.");
    if (!quizData?.name?.trim())
      errors.push("Debe ingresar un nombre para el cuestionario.");
    if (!quizData?.description?.trim())
      errors.push("Debe ingresar una descripción del cuestionario.");
    if (!quizData?.questions || quizData.questions.length < MIN_QUESTIONS)
      errors.push(`Debe registrar al menos ${MIN_QUESTIONS} preguntas.`);

    quizData?.questions?.forEach((q, i) => {
      if (!q.options || q.options.length < MIN_OPTIONS) {
        errors.push(
          `La pregunta ${i + 1} debe tener al menos ${MIN_OPTIONS} opciones.`,
        );
      }
      const correctAnswers = q.options.filter((opt) => opt.answer.isCorrect);
      if (correctAnswers.length !== 1) {
        errors.push(
          `La pregunta ${i + 1} debe tener exactamente UNA opción correcta.`,
        );
      }
      const emptyOptions = q.options.filter((opt) => !opt.option.trim());
      if (emptyOptions.length > 0) {
        errors.push(
          `Todas las opciones de la pregunta ${i + 1} deben tener texto.`,
        );
      }
    });

    return errors;
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

  return (
    <div className="space-y-6 p-6">
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

      {/* Vista del cuestionario */}
      {quizData && (
        <div className="mt-6">
          {/* ... encabezado del cuestionario ... */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {quizData.name}
                </h2>
                <p className="text-gray-600">{quizData.description}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Versión {quizData.version} · Creado el{" "}
                  {quizData.audit?.createdAt
                    ? new Date(quizData.audit.createdAt).toLocaleString()
                    : "Fecha desconocida"}
                </p>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalQuizData(quizData);
                  setModalType("quiz");
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                ✏️ Editar
              </a>
            </div>
          </div>

          <div className="space-y-6">
            {quizData.questions.map((question, qIndex) => {
              const correctOption = question.options.find(
                (o) => o.answer.isCorrect,
              );

              return (
                <div
                  key={question.id}
                  className="rounded-lg bg-white p-4 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => openQuestionEditor(question)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleAddOption(question.id)}
                        className="text-sm text-green-600 hover:underline"
                      >
                        ➕ Opción
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteQuestion(question.id ?? null)
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {question.options.map((opt, oIndex) => {
                      const icon = opt.answer.isCorrect ? "✅" : "🔹";
                      const bgClass = opt.answer.isCorrect
                        ? "bg-green-50 border-green-500"
                        : "border-gray-300";
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center space-x-2 rounded-md border p-2 ${bgClass}`}
                        >
                          <span>{icon}</span>
                          <span className="font-semibold">
                            {optionLabels[oIndex]}.
                          </span>
                          <span>{opt.option}</span>
                          <button
                            onClick={() => openOptionEditor(opt)}
                            className="ml-auto text-xs text-blue-600 hover:underline"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteOption(
                                question.id ?? null,
                                opt.id ?? null,
                              )
                            }
                            className="ml-2 text-xs text-red-600 hover:underline"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {correctOption?.answer.justification && (
                    <div className="mt-4 rounded border-l-4 border-yellow-500 bg-yellow-50 p-3 text-yellow-800">
                      <p className="font-semibold">Justificación:</p>
                      <p className="text-sm">
                        {correctOption.answer.justification}
                      </p>
                      {Array.isArray(correctOption.answer.extras) &&
                        correctOption.answer.extras.length > 0 && (
                          <ul className="mt-2 list-inside list-disc text-sm text-blue-600">
                            {correctOption.answer.extras.map((link, i) => (
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
                                  onClick={() => handleDeleteLink(i)}
                                  className="ml-2 text-xs text-red-600"
                                >
                                  🗑️
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleAddQuestion}
              className="mt-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              ➕ Añadir nueva pregunta
            </button>

            {/* Botones de acción */}
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleValidateQuiz}
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Validar cuestionario
              </button>
              <button
                onClick={handleSaveQuiz}
                className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editor */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {modalType === "question" ? "Editar Pregunta" : "Editar Opción"}
            </h3>

            {modalType === "quiz" && modalQuizData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Nombre del Cuestionario
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded border p-2"
                    value={modalQuizData.name}
                    onChange={(e) =>
                      setModalQuizData((prev) =>
                        prev ? { ...prev, name: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded border p-2"
                    value={modalQuizData.description}
                    onChange={(e) =>
                      setModalQuizData((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev,
                      )
                    }
                  />
                </div>
              </div>
            )}

            {modalType === "question" && modalQuestion && (
              <div className="space-y-4">
                <textarea
                  className="w-full rounded border p-2"
                  rows={3}
                  value={modalQuestion.question}
                  onChange={(e) =>
                    setModalQuestion({
                      ...modalQuestion,
                      question: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {modalType === "option" && modalOption && (
              <div className="space-y-4">
                <textarea
                  className="w-full rounded border p-2"
                  rows={2}
                  value={modalOption.option}
                  onChange={(e) =>
                    setModalOption({ ...modalOption, option: e.target.value })
                  }
                />
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={modalOption.answer.isCorrect}
                    onChange={(e) =>
                      setModalOption({
                        ...modalOption,
                        answer: {
                          ...modalOption.answer,
                          isCorrect: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>¿Es la opción correcta?</span>
                </label>
                <textarea
                  className="w-full rounded border p-2"
                  rows={2}
                  placeholder="Justificación"
                  value={modalOption.answer.justification}
                  onChange={(e) =>
                    setModalOption({
                      ...modalOption,
                      answer: {
                        ...modalOption.answer,
                        justification: e.target.value,
                      },
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-semibold">
                    Links de referencia
                  </label>
                  <ul className="mt-2 space-y-1">
                    {modalOption.answer.extras?.map((link, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm text-blue-600"
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                        <button
                          onClick={() => handleDeleteLink(i)}
                          className="ml-2 text-xs text-red-600"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Nuevo link"
                      className="flex-1 rounded border p-1"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                    />
                    <button
                      onClick={() => {
                        if (newLink.trim()) {
                          setModalOption({
                            ...modalOption,
                            answer: {
                              ...modalOption.answer,
                              extras: [
                                ...(modalOption.answer.extras || []),
                                newLink,
                              ],
                            },
                          });
                          setNewLink("");
                        }
                      }}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                    >
                      ➕
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorClient;
