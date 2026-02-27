import { CategoryBadge } from "@/components/occurrences/category-badge";
import { StatusBadge } from "@/components/occurrences/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/occurrence-utils";
import type { Occurrence } from "@/types";
import { MapPin } from "lucide-react";
import Link from "next/link";

export function OccurrenceCard({ occurrence }: { occurrence: Occurrence }) {
  return (
    <Card className="hover:border-blue-200 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CategoryBadge category={occurrence.category} />
          <StatusBadge status={occurrence.status} />
        </div>
        <CardTitle className="text-base leading-tight">{occurrence.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="line-clamp-2">{occurrence.description}</p>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-700" />
          <span>{occurrence.neighborhood ?? "Bairro não informado"}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>Criada em {formatDate(occurrence.created_at)}</span>
          <Link
            href={`/occurrence/${occurrence.id}`}
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Ver protocolo
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

