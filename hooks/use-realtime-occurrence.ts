"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Occurrence, OccurrenceLog } from "@/types";
import { useEffect } from "react";

interface UseRealtimeOccurrenceOptions {
  occurrenceId: string;
  onLogInsert?: (log: OccurrenceLog) => void;
  onOccurrenceUpdate?: (occurrence: Occurrence) => void;
}

export function useRealtimeOccurrence({
  occurrenceId,
  onLogInsert,
  onOccurrenceUpdate,
}: UseRealtimeOccurrenceOptions) {
  useEffect(() => {
    if (!occurrenceId) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
      .channel(`occurrence-${occurrenceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "occurrence_logs",
          filter: `occurrence_id=eq.${occurrenceId}`,
        },
        (payload) => {
          onLogInsert?.(payload.new as OccurrenceLog);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "occurrences",
          filter: `id=eq.${occurrenceId}`,
        },
        (payload) => {
          onOccurrenceUpdate?.(payload.new as Occurrence);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [occurrenceId, onLogInsert, onOccurrenceUpdate]);
}
