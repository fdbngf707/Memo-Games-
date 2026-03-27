import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotificationStore } from "@/lib/notificationStore";

interface ShopItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  points_cost: number;
  download_link: string;
  created_at: string;
}

interface Purchase {
  id: string;
  user_email: string;
  item_id: string;
  purchased_at: string;
}

interface AuthState {
  user: { email: string } | null;
  userPoints: number;
  shopItems: ShopItem[];
  purchases: Purchase[];
  isAuthLoading: boolean;

  initAuth: () => void;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  verifyOtp: (email: string, token: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  verifyResetOtp: (email: string, token: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  fetchUserPoints: (email: string) => Promise<void>;
  fetchShopItems: () => Promise<void>;
  fetchPurchases: (email: string) => Promise<void>;

  // Admin actions
  addPointsToUser: (email: string, points: number) => Promise<void>;
  addShopItem: (item: Omit<ShopItem, "id" | "created_at">) => Promise<void>;
  removeShopItem: (id: string) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<boolean>;
  fetchAllUsers: () => Promise<{ email: string; points: number }[]>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userPoints: 0,
  shopItems: [],
  purchases: [],
  isAuthLoading: true,

  initAuth: () => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email || null;
      set({ user: email ? { email } : null, isAuthLoading: false });
      if (email) {
        get().fetchUserPoints(email);
        get().fetchPurchases(email);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      set({ user: email ? { email } : null, isAuthLoading: false });
      if (email) {
        get().fetchUserPoints(email);
        get().fetchPurchases(email);
      } else {
        set({ userPoints: 0, purchases: [] });
      }
    });

    get().fetchShopItems();
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
      return false;
    }
    // Create a points row for the new user
    await supabase.from("user_points").upsert({ email, points: 0 }, { onConflict: "email" });
    toast.success("Check your email for a verification code!");
    return true;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // If the user hasn't confirmed their email, provide a clear message
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email first. Check your inbox for the 6-digit code.");
      } else {
        toast.error(error.message);
      }
      return false;
    }
    toast.success("Welcome back!");
    return true;
  },

  verifyOtp: async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      return false;
    }
    toast.success("Email verified! Welcome to Memo Games! 🎮");
    return true;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("A reset code has been sent to your email!");
    return true;
  },

  verifyResetOtp: async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) {
      toast.error("Invalid or expired code. Please try again.");
      return false;
    }
    return true;
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Failed to update password: " + error.message);
      return false;
    }
    toast.success("Password updated successfully! You can now log in.");
    return true;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, userPoints: 0, purchases: [] });
    toast.success("Signed out");
  },

  fetchUserPoints: async (email) => {
    const { data } = await supabase.from("user_points").select("points").eq("email", email).single();
    if (data) set({ userPoints: data.points });
  },

  fetchShopItems: async () => {
    const { data } = await supabase.from("shop_items").select("*").order("created_at", { ascending: false });
    if (data) set({ shopItems: data as ShopItem[] });
  },

  fetchPurchases: async (email) => {
    const { data } = await supabase.from("purchases").select("*").eq("user_email", email);
    if (data) set({ purchases: data as Purchase[] });
  },

  addPointsToUser: async (email, points) => {
    const { data: existing } = await supabase.from("user_points").select("points").eq("email", email).single();
    if (existing) {
      const { error } = await supabase.from("user_points").update({ points: existing.points + points }).eq("email", email);
      if (!error) {
        toast.success(`Added ${points} points to ${email} (now ${existing.points + points})`);
        useNotificationStore.getState().addNotification(email, "Points Awarded! 🎉", `An admin has awarded you ${points} points. Your new balance is ${existing.points + points}.`);
      } else toast.error("Failed: " + error.message);
    } else {
      const { error } = await supabase.from("user_points").insert({ email, points });
      if (!error) {
        toast.success(`Created user ${email} with ${points} points`);
        useNotificationStore.getState().addNotification(email, "Points Awarded! 🎉", `An admin has created your point wallet with a starting balance of ${points} points.`);
      } else toast.error("Failed: " + error.message);
    }
  },

  addShopItem: async (item) => {
    let { data, error } = await supabase.from("shop_items").insert([item]).select().single();
    if (error && error.message.includes('image_url')) {
      const { image_url, ...safeItem } = item as any;
      const retry = await supabase.from("shop_items").insert([safeItem]).select().single();
      data = retry.data;
      error = retry.error;
    }
    if (!error && data) {
      set({ shopItems: [data as ShopItem, ...get().shopItems] });
      toast.success("Shop item added!");
    } else if (error) {
      toast.error("Failed: " + error.message);
    }
  },

  removeShopItem: async (id) => {
    const { error } = await supabase.from("shop_items").delete().eq("id", id);
    if (!error) {
      set({ shopItems: get().shopItems.filter((i) => i.id !== id) });
      toast.success("Item removed");
    }
  },

  purchaseItem: async (itemId) => {
    const { user, userPoints, shopItems, purchases } = get();
    if (!user) { toast.error("Please log in first"); return false; }

    const item = shopItems.find((i) => i.id === itemId);
    if (!item) { toast.error("Item not found"); return false; }

    if (purchases.some((p) => p.item_id === itemId)) {
      toast.error("You already own this item");
      return false;
    }

    if (userPoints < item.points_cost) {
      toast.error(`Not enough points! You need ${item.points_cost} but have ${userPoints}`);
      return false;
    }

    const newPoints = userPoints - item.points_cost;
    const { error: pointsError } = await supabase.from("user_points").update({ points: newPoints }).eq("email", user.email);
    if (pointsError) { toast.error("Failed to deduct points"); return false; }

    const { data: purchase, error: purchaseError } = await supabase.from("purchases").insert({ user_email: user.email, item_id: itemId }).select().single();
    if (purchaseError) { toast.error("Failed to record purchase"); return false; }

    set({
      userPoints: newPoints,
      purchases: [...purchases, purchase as Purchase],
    });

    useNotificationStore.getState().addNotification(
      user.email,
      "Purchase Successful! 🛒",
      `You successfully bought "${item.title}" for ${item.points_cost} points. You can always access your download using this link: ${item.download_link}`
    );

    toast.success(`Purchased "${item.title}"! Redirecting to download...`);
    window.open(item.download_link, "_blank");
    return true;
  },

  fetchAllUsers: async () => {
    const { data } = await supabase.from("user_points").select("email, points").order("points", { ascending: false });
    return (data as { email: string; points: number }[]) || [];
  },
}));
