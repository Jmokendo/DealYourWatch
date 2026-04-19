"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/hooks/useNotifications";

const TYPE_ICONS: Record<AppNotification["type"], string> = {
  offer: "💰",
  message: "💬",
  accepted: "✅",
  system: "🔔",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-[16px] border border-zinc-200 bg-white p-4 transition",
        !notification.read && "border-blue-100 bg-blue-50/40",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg">
        {TYPE_ICONS[notification.type]}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-900">
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">
          {notification.message}
        </p>
        <p className="text-xs text-zinc-400">{formatDate(notification.createdAt)}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        {notification.link && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <Link href={notification.link}>
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Abrir</span>
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0 text-zinc-400 hover:text-zinc-700"
          onClick={() => onRemove(notification.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>
    </div>
  );
}
