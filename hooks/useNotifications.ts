"use client";

import { useCallback, useEffect, useState } from "react";

export interface AppNotification {
  id: string;
  type: "offer" | "message" | "accepted" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    type: "offer",
    title: "Nueva oferta",
    message: "Has recibido una oferta de $2,500 por tu Rolex Submariner",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    link: "/negotiations/123",
  },
  {
    id: "2",
    type: "message",
    title: "Nuevo mensaje",
    message: "Juan te ha enviado un mensaje sobre la negociación",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    link: "/negotiations/456",
  },
  {
    id: "3",
    type: "accepted",
    title: "¡Oferta aceptada!",
    message: "Tu oferta por el Omega Speedmaster ha sido aceptada",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    link: "/negotiations/789",
  },
  {
    id: "4",
    type: "system",
    title: "Bienvenido a DealYourWatch",
    message: "Empieza a comprar y vender relojes de lujo en LATAM",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
  },
];

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When a real API is wired up, fetch here instead.
    setNotifications(MOCK_NOTIFICATIONS);
    setLoading(false);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, remove };
}
