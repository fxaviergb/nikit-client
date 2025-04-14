import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EvaluationClient from "./EvaluationClient";
import { fetchTopics } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";

export const metadata: Metadata = {
  title: "Evaluation List | TailAdmin - Next.js Dashboard Template",
  description: "Esta es la página de evaluación, mostrando la lista de temas.",
};

const EvaluationPage = async () => {
  return (
    <DefaultLayout>
      <EvaluationClient />
    </DefaultLayout>
  );
};

export default EvaluationPage;
