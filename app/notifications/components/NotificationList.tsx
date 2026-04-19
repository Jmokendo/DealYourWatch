"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import type { AppNotification } from "@/hooks/useNotifications";

interface NotificationListProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
}

export function NotificationList({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
        <Bell className="h-8 w-8 text-zinc-300" />
        <div>
          <p className="text-sm font-medium text-zinc-600">Sin notificaciones</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Cuando tengas actividad, te avisaremos acá.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {unreadCount} sin leer
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            Marcar todas como leídas
          </Button>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkAsRead={onMarkAsRead}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
