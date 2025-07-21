import { Metadata } from "next";
import ConstructorClient from "./ConstructorClient";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Constructor | NikIT",
  description: "Página para construir evaluaciones.",
};

const ConstructorPage = () => {
  return (
    <DefaultLayout>
      <ConstructorClient />
    </DefaultLayout>
  );
};

export default ConstructorPage;
