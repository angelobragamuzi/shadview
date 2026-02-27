import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/occurrence-utils";
import type { OccurrenceLog, UserRole } from "@/types";
import { StatusBadge } from "@/components/occurrences/status-badge";
import { canViewInternalLogs } from "@/services/role-service";

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
          <ol className="relative ml-3 border-l border-border pl-6">
            {filteredLogs.map((log) => (
              <li key={log.id} className="mb-6 last:mb-0">
                <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border border-primary/40 bg-primary/30" />
                <div className="space-y-2">
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
                    <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground/90">
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
