import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface UserNotification {
  id: string;
  user_email: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (email: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (email: string, title: string, message: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (email) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        set({
          notifications: data,
          unreadCount: data.filter((n) => !n.is_read).length,
        });
      }
    } catch {
      // Silently ignore if table doesn't exist yet
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const { notifications } = get();
    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (!error) {
      set({
        notifications: notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    if (notifications.length === 0) return;

    const email = notifications[0]?.user_email;
    if (!email) return;

    const { error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("user_email", email)
      .eq("is_read", false);

    if (!error) {
      set({
        notifications: notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      });
    }
  },

  addNotification: async (email, title, message) => {
    try {
      // Try to insert
      await supabase.from("user_notifications").insert({
        user_email: email,
        title,
        message,
        is_read: false,
      });

      // Current user check to refetch immediately if self-triggered
      const { data: { user } } = await supabase.auth.getUser();
      if (email === user?.email) {
         get().fetchNotifications(email);
      }
    } catch {
      // Silently ignore 404s if table missing
    }
  },
}));
