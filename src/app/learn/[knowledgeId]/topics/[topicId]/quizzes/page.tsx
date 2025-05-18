import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import QuizzesClient from "./QuizzesClient";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Lista de cuestionarios para el tema seleccionado.",
};

const QuizzesPage = ({ params }: { params: { topicId: string } }) => {
  return (
    <DefaultLayout>
      <QuizzesClient topicId={params.topicId} />
    </DefaultLayout>
  );
};

export default QuizzesPage;
