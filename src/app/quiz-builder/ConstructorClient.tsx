"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchTopics, createQuizByTopic } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";
import { Trash2, Plus, Eye, EyeOff, X, ChevronDown } from "lucide-react";

const MIN_QUESTIONS = 5;
const MIN_OPTIONS = 2;
const MAX_TITLE_LENGTH = 100;
const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor"), { ssr: false });

const defaultOption = () => ({
  option: "",
  answer: {
    isCorrect: false,
    justification: "",
    extras: [],
  },
});

const defaultQuestion = () => ({
  question: "",
  justification: "",
  options: [defaultOption(), defaultOption()],
});

const ConstructorClient: React.FC = () => {
  const [topics, setTopics] = useState<GenericListItem[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState("{}");
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      const data = await fetchTopics();
      setTopics(data);
    };
    loadTopics();
  }, []);

  useEffect(() => {
    const initialPayload = {
      name: quizName,
      description: quizDescription,
      questions,
    };
    setJsonEditorValue(JSON.stringify(initialPayload, null, 2));
  }, [quizName, quizDescription, questions]);

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    if (field === "question") newQuestions[index].question = value;
    if (field === "justification") newQuestions[index].justification = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, field: string, value: string | boolean) => {
    const updated = [...questions];
    if (field === "option") updated[qIndex].options[oIndex].option = value as string;
    if (field === "isCorrect") updated[qIndex].options[oIndex].answer.isCorrect = value as boolean;
    if (field === "justification") updated[qIndex].options[oIndex].answer.justification = value as string;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, defaultQuestion()]);
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (openQuestionIndex === index) setOpenQuestionIndex(null);
  };

  const addOptionToQuestion = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push(defaultOption());
    setQuestions(updated);
  };

  const removeOptionFromQuestion = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!selectedTopicId) errors.push("Debe seleccionar un tópico.");
    if (!quizName.trim()) errors.push("Debe ingresar un nombre para el cuestionario.");
    if (!quizDescription.trim()) errors.push("Debe ingresar una descripción del cuestionario.");
    if (questions.length < MIN_QUESTIONS) errors.push(`Debe registrar al menos ${MIN_QUESTIONS} preguntas.`);

    questions.forEach((q, i) => {
      if (!q.options || q.options.length < MIN_OPTIONS) {
        errors.push(`La pregunta ${i + 1} debe tener al menos ${MIN_OPTIONS} opciones.`);
      }
      const correctAnswers = q.options.filter((opt: any) => opt.answer.isCorrect);
      if (correctAnswers.length !== 1) {
        errors.push(`La pregunta ${i + 1} debe tener exactamente UNA opción correcta.`);
      }
      const emptyOptions = q.options.filter((opt: any) => !opt.option.trim());
      if (emptyOptions.length > 0) {
        errors.push(`Todas las opciones de la pregunta ${i + 1} deben tener texto.`);
      }
    });

    return errors;
  };

  const validateQuiz = (): boolean => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert("❌ Errores encontrados:\n\n" + errors.join("\n"));
      return false;
    }
    alert("✅ Validación exitosa.");
    return true;
  };

  const silentlyValidateQuiz = (): boolean => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert("❌ Errores encontrados:\n\n" + errors.join("\n"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!silentlyValidateQuiz()) return;
    const payload = {
      name: quizName,
      description: quizDescription,
      questions,
    };
    try {
      await createQuizByTopic(selectedTopicId, payload);
      alert("✅ Cuestionario guardado exitosamente.");
      setQuizName("");
      setQuizDescription("");
      setQuestions([]);
      setSelectedTopicId("");
    } catch (error) {
      alert("❌ Error al guardar el cuestionario.");
      console.error(error);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonEditorValue(value);
  };

  const toggleView = () => {
    if (showJson) {
      try {
        const parsed = JSON.parse(jsonEditorValue);
        if (
          typeof parsed.name === "undefined" ||
          typeof parsed.description === "undefined" ||
          !Array.isArray(parsed.questions)
        ) {
          throw new Error("Estructura inválida: faltan campos requeridos o el formato es incorrecto.");
        }
        setQuizName(parsed.name);
        setQuizDescription(parsed.description);
        setQuestions(parsed.questions);
        setShowJson(false);
      } catch (err: any) {
        alert("❌ Error en el JSON: " + err.message);
      }
    } else {
      setShowJson(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Constructor de Cuestionario</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button onClick={validateQuiz} className="text-sm bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto">Validar</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto">Guardar</button>
          <button onClick={toggleView} className="flex items-center justify-center gap-2 text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full sm:w-auto">
            {showJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showJson ? "Ocultar JSON" : "Ver/Editar JSON"}
          </button>
        </div>
      </div>

      {showJson ? (
        <CodeEditor
          value={jsonEditorValue}
          language="json"
          placeholder="Escribe tu JSON aquí..."
          onChange={(evn) => handleJsonChange(evn.target.value)}
          padding={16}
          style={{
            fontSize: 14,
            backgroundColor: "#1e1e1e",
            color: "#dcdcdc",
            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
          }}
          className="rounded-md border border-gray-700"
        />
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tópico</label>
              <select className="w-full p-2 border rounded" value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)}>
                <option value="">Selecciona un tópico</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre del cuestionario</label>
              <input className="w-full p-2 border rounded" type="text" value={quizName} onChange={(e) => setQuizName(e.target.value)} placeholder="Ej. Fundamentos de DevOps" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea className="w-full p-2 border rounded" value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Describe brevemente el propósito del cuestionario..." />
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="border rounded-md">
                <button type="button" onClick={() => setOpenQuestionIndex(openQuestionIndex === qIndex ? null : qIndex)} className="w-full text-left bg-blue-50 px-3 py-2 font-medium flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transition-transform ${openQuestionIndex === qIndex ? 'rotate-180' : ''}`} />
                    <span className="truncate">{`Pregunta ${qIndex + 1}: ${q.question}`}</span>
                  </div>
                  <Trash2 onClick={() => removeQuestion(qIndex)} className="w-4 h-4 text-red-500 cursor-pointer" />
                </button>
                {openQuestionIndex === qIndex && (
                  <div className="p-4 space-y-3 bg-white text-sm">
                    <input type="text" className="w-full px-2 py-1 border rounded" placeholder="Texto de la pregunta" value={q.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt: any, oIndex: number) => (
                        <div key={oIndex} className="border rounded p-3 bg-gray-50 space-y-2 relative">
                          <button onClick={() => removeOptionFromQuestion(qIndex, oIndex)} className="absolute top-1 right-1 text-red-400 hover:text-red-600" title="Eliminar opción"><X size={16} /></button>
                          <input type="text" className="w-full px-2 py-1 border rounded" placeholder={`Opción ${oIndex + 1}`} value={opt.option} onChange={(e) => handleOptionChange(qIndex, oIndex, "option", e.target.value)} />
                          <div className="flex items-center gap-2 text-xs">
                            <input type="checkbox" checked={opt.answer.isCorrect} onChange={(e) => handleOptionChange(qIndex, oIndex, "isCorrect", e.target.checked)} />
                            <label>¿Correcta?</label>
                          </div>
                          <textarea className="w-full px-2 py-1 border rounded text-xs" placeholder="Justificación" rows={2} value={opt.answer.justification} onChange={(e) => handleOptionChange(qIndex, oIndex, "justification", e.target.value)} />
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addOptionToQuestion(qIndex)} className="text-xs mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">+ Añadir opción</button>

                    <textarea className="w-full px-2 py-1 border rounded text-sm" placeholder="Justificación general de la pregunta" rows={2} value={q.justification} onChange={(e) => handleQuestionChange(qIndex, "justification", e.target.value)} />
                  </div>
                )}
              </div>
            ))}

            <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              <Plus className="w-4 h-4" /> Añadir pregunta
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConstructorClient;