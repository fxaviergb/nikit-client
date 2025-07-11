"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizQuestions, sendQuizAnswers } from "@/services/api";

interface EvaluationExecutionClientProps {
  quizId: string;
  isInteractive: boolean;
  isShuffled: boolean;
}

interface QuizOption {
  id: string;
  option: string;
  answer: {
    isCorrect: boolean;
  };
}

interface Question {
  id: string;
  question: string;
  options: QuizOption[];
}

const EvaluationExecutionClient: React.FC<EvaluationExecutionClientProps> = ({
  quizId,
  isInteractive,
  isShuffled,
}) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [attemptId, setAttemptId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  // ✅ Función para barajar un array
  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadQuestions = async () => {
      try {
        const { questions, attemptId } = await fetchQuizQuestions(quizId);
        const processed = isShuffled
          ? questions.map((q) => ({
              ...q,
              options: shuffleArray(q.options),
            }))
          : questions;

        setQuestions(processed);
        setAttemptId(attemptId);
      } catch (err) {
        setError("Error cargando el cuestionario");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizId, isShuffled]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (isInteractive && answeredQuestions.has(questionId)) return;

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    if (isInteractive) {
      setAnsweredQuestions((prev) => new Set(prev).add(questionId));
    }
  };

  const handleFinishQuiz = async () => {
    if (!attemptId) {
      alert("No se pudo identificar el intento.");
      return;
    }

    const payload = {
      executionDate: new Date().toISOString(),
      questions: questions.map((q) => ({
        id: q.id,
        options: q.options.map((opt) => ({
          id: opt.id,
          isSelected: selectedAnswers[q.id] === opt.id,
        })),
      })),
    };

    try {
      const result = await sendQuizAnswers(attemptId, payload);
      router.push(`/evaluation/quiz/${result.quizId}/attempt/${result.attemptId}`);
    } catch (error) {
      alert("Ocurrió un error al enviar las respuestas.");
    }
  };

  if (loading) return <p>Cargando preguntas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  const getOptionClass = (
    question: Question,
    option: QuizOption,
    selectedOptionId: string | undefined
  ): string => {
    if (!isInteractive || !selectedOptionId) {
      return selectedOptionId === option.id
        ? "bg-blue-100 border-blue-500"
        : "border-gray-300";
    }

    if (answeredQuestions.has(question.id)) {
      if (option.answer.isCorrect) return "bg-green-100 border-green-500 text-green-800";
      if (option.id === selectedOptionId) return "bg-red-100 border-red-500 text-red-800";
      return "border-gray-300 opacity-60";
    }

    return selectedOptionId === option.id
      ? "bg-blue-100 border-blue-500"
      : "border-gray-300";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-800">Ejecutando Evaluación</h1>
          {isInteractive && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-300">
              🧠 Modo Interactivo
            </span>
          )}
        </div>
        <p className="text-gray-600">Responde todas las preguntas antes de finalizar.</p>
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const selectedOptionId = selectedAnswers[question.id];

          return (
            <div key={question.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {qIndex + 1}. {question.question}
              </h2>
              <div className="mt-2 space-y-2">
                {question.options.map((option, oIndex) => {
                  const isDisabled = isInteractive && answeredQuestions.has(question.id);
                  return (
                    <label
                      key={option.id}
                      className={`block p-2 border rounded-md cursor-pointer transition ${
                        getOptionClass(question, option, selectedOptionId)
                      } ${isDisabled ? "cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={selectedOptionId === option.id}
                        onChange={() => handleAnswerSelect(question.id, option.id)}
                        disabled={isDisabled}
                        className="mr-2"
                      />
                      <span className="font-semibold">{optionLabels[oIndex]}. </span>
                      {option.option}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Volver
        </button>
        <button
          onClick={handleFinishQuiz}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default EvaluationExecutionClient;
