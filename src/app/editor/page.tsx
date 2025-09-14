import { Metadata } from "next";
import EditorClient from "./EditorClient";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Editor | NikIT",
  description: "Página para editar quizzes.",
};

const EditorPage = () => {
  return (
    <DefaultLayout>
      <EditorClient />
    </DefaultLayout>
  );
};

export default EditorPage;
