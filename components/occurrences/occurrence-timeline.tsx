import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceLog, UserRole } from "@/types";
import { StatusBadge } from "@/components/occurrences/status-badge";
import { canViewInternalLogs } from "@/services/role-service";
import { Check } from "lucide-react";

export function OccurrenceTimeline({
  logs,
  userRole,
}: {
  logs: OccurrenceLog[];
  userRole?: UserRole | null;
}) {
  const filteredLogs = logs
    .filter((log) => !log.is_internal || canViewInternalLogs(userRole))
    .sort(
      (left, right) =>
        new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Linha do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
        ) : (
          <ol className="space-y-4">
            {filteredLogs.map((log, index) => (
              <li key={log.id} className="relative pl-7">
                {/*
                  Aqui a ordem é ascendente (do mais antigo ao mais novo).
                  Todos os anteriores ao último são exibidos como "marcados".
                */}
                {filteredLogs.length > 1 && index < filteredLogs.length - 1 ? (
                  <span className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-emerald-500/80 bg-emerald-500 text-[9px] text-white shadow-[0_0_0_3px] shadow-emerald-500/20">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : (
                  <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border border-primary/50 bg-background shadow-[0_0_0_3px] shadow-primary/15" />
                )}
                {index < filteredLogs.length - 1 ? (
                  <span className="absolute left-[6px] top-5 h-[calc(100%-0.25rem)] w-px bg-border/80" />
                ) : null}

                <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-3">
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
                  {log.comment ? (
                    <p className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground/90">
                      {log.comment}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
