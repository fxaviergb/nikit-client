import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EvaluationExecutionClient from "./EvaluationExecutionClient";

export const metadata: Metadata = {
  title: "Ejecutar Evaluación | NikIT - Next.js Dashboard Template",
  description: "Página para la ejecución de evaluaciones con preguntas de opción múltiple.",
};

const EvaluationExecutionPage = ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    interactive?: string;
    shuffled?: string;
    questionCount?: string;
  };
}) => {
  const isInteractive = searchParams.interactive === "true";
  const isShuffled = searchParams.shuffled === "true";
  const questionCount = searchParams.questionCount
    ? parseInt(searchParams.questionCount, 10)
    : undefined;

  return (
    <DefaultLayout>
      <EvaluationExecutionClient
        quizId={params.id}
        isInteractive={isInteractive}
        isShuffled={isShuffled}
        questionCount={questionCount}
      />
    </DefaultLayout>
  );
};

export default EvaluationExecutionPage;
