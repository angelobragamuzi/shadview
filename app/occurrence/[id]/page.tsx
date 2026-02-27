"use client";

import { OccurrenceTimeline } from "@/components/occurrences/occurrence-timeline";
import { RatingForm } from "@/components/occurrences/rating-form";
import { CategoryBadge } from "@/components/occurrences/category-badge";
import { StatusBadge } from "@/components/occurrences/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeOccurrence } from "@/hooks/use-realtime-occurrence";
import { formatDate } from "@/lib/occurrence-utils";
import { fetchOccurrenceById } from "@/services/occurrence-service";
import type { OccurrenceWithRelations } from "@/types";
import { ExternalLink, LocateFixed, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function OccurrenceDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [occurrence, setOccurrence] = useState<OccurrenceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOccurrence = useCallback(async () => {
    if (!params.id) {
      return;
    }
    try {
      const data = await fetchOccurrenceById(params.id);
      setOccurrence(data);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadOccurrence();
  }, [loadOccurrence]);

  useRealtimeOccurrence({
    occurrenceId: params.id,
    onLogInsert: (log) => {
      toast.info("Atualização recebida no protocolo.");
      setOccurrence((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          occurrence_logs: [...(previous.occurrence_logs ?? []), log],
        };
      });
    },
    onOccurrenceUpdate: (updatedOccurrence) => {
      setOccurrence((previous) => (previous ? { ...previous, ...updatedOccurrence } : previous));
    },
  });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <p className="text-sm text-muted-foreground">Carregando protocolo...</p>
      </div>
    );
  }

  if (!occurrence) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-lg font-semibold text-blue-950">Protocolo não encontrado</p>
            <p className="text-sm text-muted-foreground">
              Verifique o identificador ou abra uma nova ocorrência.
            </p>
            <Button className="bg-blue-800 hover:bg-blue-700" asChild>
              <Link href="/occurrence">Registrar nova ocorrência</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportImages = (occurrence.occurrence_images ?? []).filter(
    (image) => image.image_type === "report",
  );
  const resolutionImages = (occurrence.occurrence_images ?? []).filter(
    (image) => image.image_type === "resolution",
  );

  const canRate =
    occurrence.status === "resolvido" &&
    !!user &&
    occurrence.user_id === user.id &&
    (occurrence.ratings?.length ?? 0) === 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <section className="rounded-xl border border-blue-100 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-700">Protocolo</p>
            <h1 className="text-3xl text-blue-950">{occurrence.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {occurrence.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={occurrence.category} />
              <StatusBadge status={occurrence.status} />
              <span className="rounded border bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
                {occurrence.id}
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-blue-950">Criada em:</span>{" "}
              {formatDate(occurrence.created_at)}
            </p>
            <p>
              <span className="font-semibold text-blue-950">Atualizada em:</span>{" "}
              {formatDate(occurrence.updated_at)}
            </p>
            <p>
              <span className="font-semibold text-blue-950">Bairro:</span>{" "}
              {occurrence.neighborhood ?? "Não informado"}
            </p>
            <p>
              <span className="font-semibold text-blue-950">SLA:</span>{" "}
              {occurrence.sla_deadline ? formatDate(occurrence.sla_deadline) : "Não definido"}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap gap-3 text-sm">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://www.google.com/maps?q=${occurrence.latitude},${occurrence.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <LocateFixed className="mr-2 h-4 w-4" />
              Ver local no mapa
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/occurrence">
              <ExternalLink className="mr-2 h-4 w-4" />
              Nova denúncia
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <OccurrenceTimeline logs={occurrence.occurrence_logs ?? []} userRole={profile?.role} />

          {canRate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Star className="mr-2 h-5 w-5 text-amber-500" />
                  Avaliar atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RatingForm occurrenceId={occurrence.id} userId={user?.id} onSuccess={loadOccurrence} />
              </CardContent>
            </Card>
          ) : null}

          {(occurrence.ratings?.length ?? 0) > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avaliação registrada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {occurrence.ratings?.map((rating) => (
                  <div key={rating.id} className="rounded-md border bg-muted/50 p-3 text-sm">
                    <p className="font-medium">Nota: {rating.rating}/5</p>
                    {rating.feedback ? (
                      <p className="mt-1 text-muted-foreground">{rating.feedback}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enviado em {formatDate(rating.created_at)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagens da solicitação</CardTitle>
            </CardHeader>
            <CardContent>
              {reportImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma imagem enviada.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {reportImages.map((image) => (
                    <a
                      key={image.id}
                      href={image.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-md border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt="Imagem da ocorrência"
                        className="h-28 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evidências de resolução</CardTitle>
            </CardHeader>
            <CardContent>
              {resolutionImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda não foram anexadas evidências da execução.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {resolutionImages.map((image) => (
                    <a
                      key={image.id}
                      href={image.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-md border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt="Imagem de resolução"
                        className="h-28 w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

