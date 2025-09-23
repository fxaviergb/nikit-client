"use client";

import React, { useState } from "react";

interface EvaluationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    isInteractive: boolean,
    isShuffled: boolean,
    questionCount: number,
  ) => void;
}

const EvaluationConfigModal: React.FC<EvaluationConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isInteractive, setIsInteractive] = useState(true);
  const [isShuffled, setIsShuffled] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="mx-4 inline-block w-auto max-w-full rounded bg-white p-4 shadow-lg">
        {/* 🔹 Título alineado a la izquierda */}
        <h2 className="mb-3 text-left text-base font-semibold">
          Configuración
        </h2>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          {/* Flex responsive */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* Campo: Nº preguntas */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label
                htmlFor="questionCount"
                className="text-sm font-medium text-gray-700"
              >
                Preguntas
              </label>
              <select
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                {Array.from({ length: 18 }, (_, i) => i + 3).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo: Modo interactivo */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-700">
                Modo interactivo
              </span>
              <button
                onClick={() => setIsInteractive(!isInteractive)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${
                  isInteractive ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isInteractive ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Campo: Opciones aleatorias */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-700">
                Opciones aleatorias
              </span>
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${
                  isShuffled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isShuffled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm(isInteractive, isShuffled, questionCount);
              onClose();
            }}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Iniciar Evaluación
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationConfigModal;
