"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_LABELS } from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type NotificationLogRow = {
  id: string;
  status: keyof typeof STATUS_LABELS;
  comment: string | null;
  created_at: string;
  occurrence_id: string;
};

type NotificationItem = {
  id: string;
  status: keyof typeof STATUS_LABELS;
  comment: string | null;
  createdAt: string;
  occurrenceId: string | null;
  occurrenceTitle: string | null;
};

const LAST_SEEN_STORAGE_KEY = "dashboard_notifications_last_seen_at";

function mapNotificationRow(row: NotificationLogRow): NotificationItem {
  return {
    id: row.id,
    status: row.status,
    comment: row.comment,
    createdAt: row.created_at,
    occurrenceId: row.occurrence_id,
    occurrenceTitle: null,
  };
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function resolveLatestTimestamp(values: Array<string | null | undefined>) {
  let latestValue: string | null = null;
  let latestTimestamp = -Infinity;

  for (const value of values) {
    const parsed = parseTimestamp(value);
    if (parsed === null) {
      continue;
    }

    if (parsed > latestTimestamp) {
      latestTimestamp = parsed;
      latestValue = value ?? null;
    }
  }

  return latestValue ?? new Date().toISOString();
}

export function NotificationsMenu() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("occurrence_logs")
        .select(
          `
          id,
          status,
          comment,
          created_at,
          occurrence_id
        `,
        )
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        throw error;
      }

      const logs = ((data ?? []) as NotificationLogRow[]).map(mapNotificationRow);
      const occurrenceIds = Array.from(
        new Set(
          logs
            .map((item) => item.occurrenceId)
            .filter((occurrenceId): occurrenceId is string => Boolean(occurrenceId)),
        ),
      );

      let titleByOccurrenceId = new Map<string, string>();
      if (occurrenceIds.length > 0) {
        const { data: occurrencesData, error: occurrencesError } = await supabase
          .from("occurrences")
          .select("id, title")
          .in("id", occurrenceIds);

        if (occurrencesError) {
          throw occurrencesError;
        }

        titleByOccurrenceId = new Map(
          (occurrencesData ?? []).map((occurrence) => [occurrence.id, occurrence.title]),
        );
      }

      setItems(
        logs.map((item) => ({
          ...item,
          occurrenceTitle: item.occurrenceId
            ? titleByOccurrenceId.get(item.occurrenceId) ?? null
            : null,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_SEEN_STORAGE_KEY);
    setLastSeenAt(stored);
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  const unreadItems = useMemo(() => {
    if (!lastSeenAt) {
      return items;
    }

    const seenTime = parseTimestamp(lastSeenAt);
    if (seenTime === null) {
      return items;
    }

    return items.filter((item) => new Date(item.createdAt).getTime() > seenTime);
  }, [items, lastSeenAt]);

  const unreadCount = unreadItems.length;

  const persistLastSeenAt = useCallback((value: string) => {
    setLastSeenAt((previousValue) => {
      const nextValue = resolveLatestTimestamp([previousValue, value]);
      window.localStorage.setItem(LAST_SEEN_STORAGE_KEY, nextValue);
      return nextValue;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const optimisticMarker = resolveLatestTimestamp([
      new Date().toISOString(),
      unreadItems[0]?.createdAt,
      items[0]?.createdAt,
    ]);
    persistLastSeenAt(optimisticMarker);

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("occurrence_logs")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return;
    }

    const synchronizedMarker = resolveLatestTimestamp([optimisticMarker, data?.created_at]);
    persistLastSeenAt(synchronizedMarker);
  }, [items, persistLastSeenAt, unreadItems]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          {unreadCount > 0 ? <span className="text-xs text-primary">{unreadCount} novas</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <DropdownMenuItem disabled>Carregando notificações...</DropdownMenuItem>
        ) : unreadItems.length === 0 ? (
          <DropdownMenuItem disabled>Nenhuma notificação nova.</DropdownMenuItem>
        ) : (
          unreadItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex flex-col items-start gap-1 py-2"
              onSelect={() => {
                void markAllAsRead();
                router.push("/dashboard/occurrences");
              }}
            >
              <p className="line-clamp-1 text-sm font-medium">
                {item.occurrenceTitle ?? "Ocorrência atualizada"}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {item.comment?.trim() || `Status: ${STATUS_LABELS[item.status]}`}
              </p>
              <p className="text-[11px] text-muted-foreground/90">
                {formatTimestamp(item.createdAt)}
              </p>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void markAllAsRead();
            router.push("/dashboard/occurrences");
          }}
          className="justify-center"
        >
          <ExternalLink className="h-4 w-4" />
          Visualizar ocorrências
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void markAllAsRead()}
          className="justify-center text-primary"
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          Marcar como lidas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
