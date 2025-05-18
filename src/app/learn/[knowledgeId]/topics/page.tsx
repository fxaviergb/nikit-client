import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import TopicsClient from "./TopicsClient";

export const metadata: Metadata = {
  title: "Evaluation List | TailAdmin - Next.js Dashboard Template",
  description: "Esta es la página de evaluación, mostrando la lista de temas.",
};

const TopicsPage = ({ params }: { params: { knowledgeId: string } }) => {
  return (
    <DefaultLayout>
      <TopicsClient knowledgeId={params.knowledgeId} />
    </DefaultLayout>
  );
};

export default TopicsPage;
