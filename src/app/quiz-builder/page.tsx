import { Metadata } from "next";
import ConstructorClient from "./ConstructorClient";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Quiz Builder | NikIT",
  description: "Página para construir quizzes.",
};

const ConstructorPage = () => {
  return (
    <DefaultLayout>
      <ConstructorClient />
    </DefaultLayout>
  );
};

export default ConstructorPage;
