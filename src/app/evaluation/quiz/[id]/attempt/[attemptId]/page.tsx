import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AttemptReviewClient from "./AttemptReviewClient";

export const metadata: Metadata = {
  title: "Revisión del intento | NikIT",
  description: "Pantalla de revisión de un intento de evaluación",
};

const AttemptReviewPage = ({ params }: { params: { id: string; attemptId: string } }) => {
  return (
    <DefaultLayout>
      <AttemptReviewClient
        quizId={params.id}
        attemptId={params.attemptId}
      />
    </DefaultLayout>
  );
};

export default AttemptReviewPage;
