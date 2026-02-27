import { NewOccurrenceForm } from "@/components/occurrences/new-occurrence-form";
import { ProtocolLookupCard } from "@/components/occurrences/protocol-lookup-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nova ocorrência",
};

export default function NewOccurrencePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 md:px-6 md:py-10">
      <ProtocolLookupCard />
      <NewOccurrenceForm />
    </div>
  );
}
