import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EvaluationQuizClient from "./EvaluationQuizClient";

export const metadata: Metadata = {
  title: "Evaluation Quiz | NikIT - Next.js Dashboard Template",
  description: "Página de evaluación de cuestionarios en TailAdmin.",
};

// Next.js proporciona `params` automáticamente cuando la ruta es dinámica
const EvaluationQuizPage = ({ params }: { params: { id: string } }) => {
  return (
    <DefaultLayout>
      <EvaluationQuizClient quizId={params.id} />
    </DefaultLayout>
  );
};

export default EvaluationQuizPage;
