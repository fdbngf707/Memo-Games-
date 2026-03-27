import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Game {
  id: string;
  title: string;
  description: string;
  genre: string;
  imageUrl: string;
  releaseDate: string;
  downloadLink: string;
  trailerUrl: string;
  platform_links?: { platform: string; url: string }[];
  screenshots?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface MerchItem {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  link: string;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  date: string;
  isAdmin: boolean;
}

export interface ContactThread {
  id: string;
  name: string;
  email: string;
  subject: string;
  messages: Message[];
  status: "open" | "closed";
  createdAt: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  game: string;
  start_date: string;
  end_date: string;
  prize: string;
  max_participants: number;
  first_place_points: number;
  status: "open" | "ongoing" | "ended";
  image_url: string;
  rules?: string;
  submission_type?: "link" | "upload" | "external";
  submission_link?: string;
  allow_file_upload?: boolean;
}

export interface SiteStats {
  games_count: string;
  games_label: string;
  players_count: string;
  players_label: string;
  awards_count: string;
  awards_label: string;
  founded_count: string;
  founded_label: string;
}

interface AppState {
  isAdmin: boolean;
  games: Game[];
  news: NewsItem[];
  faqs: FaqItem[];
  merch: MerchItem[];
  threads: ContactThread[];
  competitions: Competition[];
  siteStats: SiteStats;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  addGame: (game: Omit<Game, "id">) => Promise<void>;
  removeGame: (id: string) => Promise<void>;
  updateGame: (id: string, game: Partial<Game>) => Promise<void>;
  addNews: (item: Omit<NewsItem, "id">) => Promise<void>;
  removeNews: (id: string) => Promise<void>;
  updateNews: (id: string, item: Partial<NewsItem>) => Promise<void>;
  addFaq: (item: Omit<FaqItem, "id">) => Promise<void>;
  removeFaq: (id: string) => Promise<void>;
  updateFaq: (id: string, item: Partial<FaqItem>) => Promise<void>;
  addMerch: (item: Omit<MerchItem, "id">) => Promise<void>;
  removeMerch: (id: string) => Promise<void>;
  updateMerch: (id: string, item: Partial<MerchItem>) => Promise<void>;
  addCompetition: (item: Omit<Competition, "id">) => Promise<void>;
  removeCompetition: (id: string) => Promise<void>;
  updateCompetition: (id: string, item: Partial<Competition>) => Promise<void>;
  createThread: (name: string, email: string, subject: string, message: string) => Promise<void>;
  replyToThread: (threadId: string, text: string, isAdmin: boolean) => Promise<void>;
  toggleThreadStatus: (threadId: string) => Promise<void>;
  removeThread: (id: string) => Promise<void>;
  fetchSiteStats: () => Promise<void>;
  updateSiteStats: (stats: Partial<SiteStats>) => Promise<void>;
}

const ADMIN_PASSWORD_HASH = "0adc4e35423a4a7eb3901242a82a11aa74f6eff6255dbcbe76efb8f1114cd496";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const loadState = () => {
  try {
    const s = localStorage.getItem("memo-games-state");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
};

const saved = loadState();

export const useAppStore = create<AppState>((set, get) => ({
  isAdmin: saved?.isAdmin ?? false,
  games: [],
  news: [],
  faqs: [],
  merch: [],
  threads: [],
  competitions: [],
  siteStats: { games_count: '4', games_label: 'Titles in catalog', players_count: '10K+', players_label: 'Active community', awards_count: '5+', awards_label: 'Industry recognition', founded_count: '2024', founded_label: 'Year established' },
  isLoading: true,
  fetchInitialData: async () => {
    try {
      const [gamesRes, newsRes, faqsRes, merchRes, threadsRes, compsRes] = await Promise.all([
        supabase.from('games').select('*').order('created_at', { ascending: false }),
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('created_at', { ascending: false }),
        supabase.from('merch').select('*').order('created_at', { ascending: false }),
        supabase.from('threads').select('*').order('createdAt', { ascending: false }),
        supabase.from('competitions').select('*').order('created_at', { ascending: false })
      ]);

      set({
        games: gamesRes.data || [],
        news: newsRes.data || [],
        faqs: faqsRes.data || [],
        merch: merchRes.data || [],
        threads: threadsRes.data || [],
        competitions: compsRes.data || [],
        isLoading: false
      });
      // Fetch site stats
      const statsRes = await supabase.from('site_stats').select('*').eq('id', 'main').single();
      if (statsRes.data) {
        const { id, ...stats } = statsRes.data;
        set({ siteStats: stats as SiteStats });
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      set({ isLoading: false });
    }
  },
  login: async (password: string) => {
    // Check rate limit first
    const now = Date.now();
    const rateLimitStr = localStorage.getItem("mg-admin-attempts");
    let rateLimit = rateLimitStr ? JSON.parse(rateLimitStr) : { count: 0, lastAttempt: 0 };
    
    // Reset if more than 15 minutes have passed
    if (now - rateLimit.lastAttempt > 15 * 60 * 1000) {
      rateLimit = { count: 0, lastAttempt: now };
    }

    if (rateLimit.count >= 5) {
      toast.error("Too many failed attempts. Try again in 15 minutes.");
      return false;
    }

    const hash = await hashPassword(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      // Success - reset attempts
      localStorage.setItem("mg-admin-attempts", JSON.stringify({ count: 0, lastAttempt: now }));
      set({ isAdmin: true });
      persist({ isAdmin: true });
      return true;
    }

    // Failure - increment attempts
    rateLimit.count += 1;
    rateLimit.lastAttempt = now;
    localStorage.setItem("mg-admin-attempts", JSON.stringify(rateLimit));
    
    return false;
  },
  logout: () => {
    set({ isAdmin: false });
    persist({ isAdmin: false });
  },
  addGame: async (game) => {
    // Try inserting with all fields; if new columns don't exist yet, retry without them
    let { data, error } = await supabase.from('games').insert([game]).select().single();
    if (error && (error.message.includes('platform_links') || error.message.includes('screenshots'))) {
      const { platform_links, screenshots, ...safeGame } = game as any;
      const retry = await supabase.from('games').insert([safeGame]).select().single();
      data = retry.data;
      error = retry.error;
      // Store the extra fields locally on success
      if (data) {
        data.platform_links = platform_links || [];
        data.screenshots = screenshots || [];
      }
    }
    if (!error && data) {
      set({ games: [data, ...get().games] });
      toast.success("Game added successfully!");
    } else if (error) {
      toast.error("Database error: " + error.message);
    }
  },
  removeGame: async (id) => {
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) {
      set({ games: get().games.filter((g) => g.id !== id) });
    }
  },
  updateGame: async (id, game) => {
    let { data, error } = await supabase.from('games').update(game).eq('id', id).select().single();
    if (error && (error.message.includes('platform_links') || error.message.includes('screenshots'))) {
      const { platform_links, screenshots, ...safeGame } = game as any;
      const retry = await supabase.from('games').update(safeGame).eq('id', id).select().single();
      data = retry.data;
      error = retry.error;
    }
    if (!error && data) {
      set({ games: get().games.map((g) => g.id === id ? { ...g, ...data } : g) });
      toast.success("Game updated!");
    } else if (error) toast.error("Update failed: " + error.message);
  },
  addNews: async (item) => {
    const { data, error } = await supabase.from('news').insert([item]).select().single();
    if (!error && data) {
      set({ news: [data, ...get().news] });
      toast.success("News added successfully!");
    } else if (error) {
      toast.error("Database error: " + error.message);
    }
  },
  removeNews: async (id) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (!error) {
      set({ news: get().news.filter((n) => n.id !== id) });
    }
  },
  updateNews: async (id, item) => {
    const { data, error } = await supabase.from('news').update(item).eq('id', id).select().single();
    if (!error && data) {
      set({ news: get().news.map((n) => n.id === id ? data : n) });
      toast.success("News updated!");
    } else if (error) toast.error("Update failed: " + error.message);
  },
  addFaq: async (item) => {
    const { data, error } = await supabase.from('faqs').insert([item]).select().single();
    if (!error && data) {
      set({ faqs: [data, ...get().faqs] });
      toast.success("FAQ added successfully!");
    } else if (error) {
      toast.error("Database error: " + error.message);
    }
  },
  removeFaq: async (id) => {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (!error) {
      set({ faqs: get().faqs.filter((f) => f.id !== id) });
    }
  },
  updateFaq: async (id, item) => {
    const { data, error } = await supabase.from('faqs').update(item).eq('id', id).select().single();
    if (!error && data) {
      set({ faqs: get().faqs.map((f) => f.id === id ? data : f) });
      toast.success("FAQ updated!");
    } else if (error) toast.error("Update failed: " + error.message);
  },
  addMerch: async (item) => {
    const { data, error } = await supabase.from('merch').insert([item]).select().single();
    if (!error && data) {
      set({ merch: [data, ...get().merch] });
      toast.success("Merch added successfully!");
    } else if (error) {
      toast.error("Database error: " + error.message);
    }
  },
  removeMerch: async (id) => {
    const { error } = await supabase.from('merch').delete().eq('id', id);
    if (!error) {
      set({ merch: get().merch.filter((m) => m.id !== id) });
    }
  },
  updateMerch: async (id, item) => {
    const { data, error } = await supabase.from('merch').update(item).eq('id', id).select().single();
    if (!error && data) {
      set({ merch: get().merch.map((m) => m.id === id ? data : m) });
      toast.success("Merch updated!");
    } else if (error) toast.error("Update failed: " + error.message);
  },
  addCompetition: async (item) => {
    let { data, error } = await supabase.from('competitions').insert([item]).select().single();
    if (error && error.message.includes('first_place_points')) {
      const { first_place_points, ...safeItem } = item as any;
      const retry = await supabase.from('competitions').insert([safeItem]).select().single();
      data = retry.data;
      error = retry.error;
      if (data) data.first_place_points = first_place_points || 0;
    }
    if (!error && data) {
      set({ competitions: [data, ...get().competitions] });
      toast.success("Competition added!");
    } else if (error) toast.error("Database error: " + error.message);
  },
  removeCompetition: async (id) => {
    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (!error) set({ competitions: get().competitions.filter((c) => c.id !== id) });
  },
  updateCompetition: async (id, item) => {
    let { data, error } = await supabase.from('competitions').update(item).eq('id', id).select().single();
    if (error && error.message.includes('first_place_points')) {
      const { first_place_points, ...safeItem } = item as any;
      const retry = await supabase.from('competitions').update(safeItem).eq('id', id).select().single();
      data = retry.data;
      error = retry.error;
    }
    if (!error && data) {
      set({ competitions: get().competitions.map((c) => c.id === id ? { ...c, ...data } : c) });
      toast.success("Competition updated!");
    } else if (error) toast.error("Update failed: " + error.message);
  },
  createThread: async (name, email, subject, message) => {
    const thread = {
      name,
      email,
      subject,
      status: "open",
      createdAt: new Date().toISOString(),
      messages: [{
        id: crypto.randomUUID(),
        from: name,
        text: message,
        date: new Date().toISOString(),
        isAdmin: false,
      }],
    };
    const { data, error } = await supabase.from('threads').insert([thread]).select().single();
    if (!error && data) {
      set({ threads: [data, ...get().threads] });
    }
  },
  replyToThread: async (threadId, text, isAdmin) => {
    const thread = get().threads.find(t => t.id === threadId);
    if (!thread) return;

    const newMessages = [...thread.messages, {
      id: crypto.randomUUID(),
      from: isAdmin ? "Memo Games" : thread.name,
      text,
      date: new Date().toISOString(),
      isAdmin,
    }];

    const { data, error } = await supabase.from('threads').update({ messages: newMessages }).eq('id', threadId).select().single();
    if (!error && data) {
      set({
        threads: get().threads.map((t) => t.id === threadId ? data : t)
      });

      // Open Gmail compose if it's an admin reply
      if (isAdmin) {
        const subject = encodeURIComponent(`Re: ${thread.subject}`);
        const body = encodeURIComponent(text);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${thread.email}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
        toast.success("Reply saved! Gmail opened — just hit Send.");
      }
    }
  },
  toggleThreadStatus: async (threadId) => {
    const thread = get().threads.find(t => t.id === threadId);
    if (!thread) return;

    const newStatus = thread.status === "open" ? "closed" : "open";
    const { data, error } = await supabase.from('threads').update({ status: newStatus }).eq('id', threadId).select().single();
    if (!error && data) {
      set({
        threads: get().threads.map((t) => t.id === threadId ? data : t)
      });
    }
  },
  removeThread: async (id) => {
    const { error } = await supabase.from('threads').delete().eq('id', id);
    if (!error) {
      set({ threads: get().threads.filter((t) => t.id !== id) });
    }
  },
  fetchSiteStats: async () => {
    const { data } = await supabase.from('site_stats').select('*').eq('id', 'main').single();
    if (data) {
      const { id, ...stats } = data;
      set({ siteStats: stats as SiteStats });
    }
  },
  updateSiteStats: async (stats) => {
    // Try upsert (creates row if it doesn't exist)
    const { error } = await supabase.from('site_stats').upsert({ id: 'main', ...stats });
    if (!error) {
      set({ siteStats: { ...get().siteStats, ...stats } });
      toast.success('Stats updated!');
    } else if (error.message.includes('42P01') || error.message.includes('relation') || error.code === '42P01') {
      // Table doesn't exist - save locally anyway
      set({ siteStats: { ...get().siteStats, ...stats } });
      toast.warning('Stats saved locally. Create the site_stats table in Supabase for persistence.');
    } else {
      toast.error('Failed to update stats: ' + error.message);
    }
  },
}));

function persist(state: Partial<AppState>) {
  // Only persisting isAdmin state locally now, everything else is in Supabase
  const current = loadState() || {};
  localStorage.setItem("memo-games-state", JSON.stringify({
    ...current,
    isAdmin: state.isAdmin ?? current.isAdmin,
  }));
}
