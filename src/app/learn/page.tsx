import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LearnClient from "./LearnClient";
import { fetchTopics } from "@/services/api";
import { GenericListItem } from "@/types/generic-list-item";

export const metadata: Metadata = {
  title: "Learning List | TailAdmin - Next.js Dashboard Template",
  description: "Esta es la página de aprendizaje.",
};

const LearnPage = async () => {
  return (
    <DefaultLayout>
      <LearnClient />
    </DefaultLayout>
  );
};

export default LearnPage;
