import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title:
    "NikIT",
  description: "Platform that processes content to create quizzes, flashcards, and personalized learning tools, optimizing study sessions and improving knowledge retention.",
};

export default function Home() {
  /*redirect("/auth/signin");
  return null;*/
  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
