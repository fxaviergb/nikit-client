import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import dynamic from "next/dynamic";

const EvaluationExecutionClient = dynamic(
  () => import("./EvaluationExecutionClient"),
  {
    ssr: false,
  },
);

export const metadata: Metadata = {
  title: "Evaluación Mixta | NikIT - Next.js Dashboard Template",
  description:
    "Página para ejecutar evaluaciones combinadas a partir de múltiples fuentes.",
};

const EvaluationMixedPage = () => {
  return (
    <DefaultLayout>
      <EvaluationExecutionClient />
    </DefaultLayout>
  );
};

export default EvaluationMixedPage;
