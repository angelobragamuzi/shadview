"use client";

import { CategoryBadge } from "@/components/occurrences/category-badge";
import { StatusBadge } from "@/components/occurrences/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceWithRelations } from "@/types";
import { Check } from "lucide-react";

export function ProtocolQuickViewDialog({
  occurrence,
  open,
  onOpenChange,
}: {
  occurrence: OccurrenceWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recentLogs = [...(occurrence?.occurrence_logs ?? [])]
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
    .slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {occurrence ? (
          <>
            <DialogHeader>
              <DialogTitle>Protocolo {occurrence.id.slice(0, 10)}</DialogTitle>
              <DialogDescription>
                Visualização rápida sem sair da tela atual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{occurrence.title}</h3>
                <p className="text-sm text-muted-foreground">{occurrence.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={occurrence.category} />
                <StatusBadge status={occurrence.status} />
                <span className="rounded border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
                  {occurrence.id}
                </span>
              </div>

              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="font-medium text-foreground">Bairro:</span>{" "}
                  {occurrence.neighborhood ?? "Não informado"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Abertura:</span>{" "}
                  {formatDate(occurrence.created_at)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Atualização:</span>{" "}
                  {formatDate(occurrence.updated_at)}
                </p>
                <p>
                  <span className="font-medium text-foreground">SLA:</span>{" "}
                  {occurrence.sla_deadline
                    ? formatDate(occurrence.sla_deadline)
                    : "Não definido"}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Últimas atualizações</p>
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sem histórico disponível para este protocolo.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {recentLogs.map((log, index) => (
                      <li key={log.id} className="relative pl-6">
                        {/*
                          O primeiro item e o estado mais recente (ordem desc).
                          Itens anteriores (index > 0) aparecem como "marcados".
                        */}
                        {recentLogs.length > 1 && index > 0 ? (
                          <span className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-500/80 bg-emerald-500 text-[9px] text-white shadow-[0_0_0_3px] shadow-emerald-500/20">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        ) : (
                          <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border border-primary/50 bg-background shadow-[0_0_0_3px] shadow-primary/15" />
                        )}
                        {index < recentLogs.length - 1 ? (
                          <span className="absolute left-[6px] top-5 h-[calc(100%-0.35rem)] w-px bg-border/80" />
                        ) : null}

                        <div className="rounded-md border border-border/70 bg-muted/20 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={log.status} />
                            {log.is_internal ? (
                              <span className="rounded bg-foreground/90 px-2 py-0.5 text-[10px] font-medium text-background">
                                Interno
                              </span>
                            ) : null}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">
                            {log.comment?.trim() || "Atualização de status registrada."}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
