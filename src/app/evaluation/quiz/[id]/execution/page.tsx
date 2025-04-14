import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EvaluationExecutionClient from "./EvaluationExecutionClient";

export const metadata: Metadata = {
  title: "Ejecutar Evaluación | TailAdmin - Next.js Dashboard Template",
  description: "Página para la ejecución de evaluaciones con preguntas de opción múltiple.",
};

// Componente del servidor que pasa `quizId` al cliente
const EvaluationExecutionPage = ({ params }: { params: { id: string } }) => {
  return (
    <DefaultLayout>
      <EvaluationExecutionClient quizId={params.id} />
    </DefaultLayout>
  );
};

export default EvaluationExecutionPage;
