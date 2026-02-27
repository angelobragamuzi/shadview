import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { OccurrenceStatus } from "@/types";

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
