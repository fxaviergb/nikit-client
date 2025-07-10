"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchQuizQuestions, sendQuizAnswers } from "@/services/api";

interface EvaluationExecutionClientProps {
  quizId: string;
}

interface Question {
  id: string;
  question: string;
  options: { id: string; option: string }[];
}

const EvaluationExecutionClient: React.FC<EvaluationExecutionClientProps> = ({ quizId }) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [attemptId, setAttemptId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadQuestions = async () => {
      try {
        const { questions, attemptId } = await fetchQuizQuestions(quizId);
        setQuestions(questions);
        setAttemptId(attemptId);
      } catch (err) {
        setError("Error cargando el cuestionario");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizId]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
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

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']; // soporte adicional si hay más de 4

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Ejecutando Evaluación</h1>
        <p className="text-gray-600">Responde todas las preguntas antes de finalizar.</p>
      </div>

      <div className="space-y-6">
        {questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {qIndex + 1}. {question.question}
            </h2>
            <div className="mt-2 space-y-2">
              {question.options.map((option, oIndex) => (
                <label
                  key={option.id}
                  className={`block p-2 border rounded-md cursor-pointer ${
                    selectedAnswers[question.id] === option.id
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selectedAnswers[question.id] === option.id}
                    onChange={() => handleAnswerSelect(question.id, option.id)}
                    className="mr-2"
                  />
                  <span className="font-semibold">{optionLabels[oIndex]}. </span>
                  {option.option}
                </label>
              ))}
            </div>
          </div>
        ))}
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
