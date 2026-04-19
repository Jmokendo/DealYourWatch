"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "./components/NotificationList";

function SkeletonItem() {
  return <div className="h-20 animate-pulse rounded-[16px] bg-zinc-100" />;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, remove } =
    useNotifications();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Centro de notificaciones
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900">
                Notificaciones
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onRemove={remove}
          />
        )}
      </main>
    </div>
  );
}
