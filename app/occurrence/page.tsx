import { NewOccurrenceForm } from "@/components/occurrences/new-occurrence-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nova ocorrência",
};

export default function NewOccurrencePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <NewOccurrenceForm />
    </div>
  );
}

