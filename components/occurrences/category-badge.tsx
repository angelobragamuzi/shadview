import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { OccurrenceCategory } from "@/types";

export function CategoryBadge({ category }: { category: OccurrenceCategory }) {
  return <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>;
}
