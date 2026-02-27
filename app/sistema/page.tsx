import type { Metadata } from "next";
import { SistemaLandingClient } from "./sistema-landing-client";

export const metadata: Metadata = {
  title: "Plataforma ShadBoard",
  description:
    "Interface moderna para gestão urbana com abertura pública, operação por mapa, SLA e relatórios executivos.",
};

export default function SistemaPage() {
  return <SistemaLandingClient />;
}
