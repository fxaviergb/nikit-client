"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizQuestions, sendQuizAnswers } from "@/services/api";

interface EvaluationExecutionClientProps {
  quizId: string;
  isInteractive: boolean;
  isShuffled: boolean;
  questionCount?: number;
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
  questionCount,
}) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
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
        const { questions, attemptId } = await fetchQuizQuestions(
          quizId,
          questionCount,
        );
        const processed = isShuffled
          ? questions.map((q) => ({
              ...q,
              options: shuffleArray(q.options),
            }))
          : questions;

        setQuestions(processed as Question[]);
        setAttemptId(attemptId);
      } catch (err) {
        setError("Error cargando el cuestionario");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizId, isShuffled, questionCount]);

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
      router.push(
        `/evaluation/quiz/${result.quizId}/attempt/${result.attemptId}`,
      );
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
    selectedOptionId: string | undefined,
  ): string => {
    if (!isInteractive || !selectedOptionId) {
      return selectedOptionId === option.id
        ? "bg-blue-100 border-blue-500"
        : "border-gray-300";
    }

    if (answeredQuestions.has(question.id)) {
      if (option.answer.isCorrect)
        return "bg-green-100 border-green-500 text-green-800";
      if (option.id === selectedOptionId)
        return "bg-red-100 border-red-500 text-red-800";
      return "border-gray-300 opacity-60";
    }

    return selectedOptionId === option.id
      ? "bg-blue-100 border-blue-500"
      : "border-gray-300";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ejecutando Evaluación
          </h1>
          {isInteractive && (
            <span className="rounded-full border border-blue-300 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
              🧠 Modo Interactivo
            </span>
          )}
        </div>
        <p className="text-gray-600">
          Responde todas las preguntas antes de finalizar.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          const selectedOptionId = selectedAnswers[question.id];

          return (
            <div
              key={question.id}
              className="rounded-lg bg-white p-4 shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {qIndex + 1}. {question.question}
              </h2>
              <div className="mt-2 space-y-2">
                {question.options.map((option, oIndex) => {
                  const isDisabled =
                    isInteractive && answeredQuestions.has(question.id);
                  return (
                    <label
                      key={option.id}
                      className={`block cursor-pointer rounded-md border p-2 transition ${getOptionClass(
                        question,
                        option,
                        selectedOptionId,
                      )} ${isDisabled ? "cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={selectedOptionId === option.id}
                        onChange={() =>
                          handleAnswerSelect(question.id, option.id)
                        }
                        disabled={isDisabled}
                        className="mr-2"
                      />
                      <span className="font-semibold">
                        {optionLabels[oIndex]}.{" "}
                      </span>
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
          className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Volver
        </button>
        <button
          onClick={handleFinishQuiz}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default EvaluationExecutionClient;
